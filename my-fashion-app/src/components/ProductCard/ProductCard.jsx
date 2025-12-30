import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { getImageUrl } from '../../data/imageUtils.js';

const colorMap = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Heather Grey": "#d1d5db",
  "Navy": "#1e3a8a",
  "Beige": "#f5f5dc",
  "Dark Indigo": "#303F9F",
  "Light Wash": "#A5C2D5",
  "Terracotta": "#E2725B",
  "Silver": "#C0C0C0",
};

export default function ProductCard({ product }) {
  if (!product) {
    return null;
  }

  // Prefer the first image from product_images array if available
  const rawImage = (product.product_images && product.product_images.length > 0) ? product.product_images[0] : product.product_image;
  const imageUrl = getImageUrl(rawImage); // Get the image URL

  // small inline SVG placeholder data-uri (light gray background with 'No image')
  const placeholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' font-size='20' fill='%236b7280' text-anchor='middle' dominant-baseline='middle' font-family='Arial, Helvetica, sans-serif'>No image</text></svg>";

  // Helper to parse colors/sizes (handles array, JSON string, CSV or single value)
   const parseAttribute = (attributeValue) => {
     if (!attributeValue) return [];
     // If it's already an array
     if (Array.isArray(attributeValue)) return attributeValue;
     // If it's a JSON array string
     try {
       const parsed = JSON.parse(attributeValue);
       if (Array.isArray(parsed)) return parsed;
     } catch (e) {
       // not JSON
     }
     // Fallback: comma separated or single value
     return attributeValue.split(',').map(s => s.trim()).filter(Boolean);
   };

  const colors = parseAttribute(product.product_colors || product.product_color);
  const sizes = parseAttribute(product.product_sizes || product.product_size);

  return (
    <Link to={`/product/${product.product_id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-container">
          {
            // Always render an img; use a small local fallback when imageUrl is falsy
          }
          <img
            src={imageUrl || placeholderSvg}
            alt={product.product_name}
            className="product-image"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderSvg; }}
          />

          <div className="product-hover-details">
            <div className="product-colors">
              {colors.map(colorName => (
                <span
                  key={colorName}
                  className="color-swatch"
                  style={{ backgroundColor: colorMap[colorName] || '#ccc' }}
                  title={colorName}
                />
              ))}
            </div>
            <div className="product-sizes">
              <span>Sizes: {sizes.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.product_name}</h3>
          <div className="product-pricing">
            <p className="product-price">Rs.{product.product_price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}