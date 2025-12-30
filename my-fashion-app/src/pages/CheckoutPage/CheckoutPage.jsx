import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createOrder, uploadImageToCloudinary } from '../../data/api.js';
import { getImageUrl } from '../../data/imageUtils.js';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cartItems = [], clearCart } = useCart() || { cartItems: [], clearCart: () => {} }; 
  const { isAuthenticated, currentUser } = useAuth() || { isAuthenticated: false, currentUser: null }; 
  const navigate = useNavigate();

  // Helpers to support both shapes: server items (item.product.*) and guest items (item.product_* at top level)
  const getItemPrice = (item) => {
    const p = item?.product?.product_price;
    const alt = item?.product_price;
    const asNumber = (val) => {
      const n = typeof val === 'string' ? Number(val) : val;
      return Number.isFinite(n) ? n : 0;
    };
    return asNumber(p) || asNumber(alt);
  };
  const getItemName = (item) => item?.product?.product_name || item?.product_name || 'Unknown Product';
  const getItemImageUrl = (item) => {
    const product = item?.product;
    if (product) {
      const raw = (product.product_images && product.product_images.length > 0) ? product.product_images[0] : product.product_image;
      return getImageUrl(raw);
    }
    // guest/local shape fallbacks
    if (item?.product_images && item.product_images.length > 0) return getImageUrl(item.product_images[0]);
    if (item?.product_image) return getImageUrl(item.product_image);
    return '';
  };

  const [shippingDetails, setShippingDetails] = useState({
    firstName: '', lastName: '', address: '', phone: '', email: '',
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '', expiryDate: '', cvc: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cod' | 'bank-slip'
  const [bankSlipFile, setBankSlipFile] = useState(null);
  const [shippingFee, setShippingFee] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = Array.isArray(cartItems) ? cartItems.reduce((sum, item) => {
    const price = getItemPrice(item);
    const quantity = item.quantity || 0;
    return sum + price * quantity;
  }, 0) : 0;

  const finalTotal = subtotal + (shippingFee || 0);
  const freeShippingThreshold = 10000;

  useEffect(() => {
    if (subtotal >= freeShippingThreshold) {
      setShippingFee(0);
      return;
    }
    const calculateShipping = () => {
      const address = shippingDetails.address.toLowerCase();
      if (address.trim() === '') { setShippingFee(null); return; }
      if (address.includes('colombo') || address.includes('kandy')) { setShippingFee(250); }
      else if (address.includes('gampaha') || address.includes('kalutara')) { setShippingFee(300); }
      else { setShippingFee(400); }
    };
    calculateShipping();
  }, [shippingDetails.address, subtotal, freeShippingThreshold]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (!/^\d*$/.test(value)) { setPhoneError('Phone number can only contain digits.'); }
      else { setPhoneError(''); }
    }
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const isShippingFormValid =
    Object.values(shippingDetails).every(field => field && field.trim() !== '') &&
    phoneError === '';
  const isPaymentFormValid =
    paymentMethod === 'cod' || paymentMethod === 'bank-slip' ||
    (Object.values(paymentDetails).every(field => field && field.trim() !== ''));
  const isFormValid = isShippingFormValid && isPaymentFormValid && shippingFee !== null;

  // --- handlePlaceOrder (UPDATED) ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    // Redirect unauthenticated users to login/register
    if (!isAuthenticated || !currentUser) {
      navigate('/login?next=/checkout');
      return;
    }

    setIsProcessing(true);

    try {
      let paymentProofUrl = null;
      if (paymentMethod === 'bank-slip') {
        if (!bankSlipFile) {
          alert('Please upload a bank slip image for bank transfer payment.');
          setIsProcessing(false);
          return;
        }
        const uploadResult = await uploadImageToCloudinary(bankSlipFile);
        paymentProofUrl = uploadResult.secure_url || uploadResult.url || null;
      }
      // --- 1. Pass the shippingDetails state to createOrder ---
      const orderPayload = {
        firstName: shippingDetails.firstName,
        lastName: shippingDetails.lastName,
        address: shippingDetails.address,
        phone: shippingDetails.phone,
        email: shippingDetails.email,
        paymentMethod: paymentMethod,
        paymentProofUrl: paymentProofUrl,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: finalTotal,
      };
      const newOrder = await createOrder(orderPayload);

      if (newOrder && newOrder.id) {
        if (createAccount) {
          console.log("Simulating account creation for:", shippingDetails.email);
        }
        if (clearCart) clearCart(); 

        navigate(`/track-order?orderId=${newOrder.id}`);
      } else {
        console.error('Order created but unexpected response:', newOrder);
        alert('There was an issue placing your order. Please try again.');
        setIsProcessing(false);
        return;
      }

    } catch (error) {
      console.error("Failed to place order:", error);
      alert(`There was an issue placing your order: ${error.message || 'Please try again.'}`);
      setIsProcessing(false);
    }
  };
  // --- END UPDATE ---

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="checkout-empty-cart">
        <h2>Your cart is empty.</h2>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }


  return (
     <div className="checkout-page-container">
       <div className="checkout-layout">
         <div className="checkout-form-section">
           <h1 className="checkout-main-title">Checkout</h1>
           <form onSubmit={handlePlaceOrder}>
             <div className="shipping-form">
               <h2>Shipping Information</h2>
               <div className="form-grid">
                 <div className="form-group">
                   <label>First Name</label>
                   <input type="text" name="firstName" value={shippingDetails.firstName} onChange={handleShippingChange} required />
                 </div>
                 <div className="form-group">
                   <label>Last Name</label>
                   <input type="text" name="lastName" value={shippingDetails.lastName} onChange={handleShippingChange} required />
                 </div>
               </div>
               <div className="form-group">
                 <label>Address</label>
                 <input type="text" name="address" value={shippingDetails.address} onChange={handleShippingChange} placeholder="e.g., 123 Main St, Colombo" required />
               </div>
               <div className="form-grid">
                 <div className="form-group">
                   <label>Phone Number</label>
                   <input type="tel" name="phone" value={shippingDetails.phone} onChange={handleShippingChange} required className={phoneError ? 'input-error' : ''}/>
                   {phoneError && <p className="form-error-message">{phoneError}</p>}
                 </div>
                 <div className="form-group">
                   <label>Email</label>
                   <input type="email" name="email" value={shippingDetails.email} onChange={handleShippingChange} required />
                 </div>
               </div>
               <div className="create-account-check">
                 <input type="checkbox" id="createAccount" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                 <label htmlFor="createAccount">Create an account with these details?</label>
               </div>
             </div>

             <div className="payment-form">
               <h2>Payment Details</h2>

              <div className="payment-methods">
                <label>
                  <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card
                </label>
                <label>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
                </label>
                <label>
                  <input type="radio" name="paymentMethod" value="bank-slip" checked={paymentMethod === 'bank-slip'} onChange={() => setPaymentMethod('bank-slip')} /> Bank Slip (Upload)
                </label>
              </div>

              {paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" name="cardNumber" value={paymentDetails.cardNumber} onChange={handlePaymentChange} placeholder="•••• •••• •••• ••••" required/>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" name="expiryDate" value={paymentDetails.expiryDate} onChange={handlePaymentChange} placeholder="MM / YY" required/>
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <input type="text" name="cvc" value={paymentDetails.cvc} onChange={handlePaymentChange} placeholder="•••" required/>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'bank-slip' && (
                <div className="form-group">
                  <label>Upload Bank Slip Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setBankSlipFile(e.target.files[0])} required />
                </div>
              )}

              {paymentMethod === 'cod' && (
                <p>You will pay when the delivery arrives.</p>
              )}

             </div>

             <button type="submit" className="place-order-btn" disabled={!isFormValid || isProcessing}>
               {isProcessing ? 'Processing...' : `Place Order (Rs. ${finalTotal.toFixed(2)})`}
             </button>
           </form>
         </div>

         <aside className="checkout-summary-section">
           <h2>Order Summary</h2>
           <div className="summary-items-list">

             {cartItems.map(item => {
               const price = getItemPrice(item);
               const quantity = item.quantity || 0;
               const imageUrl = getItemImageUrl(item);
               const name = getItemName(item);

               return (
                 <div key={item.id} className="summary-item">
                   <img src={imageUrl} alt={name} />
                   <div className="summary-item-details">
                     <span>{name} (x{quantity})</span>
                   </div>
                   <span className="summary-item-price">Rs. {(price * quantity).toFixed(2)}</span>
                 </div>
               );
             })}

           </div>
           <div className="summary-totals">
             <div className="summary-total-row">
               <span>Subtotal</span>
               <span>Rs. {subtotal.toFixed(2)}</span>
             </div>
              <div className="summary-total-row">
               <span>Shipping</span>
               <span className={shippingFee === null ? 'shipping-placeholder' : ''}>
                 {shippingFee === null && 'Enter address'}
                 {shippingFee === 0 && 'Free'}
                 {shippingFee > 0 && `Rs. ${shippingFee.toFixed(2)}`}
               </span>
             </div>
              <div className="summary-total-row final">
               <span>Total</span>
               <span>Rs. {finalTotal.toFixed(2)}</span>
             </div>
           </div>
         </aside>
       </div>
     </div>
   );
}