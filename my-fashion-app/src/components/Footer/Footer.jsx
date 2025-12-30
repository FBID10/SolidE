import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './ShopFooter.css';

import { FaInstagram, FaTiktok, FaFacebook, FaPinterest } from 'react-icons/fa';

export default function ModernFooter({ brandName = "Solid Design" }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Could not connect to the server. Please check your connection.');
      console.error('Subscription error:', error);
    }
  };

  return (
    <footer className="modern-footer">
      <div className="footer-highlight">
        <div className="footer-container">
          <div className="newsletter-section">
            <h2>Stay Update with Us</h2>
            <p>Get the latest on new arrivals, special offers, and seasonal trends.</p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
            {message && <p className={`feedback-message ${status}`}>{message}</p>}
          </div>
        </div>
      </div>


      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-main-content">
            <div className="footer-column brand-info">
              <h2 className="footer-brand">{brandName}</h2>
              <p className="brand-tagline">Modern apparel for the conscious individual. Redefining everyday style.</p>
            </div>
            <div className="footer-column">
              <h3>Shop</h3>
              <ul>
                <li><a href="/collections/new">New Arrivals</a></li>
                <li><a href="/collections/women">Women</a></li>
                <li><a href="/collections/men">Men</a></li>
                <li><a href="/collections/sale">Sale</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/sustainability">Sustainability</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Information</h3>
              <ul>
                <li>
                  <a href="/privacy" target="_blank"  rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </li>
                <li><a href="/sustainability">Terms and Conditions</a></li>
                <li><a href="/contact">Return Policy</a></li>
                <li><a href="/help/shipping">Shipping Policy</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Support</h3>
              <ul>
                <li><Link to="/account" target="_blank"  rel="noopener noreferrer">Track My Order</Link></li>
                <li><a href="/help/faq">FAQ</a></li>
                <li><a href="/help/returns">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} PnSLive Team.SLIIT. All Rights Reserved.</p>
            <div className="social-icons">
              <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://tiktok.com" aria-label="TikTok"><FaTiktok /></a>
              <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://pinterest.com" aria-label="Pinterest"><FaPinterest /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}