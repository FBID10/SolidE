import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './RegisterPage.css';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // switch to preRegister for OTP-first flow
  const { preRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password is too weak. It must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await preRegister(email, password, `${firstName} ${lastName}`);
      const pending = { firstName, lastName, email, password };
      localStorage.setItem('pendingRegistration', JSON.stringify(pending));
      setSubmitted(true);
      navigate('/verify-register');
    } catch (err) {
      setError(err.message || 'Pre-registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Create Account</h2>
          {error && <p className="register-error">{error}</p>}

          {submitted && (
            <div style={{ background: '#e6fffa', padding: '10px', borderRadius: 8, marginBottom: 12 }}>
              <strong>Pending verification saved.</strong> We've stored your registration — go to <Link to="/verify-register">Verify Account</Link> and enter the 6-digit code we emailed you. If email delivery is slow, copy the code from the backend terminal logs.
            </div>
          )}

          <div className="register-field">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="register-field">
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="register-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="register-field">
            <label>Password</label>
            <small>Password must be at least 8 characters long.</small>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="register-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}