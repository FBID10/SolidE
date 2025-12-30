import React, { useState } from "react";
import "./Navbar.css";
import { User } from "lucide-react";
import { FaCartShopping } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useCart } from "../../context/CartContext.jsx"; 

const shopItems = [
  { name: "Men", path: "/collections/men" },
  { name: "Women", path: "/collections/women" },
];

function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  // Ensure useCart() provides cartItems or handle potential undefined state
  const { cartItems = [] } = useCart() || {}; // default empty array

  // Calculate total items only if cartItems is an array
  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0; // Default to 0 if cartItems isn't an array

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/">SOLID DESIGN</Link>
      </div>

      <nav className="nav-links">
        <Dropdown title="Shop" items={shopItems} />
        <Link to="/track-order" className="nav-link-item">Track My Order</Link>
      </nav>

      <div className="search-container">
        <button onClick={handleSearch} className="search-button">
          <FaSearch size={20} color="#4f4f4fff" />
        </button>
        <input
          type="text"
          placeholder="Search products...."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div className="user-action">
        <Link to="/account" className="account-btn">
          <User size={30} color="#fff" />
        </Link>
        <Link to="/cart" className="cart-btn">
          <FaCartShopping size={30} color="#fff" />
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </Link>
      </div>
    </header>
  );
}

// Dropdown component remains the same
function Dropdown({ title, items = [] }) { // Added default empty array for items
  const [open, setOpen] = useState(false);
  return (
    <div
      className="dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="dropbtn">{title}</button>
      {open && (
        <div className="dropdown-content">
          {items.map((item) => (
            <Link key={item.name} to={item.path}>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Navbar;