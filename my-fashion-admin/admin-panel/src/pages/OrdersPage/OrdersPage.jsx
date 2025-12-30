import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../data/api.js'; 
import { getImageUrl } from '../../data/imageUtils.js';
import { FaEye } from 'react-icons/fa';
import './OrdersPage.css'; 

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders(); 
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    // --- FIX: Navigate to the correct route from your App.jsx ---
    navigate(`/orders/${orderId}`); 
  };

  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Order Management</h1>
      </header>
      
      <div className="table-wrapper">
        {isLoading ? <p>Loading orders...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Slip</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* This part is correct from our previous fix */}
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td className="customer-name">{order.user?.name || 'N/A'}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    {order.paymentProofUrl || order.payment_proof_url ? (
                      <img
                        src={getImageUrl(order.paymentProofUrl || order.payment_proof_url)}
                        alt={`Slip ${order.id}`}
                        className="order-slip-thumb"
                      />
                    ) : (
                      <span className="no-slip">—</span>
                    )}
                  </td>
                  <td>Rs. {(order.totalPrice || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="action-btn-view"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <FaEye /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;