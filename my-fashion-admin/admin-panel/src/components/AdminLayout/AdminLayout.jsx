import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLayout.css';
import { FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">SOLID DESIGN</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaBoxOpen />
            <span>Products</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaShoppingCart />
            <span>Orders</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info">
            <p className="admin-name">{user?.name || 'Admin'}</p>
            <p className="admin-email">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        {/* The Outlet is where the child routes (Dashboard, Products) will be rendered */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;