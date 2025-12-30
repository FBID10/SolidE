import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, fetchCurrentUser } from '../data/api';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      // Ensure ProtectedRoute waits for validation when token changes
      setLoading(true);

      if (token) {
        try {
          const currentUser = await fetchCurrentUser();
          if (currentUser.role === 'ROLE_ADMIN') {
            setUser(currentUser);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          logout();
        }
      } else {
        // No token present -> ensure user is cleared
        setUser(null);
      }

      if (!cancelled) setLoading(false);
    };

    validateToken();
    return () => { cancelled = true; };
  }, [token]);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setToken(data.jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};