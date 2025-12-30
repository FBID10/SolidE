import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserOrders } from '../../data/api.js';
import './AccountPage.css';

export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const loadOrders = async () => {
        try {
          setIsLoading(true);
          const allOrdersFromDb = await getUserOrders(currentUser.id);
          
          // --- NEW: Sort orders by date (newest first) and take the top 5 ---
          const sortedOrders = allOrdersFromDb.sort((a, b) => 
            new Date(b.orderDate) - new Date(a.orderDate) // Sort descending
          );
          const recentOrders = sortedOrders.slice(0, 5); // Get only the first 5

          setUserOrders(recentOrders); // <-- Store only the recent 5
          setError(null);
        } catch (err) {
          console.error("Failed to fetch user orders:", err);
          setError("Could not load your orders. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]); 

  const productImageUrl = (product) => {
    const img = product?.product_image || '';
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `http://localhost:9090${img}`;
  };

  if (currentUser) {
    return (
      <div className="account-page-wrapper">
        <div className="account-container">
          <h2>Welcome, {currentUser.name}</h2>
          <p>Email: {currentUser.email}</p>
          
          <div className="account-orders-section">
            <h3 className="account-section-title">My Recent Orders</h3> 
            
            {isLoading ? (
                <p>Loading orders...</p>
            ) : error ? (
                <p className="account-no-orders" style={{color: 'red'}}>{error}</p>
            ) : userOrders.length > 0 ? (
              <div className="account-orders-list"> 
                {userOrders.map(order => (
                  <Link 
                    to={`/track-order?orderId=${order.id}`} 
                    key={order.id} 
                    className="account-order-card"
                  >
                    <div className="order-card-info">
                      <span className="order-card-id">#{order.id}</span>
                      <span className={`order-card-status ${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-card-preview">
                        <img 
                          src={order.orderItems[0]?.product ? productImageUrl(order.orderItems[0].product) : ''}
                           alt={order.orderItems[0]?.product?.product_name || 'Order item'}
                        />
                        <span>
                          {order.orderItems[0]?.product?.product_name || 'Order Item'}
                          {order.orderItems.length > 1 ? ` + ${order.orderItems.length - 1} more` : ''}
                        </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="account-no-orders">You have no recent orders.</p>
            )}
          </div>

          <button onClick={logout} className="account-button secondary">Logout</button>
        </div>
      </div>
    );
  }

  // Logged-out view remains the same
  return (
    <div className="account-page-wrapper">
      <div className="account-container">
        <h2>My Account</h2>
        <div className="account-actions">
          <Link to="/login" className="account-button">Login</Link>
          <Link to="/register" className="account-button secondary">Create Account</Link>
        </div>
      </div>
    </div>
  );
}