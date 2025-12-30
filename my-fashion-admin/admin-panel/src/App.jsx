import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage.jsx';
import AdminLayout from './components/AdminLayout/AdminLayout.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx';

import OrdersPage from './pages/OrdersPage/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage.jsx';


function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />

            </Route>
          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;