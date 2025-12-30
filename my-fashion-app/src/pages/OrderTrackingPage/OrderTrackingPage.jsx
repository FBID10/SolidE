import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaBox, FaCheckCircle, FaTruck, FaRegFileAlt, FaTimesCircle, FaSignInAlt, FaSearch } from 'react-icons/fa';
import { fetchOrderById } from '../../data/api.js';
import { getImageUrl } from '../../data/imageUtils.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './OrderTrackingPage.css';

// (Helper functions formatTimestamp and getStatusStep remain the same)
const formatTimestamp = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
};

const getStatusStep = (status) => {
    switch (status) {
        case 'PENDING': return 1;
        case 'SHIPPED': return 2;
        case 'DELIVERED': return 3;
        case 'CANCELED': return -1;
        default: return 0;
    }
};


export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId'); 
  const navigate = useNavigate();
  const location = useLocation(); 

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW: State for the lookup form ---
  const [lookupId, setLookupId] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      // Only try to load if an orderId is present in the URL
      if (orderId) {
        try {
          if (!order) setIsLoading(true); 
          setError(null);
          const data = await fetchOrderById(orderId); 
          if (data) {
              setOrder(data);
          } else {
              setError(`Order #${orderId} not found.`);
          }
        } catch (err) {
          console.error("Failed to fetch order:", err);
          setError(err.message); // Show the real error (e.g., "Permission denied")
          setOrder(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No orderId in URL, so just stop loading.
        setIsLoading(false); 
      }
    };

    // Check Auth before fetching
    if (!isAuthLoading) { 
        if (isAuthenticated) {
            loadOrder(); // User is logged in, attempt to load if orderId exists
        } else {
            setIsLoading(false); // User is not logged in
        }
    }

    // Live Polling
    const intervalId = setInterval(() => {
        setOrder(currentOrder => {
            if (isAuthenticated && currentOrder && currentOrder.status !== 'DELIVERED' && currentOrder.status !== 'CANCELED') {
                console.log("Polling for order status update...");
                loadOrder();
            }
            return currentOrder; 
        });
    }, 15000); 

    return () => clearInterval(intervalId);

  }, [orderId, isAuthenticated, isAuthLoading]); 

  // --- 1. Show Loading Spinner ---
  if (isLoading || isAuthLoading) {
    return <div className="track-page-container"><div className="track-loading">Loading Order Details...</div></div>;
  }

  // --- 2. Show Login Redirect (If not logged in) ---
  if (!isAuthenticated) {
    return (
        <div className="track-page-container track-lookup-container"> {/* Use new lookup style */}
            <div className="detail-card">
                <FaSignInAlt className="lookup-icon" /> 
                <h2>Please Log In</h2>
                <p>You must be logged in to view your order status.</p>
                <Link to="/login" state={{ from: location }} className="continue-shopping-btn">
                    Login to View Order
                </Link>
            </div>
        </div>
    );
  }

  // --- 3. Show Lookup Form (If logged in BUT no orderId in URL) ---
  if (!orderId) {
    const handleLookup = (e) => {
        e.preventDefault();
        if (lookupId) {
            navigate(`/track-order?orderId=${lookupId}`);
        }
    };

    return (
        <div className="track-page-container track-lookup-container">
            <div className="detail-card">
                <FaSearch className="lookup-icon" />
                <h2>Track Your Order</h2>
                <p>Please enter your Order ID below to find your order.</p>
                <form className="track-lookup-form" onSubmit={handleLookup}>
                  <input
                    type="text"
                    placeholder="Enter your Order ID (e.g., 14)"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value.trim())}
                  />
                  <button type="submit" className="continue-shopping-btn">Track Order</button>
                </form>
            </div>
        </div>
    );
  }

  // --- 4. Show Error (If logged in, orderId exists, but fetch failed) ---
  if (error || !order) {
    return (
      <div className="track-page-container track-not-found">
        <h2>Order Not Found</h2>
        <p>{error || `We couldn't find an order with the ID: ${orderId}.`}</p>
        <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
      </div>
    );
  }

  // --- 5. Show Canceled Message (If order is CANCELED) ---
  if (order.status === 'CANCELED') {
    return (
        <div className="track-page-container">
            <div className="track-header">
                <h1>Order Canceled</h1>
                <p className="track-order-id">Order #{order.id}</p>
            </div>
            <div className="detail-card canceled-card"> 
                <FaTimesCircle className="canceled-icon" />
                <h2>We're Sorry</h2>
                <p>Sorry, we have to cancel your order. Please contact customer support for more information.</p>
                <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
            </div>
        </div>
    );
  }
  
  // --- 6. Show Order Details (If everything is successful) ---
  const currentStatusStep = getStatusStep(order.status);
  const timelineStatuses = ['PENDING', 'SHIPPED', 'DELIVERED'];
  const timelineIcons = {
      'PENDING': <FaRegFileAlt />, 'SHIPPED': <FaTruck />, 'DELIVERED': <FaCheckCircle />,
  };
   const timelineLabels = {
      'PENDING': 'Order Placed', 'SHIPPED': 'Shipped', 'DELIVERED': 'Delivered',
  };

  return (
    <div className="track-page-container">
      <div className="track-header">
        <h1>Your Order Status</h1>
        <p className="track-order-id">Order #{order.id}</p>
      </div>
      
      <div className="track-content-grid">
        <div className="track-main-content">
            <div className="detail-card timeline-card">
                <h2>Order Timeline</h2>
                <div className="timeline-container">
                    {timelineStatuses.map((status, index) => {
                        const step = index + 1;
                        const isActive = currentStatusStep === step;
                        const isCompleted = currentStatusStep > step;
                        return (
                            <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                <div className="timeline-icon-container">
                                    {timelineIcons[status]}
                                </div>
                                <div className="timeline-label">
                                    <p><strong>{timelineLabels[status]}</strong></p>
                                    {status === 'PENDING' && <small>{formatTimestamp(order.orderDate)}</small>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="detail-card track-items-summary">
                <h3>Items in this Order</h3>
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="track-item">
                    <img
                       src={ item.product?.product_image ? getImageUrl(item.product.product_image) : '/vite.svg' }
                       alt={item.product?.product_name || 'Product'}
                       onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/vite.svg'}}
                    />
                     <div className="track-item-details">
                         <span className="track-item-name">{item.product?.product_name || 'Unknown Product'}</span>
                         <span>Qty: {item.quantity || 1}</span>
                     </div>
                     <span className="track-item-price">
                         Rs. {(item.price * item.quantity || 0).toFixed(2)}
                     </span>
                   </div>
                 ))}
            </div>
        </div>

        <div className="track-sidebar">
             <div className="detail-card">
               <h2>Shipping To</h2>
               <strong>{order.shippingFirstName} {order.shippingLastName}</strong>
               <p>{order.shippingAddress || 'N/A'}</p>
               <p>{order.shippingEmail || 'N/A'}</p>
               <p>{order.shippingPhone || 'N/A'}</p>
             </div>
             <div className="detail-card">
                <h2>Order Summary</h2>
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Rs. {(order.totalPrice || 0).toFixed(2)}</span>
                </div>
                 <div className="summary-row">
                    <span>Shipping</span>
                    <span>Included</span>
                </div>
                <div className="summary-row total">
                    <strong>Total</strong>
                    <strong>Rs. {(order.totalPrice || 0).toFixed(2)}</strong>
                </div>
             </div>
             <button className="continue-shopping-btn" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}