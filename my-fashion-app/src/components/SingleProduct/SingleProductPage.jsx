import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- 1. REMOVE mockProducts ---
// import { mockProducts } from '../../data/mockProducts.js';
// --- 2. ADD fetchProductById ---
import { fetchProductById } from '../../data/api.js'; // Adjust path if needed
import { getImageUrl } from '../../data/imageUtils.js';
import { FaCcVisa, FaCcMastercard, FaMoneyBillWave, FaShippingFast } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import './SingleProductPage.css';

// --- Helper function to parse attribute strings (copied from ShopPage) ---
const parseAttributeString = (attr) => {
    if (!attr) return [];
    if (Array.isArray(attr)) return attr;
    try {
        const parsed = JSON.parse(attr);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) { /* Ignore */ }
    // Fallback for comma-separated or single value strings
    return String(attr).split(',').map(item => item.trim()).filter(Boolean);
};

export default function SingleProductPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // --- 3. ADD State for product, loading, and error ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for selections
  const [mainImage, setMainImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // --- 4. ADD useEffect to fetch data ---
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
          setError("No product ID specified.");
          setLoading(false);
          return;
      }
      try {
        setLoading(true);
        setError(null);
        const productData = await fetchProductById(productId);
        setProduct(productData);

        // --- Set initial selections based on fetched data ---
        if (productData) {
            const colors = parseAttributeString(productData.product_colors || productData.product_color);
            const sizes = parseAttributeString(productData.product_sizes || productData.product_size);
            // Prefer product_images array when available
            const initialImages = (productData.product_images && productData.product_images.length > 0)
              ? productData.product_images.map(p => getImageUrl(p))
              : (productData.product_image ? [getImageUrl(productData.product_image)] : []);

            setMainImage(initialImages[0] || '');
            setSelectedColor(colors[0] || ''); // Default to first color
            setSelectedSize(sizes[0] || '');   // Default to first size
        } else {
            setError("Product not found."); // Handle case where API returns null/empty
        }

      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Product not found or there was an error loading the data.");
        setProduct(null); // Clear product data on error
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]); // Re-run if productId changes

  // --- Handlers remain mostly the same, but check product state ---
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedColor, selectedSize); // Pass selected options
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, 1, selectedColor, selectedSize); // Pass selected options
    navigate('/checkout');
  };

  // --- 5. ADD Loading and Error states ---
  if (loading) {
    return <div className="loading-container">Loading Product...</div>;
  }
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  if (!product) {
    return <div className="error-container">Product not found!</div>;
  }

  // --- Prepare data for rendering using helper ---
  // Build an array of image URLs from product_images or product_image
  const allImages = (product.product_images && product.product_images.length > 0)
    ? product.product_images.map(p => getImageUrl(p))
    : (product.product_image ? [getImageUrl(product.product_image)] : []);

  const sizes = parseAttributeString(product.product_sizes || product.product_size);
  const colors = parseAttributeString(product.product_colors || product.product_color);

  return (
    <div className="spp-container">
      <div className="spp-layout">
        <div className="spp-gallery">
          <div className="spp-main-image-wrapper">
            {mainImage ? (
                <img src={mainImage} alt={`${product.product_name} - ${selectedColor}`} className="spp-main-image" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/vite.svg'}} />
             ) : (
                <div className="spp-main-image-placeholder">No Image</div>
             )}
          </div>
          {/* Thumbnail gallery now uses allImages */}
          <div className="spp-thumbnail-gallery">
            {allImages.map((imgSrc, index) => (
               imgSrc && (
                 <div
                   key={index}
                   className={`spp-thumbnail ${mainImage === imgSrc ? 'active' : ''}`}
                   onClick={() => setMainImage(imgSrc)}
                 >
                   <img src={imgSrc} alt={`${product.product_name} thumbnail ${index + 1}`} className="spp-thumbnail-img" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/vite.svg'}} />
                 </div>
               )
            ))}
          </div>
        </div>

        <div className="spp-details">
          <div className="spp-header">
            <h1 className="spp-title">{product.product_name}</h1>
            <div className="spp-price">
              <span>Rs. {product.product_price.toFixed(2)}</span>
            </div>
          </div>
          <p className="spp-description">
            {product.product_description}
          </p>

          <div className="spp-options">
            <div className="spp-option-group">
              <label className="spp-option-label">Color: <span>{selectedColor}</span></label>
              <div className="spp-color-selector">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`spp-color-swatch ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    aria-label={`Select color ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="spp-option-group">
              <label className="spp-option-label">Size</label>
              <div className="spp-size-selector">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`spp-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ul className="spp-perks-list">
            {product.product_price < 3500 && (
              <li className="spp-perk-item">
                <FaMoneyBillWave className="spp-perk-icon" />
                <span>Cash on Delivery available</span>
              </li>
            )}
            <li className="spp-perk-item">
              <FaShippingFast className="spp-perk-icon" />
              <span>One-day delivery in Kandy & Colombo</span>
            </li>
          </ul>

          <div className="spp-payment-icons">
            <FaCcVisa />
            <FaCcMastercard />
          </div>

          {product.product_quantity > 0 && product.product_quantity < 15 && (
            <div className="spp-stock-indicator">
              Hurry up! Only {product.product_quantity} left in stock.
            </div>
          )}

          <div className="spp-actions">
            <button className="spp-btn-primary" onClick={handleAddToCart}>Add to Cart</button>
            <button className="spp-btn-secondary" onClick={handleBuyNow}>Buy Now</button>
          </div>

          {showConfirmation && <div className="spp-add-to-cart-feedback">Added to your cart! \u2713</div>}

          <div className="spp-additional-perks">
          </div>
        </div>
      </div>
    </div>
  );
}