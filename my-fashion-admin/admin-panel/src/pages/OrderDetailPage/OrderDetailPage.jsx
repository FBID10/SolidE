import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById, updateOrderStatus } from '../../data/api.js';
import { getImageUrl } from '../../data/imageUtils.js';
import './OrderDetailPage.css';
import { FaFileImage } from 'react-icons/fa';
import Modal from '../../components/Modal/Modal.jsx';

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  const loadOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrderById(orderId);
      setOrder(data);
      setNewStatus(data.status);
    } catch (err) {
      setError('Failed to load order details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert('Order status updated successfully!');
      loadOrderDetails();
    } catch (err) {
      alert('Failed to update status.');
      console.error(err);
    }
  };

  if (isLoading) return <p>Loading order details...</p>;
  if (error) return <div className="error-state">{error}</div>;
  if (!order) return <p>Order not found.</p>;

  // Compute payment proof / bank slip URL using common field-name fallbacks
  const rawPaymentField = order.paymentProofUrl || order.payment_proof_url || order.bankSlipUrl || order.bank_slip || order.payment_slip_url || order.paymentSlip || order.payment_proof || '';
  const paymentImageUrl = rawPaymentField ? getImageUrl(rawPaymentField) : '';

  // small date formatter
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) { return iso; }
  };

  const statusClass = (s) => (s ? s.toLowerCase() : 'pending');

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/orders')}>
            &larr; Back
          </button>
        </div>
        <div className="page-header-center">
          <h1>Order #{order.id}</h1>
          <div className="order-meta">
            <span className={`status-badge ${statusClass(order.status)}`}>{order.status || 'PENDING'}</span>
            <small className="order-date">Placed: {formatDate(order.orderDate || order.createdAt || order.created_at)}</small>
          </div>
        </div>
        <div className="page-header-right">
          <div className="order-total">Total: <strong>Rs. {(order.totalPrice || 0).toFixed(2)}</strong></div>
        </div>
      </header>

      <div className="order-details-grid">
        <div className="detail-card">
          <h2>Customer Details</h2>
          {/* --- FIX: Read from the new shipping fields --- */}
          <p>
            <strong>Name:</strong> {order.shippingFirstName || ''} {order.shippingLastName || ''}
          </p>
          <p><strong>Email:</strong> {order.shippingEmail || 'N/A'}</p>
          <p><strong>Phone:</strong> {order.shippingPhone || 'N/A'}</p>
        </div>

        <div className="detail-card">
          <h2>Shipping Address</h2>
           {/* --- FIX: Read from the new shipping address field --- */}
          <p>{order.shippingAddress || 'N/A'}</p>
        </div>
        {/* --- END FIX --- */}

        <div className="detail-card">
          <h2>Payment</h2>
          <p><strong>Method:</strong> {order.paymentMethod || 'N/A'}</p>
          {paymentImageUrl && (
            <p className="payment-slip-link">
              <strong>Bank Slip:</strong>{' '}
              <a href={paymentImageUrl} target="_blank" rel="noopener noreferrer" title="Open bank slip in new tab" className="bank-slip-icon-link">
                <FaFileImage style={{ verticalAlign: 'middle', marginRight: '6px' }} /> View Slip
              </a>
            </p>
          )}
          {paymentImageUrl ? (
            <div className="payment-proof-preview">
              <p><strong>Payment Proof / Bank Slip:</strong></p>
              <div className="payment-proof-controls">
                <a href={paymentImageUrl} target="_blank" rel="noopener noreferrer" className="open-proof-link">Open image in new tab</a>
                <button type="button" className="bank-slip-icon-link" onClick={() => setIsSlipModalOpen(true)} aria-label="Preview bank slip">
                  <FaFileImage style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Preview
                </button>
              </div>

              {/* Small thumbnail to keep layout tidy */}
              <div className="payment-proof-image-wrapper">
                <img src={paymentImageUrl} alt={`Payment proof for order ${order.id}`} className="payment-proof-image" />
              </div>

              {/* Modal for full-size preview */}
              <Modal isOpen={isSlipModalOpen} onClose={() => setIsSlipModalOpen(false)} title={`Bank Slip - Order #${order.id}`}>
                <div style={{ textAlign: 'center' }}>
                  <img src={paymentImageUrl} alt={`Full bank slip for order ${order.id}`} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }} />
                </div>
              </Modal>
            </div>
          ) : (
            <p>No payment proof provided.</p>
          )}
        </div>

        <div className="detail-card status-card">
          <h2>Order Status</h2>
          <div className="status-update-form">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELED">Canceled</option>
            </select>
            <button className="add-btn" onClick={handleStatusUpdate}>Update Status</button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <h2>Order Items</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map((item) => (
              <tr key={item.id}>
                <td className="product-table-name">{item.product?.product_name || 'Unknown Product'}</td>
                <td>{item.quantity}</td>
                <td>Rs. {(item.price || 0).toFixed(2)}</td>
                <td>Rs. {(item.quantity * (item.price || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="order-total-row">
              <td colSpan="3">Total Amount</td>
              <td>Rs. {(order.totalPrice || 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OrderDetailPage;

