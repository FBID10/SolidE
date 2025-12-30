package com.example.solid.Cart;
import com.example.solid.Product.Product;
import com.example.solid.Product.ProductRepository;
import com.example.solid.User.User;
import com.example.solid.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CartItem> getAllItems() {
        return cartItemRepository.findAll();
    }

    public List<CartItem> getCartItemsByUserId(Long userId) {
        // Ensure user exists before fetching cart, or handle gracefully
        if (!userRepository.existsById(userId)) {
             throw new RuntimeException("User not found with ID: " + userId + " when fetching cart items.");
        }
        return cartItemRepository.findByUser_userId(userId);
    }

    // --- ADDED METHOD ---
    /**
     * Finds a single cart item by its ID.
     * @param cartItemId The ID of the CartItem.
     * @return The CartItem, or null if not found.
     */
    public CartItem getCartItemById(Long cartItemId) {
        // findById returns Optional, orElse(null) gets the item or null
        return cartItemRepository.findById(cartItemId).orElse(null);
    }
    // --- END ADDED METHOD ---

    @Transactional // Ensures the whole operation succeeds or fails together
    public CartItem addProductToCart(Long userId, Long productId, int quantity) {
        // Use orElseThrow for cleaner error handling if user/product not found
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        // Check if the product is already in the user's cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByUserAndProduct(user, product);

        if (existingCartItem.isPresent()) {
            // If exists, update quantity
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartItemRepository.save(cartItem);
        } else {
            // If new, create a new cart item
            CartItem newCartItem = new CartItem(user, product, quantity);
            return cartItemRepository.save(newCartItem);
        }
    }

    @Transactional // Ensures delete happens correctly
    public void removeProductFromCart(Long cartItemId) {
         // Check if item exists before trying to delete
         if (!cartItemRepository.existsById(cartItemId)) {
             throw new RuntimeException("CartItem not found with ID: " + cartItemId + " for deletion.");
         }
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional // Ensures update happens correctly
    public CartItem updateCartItem(Long cartItemId, int newQuantity) {
        // Find the item or throw an error if not found
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found with ID: " + cartItemId + " for update."));

        if (newQuantity <= 0) {
             // If quantity is zero or less, remove the item
            cartItemRepository.delete(cartItem);
            return null; // Indicate item was removed
        } else {
            // Otherwise, update the quantity
            cartItem.setQuantity(newQuantity);
            return cartItemRepository.save(cartItem);
        }
    }
}