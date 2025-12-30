import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import Flashsale from './components/Flashsale/Flashsale.jsx';
import Banner from './components/Banner/Banner.jsx';
import PrivateLabelBanner from './components/PrivateLabelBanner/PrivateLabelBanner.jsx';
import Footer from './components/Footer/Footer.jsx';
import FeaturedCollections from './components/FeaturedCollections/FeaturedCollections.jsx';
import PrivacyPolicy from './components/Information/PrivacyPolicy.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';

//Snow Effect
import Snowfall from "react-snowfall";
import './App.css'; 

//Pages
import ShopPage from './pages/ShopPage/ShopPage.jsx';
import SingleProductPage from './components/SingleProduct/SingleProductPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccountPage from './pages/AccountPage/AccountPage.jsx'; 
import LoginPage from './pages/LoginPage/LoginPage.jsx';     
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx'; 
import CartPage from './pages/CartPage/CartPage';
import OrderTrackingPage from './pages/OrderTrackingPage/OrderTrackingPage.jsx';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage.jsx';

// NEW: verification and forgot-password pages
import VerifyRegister from './pages/VerifyRegister/VerifyRegister.jsx';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx';

const HomePage = () => (
  <>
    <Hero />
    <Flashsale/>
    {/* <Card /> */}
    <Banner />
    <FeaturedCollections />
    <PrivateLabelBanner />
  </>
);

function App() {
  return (
    <div className="app-container">
      <Snowfall 
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: "none"
        }}
      />
      <Navbar />

      <ScrollToTop />


      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route path="/collections/:collectionName" element={<ShopPage />} /> 
          <Route path="/product/:productId" element={<SingleProductPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-register" element={<VerifyRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<CartPage />} />
          
          <Route path="/track-order" element={<OrderTrackingPage />} />
          
          <Route path="/checkout" element={<CheckoutPage />} />
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;