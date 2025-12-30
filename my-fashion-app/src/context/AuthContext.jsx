import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      // If there is no token, just finish loading
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Debug: log token info (masked) to help trace malformed tokens
      try {
        const masked = String(token).length > 20 ? String(token).slice(0, 6) + '...' + String(token).slice(-6) : token;
        console.debug('AuthContext.initializeAuth - token present (masked):', masked);
      } catch (e) {
        console.debug('AuthContext.initializeAuth - token present (could not mask)');
      }

      // Defensive: if the stored token is not a JWT (doesn't contain exactly two '.'),
      // clear it to avoid sending malformed tokens to backend which triggers JWT validation errors.
      try {
        if (typeof token === 'string' && token.split('.').length !== 3) {
          console.warn('AuthContext: stored token is not a JWT, clearing authToken from localStorage.');
          localStorage.removeItem('authToken');
          setToken(null);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('AuthContext: error while validating token format, clearing token.', e);
        localStorage.removeItem('authToken');
        setToken(null);
        setIsLoading(false);
        return;
      }

      if (token) {
        try {
          const response = await fetch('http://localhost:9090/api/users/me', {
            // Note: This check *requires* a token
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const loginResponse = await fetch('http://localhost:9090/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed. Please check your credentials.');
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.jwtToken;

    const profileResponse = await fetch('http://localhost:9090/api/users/me', {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Could not fetch user profile after login.');
    }

    const userData = await profileResponse.json();

    localStorage.setItem('authToken', authToken);
    setCurrentUser(userData);
    setToken(authToken);

    return userData;
  };

  // New: pre-register flow (no user is created yet)
  const preRegister = async (email, password, name) => {
    const resp = await fetch('http://localhost:9090/api/auth/pre-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!resp.ok) {
      let message = 'Pre-registration failed.';
      try { const data = await resp.json(); message = data.message || message; } catch {}
      throw new Error(message);
    }
    return true;
  };

  // New: confirm registration with email + token; sets auth token and profile
  const confirmRegister = async (email, tokenCode) => {
    const resp = await fetch('http://localhost:9090/api/auth/confirm-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: tokenCode }),
    });
    if (!resp.ok) {
      let message = 'Confirmation failed.';
      try { const data = await resp.json(); message = data.message || message; } catch {}
      throw new Error(message);
    }
    const { jwtToken } = await resp.json();
    localStorage.setItem('authToken', jwtToken);
    setToken(jwtToken);
    // fetch profile
    const profileResp = await fetch('http://localhost:9090/api/users/me', {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
    });
    if (profileResp.ok) {
      const userData = await profileResp.json();
      setCurrentUser(userData);
    }
    return true;
  };

  // Upgraded register function: registers then automatically logs in
  const register = async (email, password, name) => {
    // Step 1: Register the user
    const registerResponse = await fetch('http://localhost:9090/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Registration failed.');
    }

    // If registration is successful, you can proceed with login or other actions
    const registerData = await registerResponse.json();
    return registerData;
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  // Local fallback: mark user as authenticated without backend (used by verify/register UI when backend is down)
  const completeLocalAuth = (user) => {
    // For local/dev-only flows we should NOT persist a fake token. Persisting a non-JWT in
    // localStorage causes the backend to attempt validation and log the "must contain exactly 2 period characters" error.
    // Instead keep the authentication in-memory only (so refresh will lose it, which is acceptable for local dev flows).
    setCurrentUser(user);
    setToken(null);
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    register,
    preRegister,
    confirmRegister,
    isAuthenticated: !!currentUser,
    isLoading,
    // expose helper for UI flows that simulate auth in development
    completeLocalAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
