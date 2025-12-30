import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useCart } from '../../context/CartContext.jsx';
import './ProductSuggestionCard.css';
import { getImageUrl } from '../../data/imageUtils.js';
import { FaPlus } from 'react-icons/fa'; // Import icon for button

// Helper function to parse attribute strings (if needed, same as in other components)
const parseAttributeString = (attrString) => {
    if (!attrString) return [];
    if (Array.isArray(attrString)) return attrString;
    try {
        const parsed = JSON.parse(attrString);
        return Array.isArray(parsed) ? parsed : [String(attrString)];
    } catch (e) {
        // Fallback for comma-separated or single value strings
        return String(attrString).split(',').map(item => item.trim()).filter(Boolean);
    }
};

export default function ProductSuggestionCard({ product }) {
  const { addToCart } = useCart() || {}; // Add default empty object

  if (!product) {
      return null; // Don't render if no product data
  }

  // Determine default color and size safely
  const colors = parseAttributeString(product.product_colors || product.product_color);
  const sizes = parseAttributeString(product.product_sizes || product.product_size);
  const defaultColor = colors.length > 0 ? colors[0] : 'Default'; // Provide a fallback
  const defaultSize = sizes.length > 0 ? sizes[0] : 'One Size'; // Provide a fallback
  // Prefer first image from product_images array
  const rawImage = (product.product_images && product.product_images.length > 0) ? product.product_images[0] : product.product_image;
  const imageUrl = getImageUrl(rawImage);

  const handleAddClick = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    e.stopPropagation(); // Stop click from propagating to the Link wrapper
    if (addToCart) {
        addToCart(product, 1, defaultColor, defaultSize);
        // Optional: Add feedback like a small animation or message
        console.log("Added suggested item:", product.product_name);
    } else {
        console.error("addToCart function is not available from CartContext");
    }
  };

  return (
    // Wrap the card in a Link to the product page
    <Link to={`/product/${product.product_id}`} className="suggestion-card-link">
        <div className="suggestion-card">
            {imageUrl ? (
                <img src={imageUrl} alt={product.product_name} className="suggestion-card-image" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/vite.svg'}} />
            ) : (
                <div className="suggestion-card-image-placeholder"></div>
            )}
            <div className="suggestion-card-details">
                <h4 className="suggestion-card-name">{product.product_name}</h4>
                <p className="suggestion-card-price">Rs. {product.product_price ? product.product_price.toFixed(2) : 'N/A'}</p>
            </div>
            <button
                onClick={handleAddClick}
                className="suggestion-card-add-btn"
                aria-label={`Add ${product.product_name} to cart`} // Accessibility
            >
                <FaPlus /> {/* Use an icon */}
            </button>
        </div>
    </Link>
  );
}