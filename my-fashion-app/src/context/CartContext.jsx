import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext.jsx'; // Ensure path is correct

// Renamed API function imports
import {
    getCartItems as apiGetCartItems,
    addToCart as apiAddToCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart
} from '../data/api.js'; // Ensure path is correct

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // 1. Load initial cart from localStorage ALWAYS
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  // Get authentication status and current user from AuthContext
  const { token, isAuthenticated, currentUser } = useAuth() || {};

  // --- REBUILT SYNC LOGIC ---

  const [isSyncing, setIsSyncing] = useState(false); // Lock to prevent sync collisions
  const hasSyncedOnLogin = useRef(false); // Ref to track if we've done the initial login merge

  // Effect 1: ALWAYS save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Effect 2: Handle merging and syncing cart on login/logout
  useEffect(() => {
    const syncCart = async () => {
      // --- User is NOT logged in ---
      if (!isAuthenticated) {
        hasSyncedOnLogin.current = false; 
        console.log("User logged out. Cart preserved in local storage.");
        return;
      }

      // --- User IS logged in ---
      if (isSyncing || hasSyncedOnLogin.current || !currentUser?.id) {
        return; 
      }

      // --- This is the FIRST sync after login ---
      setIsSyncing(true);
      try {
        console.log("User logged in. Syncing local and server carts...");
        
        // 1. Get local cart (current state)
        const localCart = cartItems; 
        
        // 2. Fetch server cart
        const serverCart = await apiGetCartItems(currentUser.id);
        if (!Array.isArray(serverCart)) throw new Error("Server cart is not an array");

        // 3. Find items that are in local (guest) cart but NOT on server
        const itemsToPush = localCart.filter(localItem => 
          // An item is "new" if it has no 'id' field (or if server doesn't have it)
          !localItem.id || !serverCart.some(serverItem => serverItem.id === localItem.id) 
        );

        // 4. Push new items to server
        if (itemsToPush.length > 0) {
          console.log("Pushing new guest items to server:", itemsToPush);
          await Promise.all(
            itemsToPush.map(item =>
              apiAddToCart(currentUser.id, item.product_id, item.quantity)
            )
          );
        }

        // 5. After push, fetch the *final, authoritative* cart from server
        const finalServerCart = await apiGetCartItems(currentUser.id);
        setCartItems(Array.isArray(finalServerCart) ? finalServerCart : []);
        console.log("Sync complete. Final cart:", finalServerCart);

      } catch (error) {
        console.error("Failed to sync cart on login:", error);
        // Fallback: just use server cart
        try {
           const serverCart = await apiGetCartItems(currentUser.id);
           setCartItems(Array.isArray(serverCart) ? serverCart : []);
        } catch (e) {
           setCartItems([]);
        }
      } finally {
        setIsSyncing(false);
        hasSyncedOnLogin.current = true;
      }
    };

    syncCart();
  }, [isAuthenticated, token, currentUser, isSyncing]);

  // --- END REBUILT SYNC LOGIC ---


  const addToCart = async (product, quantity, selectedColor, selectedSize) => {
    
    // --- FIX: Use a temporary ID for optimistic update ---
    const tempId = `temp-${Date.now()}`;
    const newItem = {
      // Use 'id' to be consistent with the backend item
      id: tempId, 
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: product.product_price,
      product_image: product.product_image,
      quantity,
      selectedColor,
      selectedSize,
      // We still need a composite key to check for *existing* items
      compositeKey: `${product.product_id}-${selectedColor}-${selectedSize}`
    };

    // Optimistic Update
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        (item.compositeKey && item.compositeKey === newItem.compositeKey) ||
        // Also check if a *real* item with this product/color/size exists
        (item.product_id === newItem.product_id && item.selectedColor === newItem.selectedColor && item.selectedSize === newItem.selectedSize)
      );

      if (existingItem) {
        // If item exists, just update its quantity (this will be handled by updateQuantity)
        console.log("Item exists, updating quantity.");
        updateQuantity(existingItem.id, existingItem.quantity + quantity);
        return prevItems; // Return previous state, updateQuantity will handle it
      } else {
        // Add the new item with its temporary ID
        return [...prevItems, newItem];
      }
    });
    // --- END FIX ---


    // Sync with backend if logged in
    if (isAuthenticated && currentUser?.id) {
      try {
        console.log(`API Call: Add to cart for user ${currentUser.id}`);
        
        // --- FIX: Get the real item back from the server ---
        const realCartItem = await apiAddToCart(currentUser.id, product.product_id, quantity);
        
        // --- FIX: Replace temporary item with real item ---
        setCartItems(prev => 
          prev.map(item => 
            item.id === tempId ? realCartItem : item
          )
        );
        console.log("Replaced temp item with real item:", realCartItem);

      } catch (error) {
        console.error("Failed to sync 'add to cart' with backend:", error);
        alert(`Could not save item to your account cart: ${error.message}`);
        // Revert: Remove the temporary item if API call fails
        setCartItems(prev => prev.filter(item => item.id !== tempId));
      }
    }
  };

  // --- FIX: This function now uses the database 'id' ---
  const removeFromCartItem = async (cartItemId) => {
    const itemExists = cartItems.some(item => item.id === cartItemId);
    if (!itemExists) {
      console.warn(`removeFromCartItem: Item ${cartItemId} not in local cart. Skipping.`);
      return;
    }

    setCartItems(prev => prev.filter(item => item.id !== cartItemId));

    // Do not send API call for temporary items
    if (isAuthenticated && currentUser?.id && (typeof cartItemId === 'number' || !String(cartItemId).startsWith('temp-'))) {
      try {
        await apiRemoveFromCart(cartItemId);
      } catch (error) {
        console.error("Failed to remove from backend cart:", error);
      }
    }
  };

  // --- FIX: This function now uses the database 'id' ---
  const updateQuantity = async (cartItemId, newQuantity) => {
    const itemExists = cartItems.some(item => item.id === cartItemId);
    if (!itemExists) {
      console.warn(`updateQuantity: Item ${cartItemId} not in local cart. Skipping update.`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCartItem(cartItemId);
      return;
    }
    
    setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

    // Do not send API call for temporary items
    if (isAuthenticated && currentUser?.id && (typeof cartItemId === 'number' || !String(cartItemId).startsWith('temp-'))) {
      try {
        await apiUpdateCartItem(cartItemId, newQuantity);
      } catch (error) {
        console.error("Failed to update backend cart item:", error);
      }
    }
  };

  const clearCart = () => {
    console.log("Clearing frontend cart state.");
    setCartItems([]);
  };

  // --- FIX: The UI needs to use 'item.id' for remove/update ---
  const value = { cartItems, addToCart, removeFromCart: removeFromCartItem, updateQuantity, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};