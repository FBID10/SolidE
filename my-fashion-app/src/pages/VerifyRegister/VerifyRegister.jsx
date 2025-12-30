/* eslint-disable import/no-unused-modules */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './VerifyRegister.css';

export default function VerifyRegister() {
  const navigate = useNavigate();
  const { confirmRegister, completeLocalAuth } = useAuth();
  const [pending, setPending] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('pendingRegistration');
    if (!raw) {
      navigate('/register');
      return;
    }
    setPending(JSON.parse(raw));
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // Normalize OTP: remove non-digits and trim
    const normalized = (otp || '').replace(/\D/g, '').trim();

    if (!/^[0-9]{6}$/.test(normalized)) {
      setError('Please enter the 6-digit verification code (numbers only).');
      return;
    }
    if (!pending) return;

    setLoading(true);
    try {
      if (localStorage.getItem('DEV_OFFLINE') === '1') {
        const user = { name: `${pending.firstName} ${pending.lastName}`.trim(), email: pending.email };
        completeLocalAuth(user);
        localStorage.removeItem('pendingRegistration');
        navigate('/account');
        return;
      }

      // Send the normalized code
      await confirmRegister(pending.email, normalized);
      localStorage.removeItem('pendingRegistration');
      navigate('/account');
    } catch (err) {
      console.error('Verification failed:', err);
      setError(err?.message || 'Verification failed. Check the code and try again.');
      setInfo('If the email did not arrive, copy the 6-digit code from backend terminal logs and enter it here.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pending) return;
    setError('');
    setInfo('');
    try {
      const resp = await fetch(`http://localhost:9090/api/auth/resend?email=${encodeURIComponent(pending.email)}`, { method: 'POST' });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Could not resend code.');
      }
      setInfo('Verification code resent. Check your inbox or the backend terminal logs.');
    } catch (e) {
      setError(e?.message || 'Failed to resend verification code.');
    }
  };

  const handleContinueLocally = () => {
    if (!pending) return;
    const user = { name: `${pending.firstName} ${pending.lastName}`.trim(), email: pending.email };
    completeLocalAuth(user);
    localStorage.removeItem('pendingRegistration');
    navigate('/account');
  };

  // New: clear stored data button
  const handleClearStorage = () => {
    localStorage.removeItem('pendingRegistration');
    localStorage.removeItem('authToken');
    localStorage.removeItem('DEV_OFFLINE');
    setPending(null);
    navigate('/register');
  };

  if (!pending) return null;

  return (
    <div className="verify-page-wrapper">
      <div className="verify-container">
        <form onSubmit={handleVerify} className="verify-form" noValidate>
          <h2>Verify your email</h2>
          <p>
            We've sent a 6-digit verification code to <strong>{pending.email}</strong>.
            If you didn't receive it, check the backend terminal logs for the code and enter it below.
          </p>
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
          {info && <p style={{ color: '#2563eb' }}>{info}</p>}

          <div className="verify-field">
            <label>Verification code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              inputMode="numeric"
              placeholder="Enter 6-digit code"
            />
          </div>

          <button className="verify-button" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify and continue'}
          </button>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
            <button type="button" onClick={handleResend} className="verify-button" style={{ background: '#2563eb' }}>
              Resend code
            </button>
            <button type="button" onClick={handleContinueLocally} className="verify-button" style={{ background: '#6b7280' }}>
              Continue without backend (local only)
            </button>
            <button type="button" onClick={handleClearStorage} className="verify-button" style={{ background: '#dc2626' }}>
              Clear local storage
            </button>
          </div>

          <p style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
            Developer hint: set localStorage.setItem('DEV_OFFLINE','1') to automatically skip backend.
          </p>
        </form>
      </div>
    </div>
  );
}
