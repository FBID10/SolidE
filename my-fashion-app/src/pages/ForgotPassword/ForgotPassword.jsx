import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: user provides email and clicks Send Code
  const handleSendCode = async (e) => {
    e?.preventDefault();
    setError('');
    setInfo('');
    if (!email) {
      setError('Please enter your email to receive the verification code.');
      return;
    }
    try {
      const resp = await fetch(`http://localhost:9090/api/auth/forgot-send-code?email=${encodeURIComponent(email)}`, { method: 'POST' });
      if (!resp.ok) {
        // We still proceed to the next step even if not-OK; the endpoint always tries to prevent enumeration
        console.warn('forgot-send-code returned non-OK');
      }
      setCodeSent(true);
      setInfo('We have sent a verification code to your email. Enter it below to reset your password.');
      localStorage.setItem('forgotEmail', email);
    } catch (err) {
      console.error('Failed to send code:', err);
      setError('Could not send verification code. Please try again.');
    }
  };

  // Step 2: verify OTP and set new password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // Normalize OTP: remove non-digits and trim
    const normalized = (otp || '').replace(/\D/g, '').trim();
    if (!/^[0-9]{6}$/.test(normalized)) {
      setError('Please enter the 6-digit verification code (numbers only).');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch('http://localhost:9090/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token: normalized }),
      });

      if (resp.ok) {
        try {
          await login(email, password);
          navigate('/account');
        } catch (loginErr) {
          console.warn('Auto-login after reset failed:', loginErr);
          navigate('/login');
        }
      } else {
        let message = 'Password reset failed.';
        try { const data = await resp.json(); message = data.message || message; } catch {}
        setError(message);
      }
    } catch (err) {
      console.warn('Reset password request failed:', err);
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    if (!email) return;
    try {
      await fetch(`http://localhost:9090/api/auth/forgot-send-code?email=${encodeURIComponent(email)}`, { method: 'POST' });
      setInfo('Verification code resent. Check your inbox.');
    } catch (e) {
      setError('Failed to resend verification code.');
    }
  };

  return (
    <div className="forgot-page-wrapper">
      <div className="forgot-container">
        {!codeSent ? (
          <form onSubmit={handleSendCode} className="forgot-form" noValidate>
            <h2>Reset password</h2>
            <p>Enter your email to receive a verification code.</p>
            {error && <p className="forgot-error">{error}</p>}
            {info && <p className="forgot-info">{info}</p>}

            <div className="forgot-field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <button type="submit" className="forgot-button">Send verification code</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form" noValidate>
            <h2>Enter verification code</h2>
            <p>We've sent a verification code to <strong>{email}</strong>.</p>
            {error && <p className="forgot-error">{error}</p>}
            {info && <p className="forgot-info">{info}</p>}

            <div className="forgot-field">
              <label>Verification code</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required inputMode="numeric" placeholder="6-digit code" />
            </div>

            <div className="forgot-field">
              <label>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="forgot-field">
              <label>Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button type="button" className="forgot-button" style={{ background: '#2563eb' }} onClick={handleResend}>Resend code</button>
            </div>

            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
