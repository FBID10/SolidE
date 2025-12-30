import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { fetchProducts } from '../../data/api.js';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import './CartPage.css';
import { getImageUrl } from '../../data/imageUtils.js';

// icons used in this component
import { FaShoppingCart, FaMinus, FaPlus, FaTrash, FaTag } from 'react-icons/fa';

import LeftBannerImage from '../../assets/leftbanner.png';
import RightBannerImage from '../../assets/rightbanner.png';

export default function CartPage() {
  const { cartItems = [], removeFromCart, updateQuantity, clearCart } = useCart() || { cartItems: [] };
  const navigate = useNavigate();
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  // --- NEW: State for coupon code ---
  const [couponCode, setCouponCode] = useState('');

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.product?.product_price === 'number' ? item.product.product_price : 0;
    const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const allProds = await fetchProducts();
        const cartProductIds = new Set(cartItems.map(item => item.product?.product_id));
        setSuggestedProducts(
          allProds
            .filter(p => !cartProductIds.has(p.product_id))
            .slice(0, 4)
        );
      } catch (error) {
        console.error("Failed to load suggested products:", error);
      }
    };
    if (cartItems.length > 0) {
        loadSuggestions();
    } else {
        setSuggestedProducts([]);
    }
  }, [cartItems]);

  const handleUpdateQuantity = (cartId, newQuantity) => {
    if (updateQuantity) {
        const quantityToUpdate = Math.max(0, newQuantity);
        if (quantityToUpdate === 0) {
            handleRemoveItem(cartId);
        } else {
            updateQuantity(cartId, quantityToUpdate);
        }
    }
  };

  const handleRemoveItem = (cartId) => {
    if (removeFromCart) {
        removeFromCart(cartId);
    }
  };

  const handleClearCart = () => {
    if (clearCart && window.confirm("Are you sure you want to clear your cart?")) {
        clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // --- NEW: Placeholder for coupon logic ---
  const handleApplyCoupon = (e) => {
      e.preventDefault(); // Prevent form submission if it's in a form
      if (!couponCode) return;
      // TODO: Add backend API call here to validate the coupon
      console.log("Applying coupon:", couponCode);
      alert(`Coupon "${couponCode}" applied! (Backend logic needed)`);
      // You would typically update the total based on the backend response here
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container cart-empty-container">
        <FaShoppingCart className="cart-empty-icon" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page-with-banners">
      <aside className="side-banner left-banner">
        <img src={LeftBannerImage} alt="Special Offer" />
      </aside>

      <div className="cart-page-container">
        <h1 className="cart-page-title">Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-main-column">
            <div className="cart-items-list">
              {cartItems.map((item) => {
                  const itemPrice = typeof item.product?.product_price === 'number' ? item.product.product_price : 0;
                  const itemQuantity = typeof item?.quantity === 'number' ? item.quantity : 0;
                  const lineItemTotal = itemPrice * itemQuantity;
                  const imageUrl = getImageUrl(item.product?.product_image);

                  return (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          {imageUrl ? <img src={imageUrl} alt={item.product?.product_name || 'Product'} /> : <div className="img-placeholder"></div>}
                        </div>
                        <div className="cart-item-details">
                          <span className="cart-item-name">{item.product?.product_name || 'Unknown Product'}</span>
                          <span className="cart-item-options">
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                            {item.selectedSize && ` Size: ${item.selectedSize}`}
                          </span>
                          <span className="cart-item-price">Rs. {itemPrice.toFixed(2)}</span>
                        </div>
                        <div className="cart-item-quantity">
                          <button onClick={() => handleUpdateQuantity(item.id, itemQuantity - 1)} aria-label="Decrease quantity"><FaMinus /></button>
                          <span>{itemQuantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, itemQuantity + 1)} aria-label="Increase quantity"><FaPlus /></button>
                        </div>
                        <div className="cart-item-total">Rs. {lineItemTotal.toFixed(2)}</div>
                        <button className="cart-item-remove" onClick={() => handleRemoveItem(item.id)} aria-label="Remove item"><FaTrash /></button>
                    </div>
                  );
              })}
            </div>

            {suggestedProducts.length > 0 && (
              <section className="cart-suggestions-section">
                <h2 className="cart-suggestions-title">You Might Also Like</h2>
                <div className="cart-suggestions-grid">
                  {suggestedProducts.map(product => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="cart-summary"> {/* This is the order summary */}
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {/* --- NEW: Coupon Input Section --- */}
            <div className="coupon-section">
                <label htmlFor="coupon-code">Have a Coupon?</label>
                <div className="coupon-input-group">
                    <FaTag className="coupon-icon"/>
                    <input
                        type="text"
                        id="coupon-code"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button onClick={handleApplyCoupon} className="coupon-apply-btn">Apply</button>
                </div>
            </div>
            {/* --- END NEW --- */}
            <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
            </div>
            {/* Optional: Add Discount Row here if coupon is applied */}
            {/* <div className="cart-summary-row discount"><span>Discount</span><span>- Rs. XX.XX</span></div> */}
            <div className="cart-summary-total">
                <span>Total</span>
                {/* TODO: Update this total when discount is applied */}
                <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <button className="cart-checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
            </button>
            <button className="clear-cart-button" onClick={handleClearCart}>
                Clear Cart
            </button>
          </aside>
        </div>
      </div>

      <aside className="side-banner right-banner">
        <img src={RightBannerImage} alt="Limited Time Deal" />
      </aside>
    </div>
  );
}