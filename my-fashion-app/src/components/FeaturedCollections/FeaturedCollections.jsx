import React, { useState, useEffect } from 'react';
import './FeaturedCollections.css';
import ProductCard from '../ProductCard/ProductCard.jsx';
import { fetchProducts } from '../../data/api.js';
import { Link, useLocation } from 'react-router-dom';
import { mockProducts } from '../../data/mockProducts.js';

function matchesGender(product, target) {
  if (!product) return false;
  const g = (product.gender || product.product_gender || product.product_type || '').toString().toLowerCase();
  if (!g) return false;
  if (target === 'men') return g.includes('male') || g.includes('men');
  if (target === 'women') return g.includes('female') || g.includes('women');
  return false;
}

// Ensure products have a usable image property for the frontend
function ensureProductImage(product) {
  if (!product) return product;
  // already has product_image
  if (product.product_image) return product;

  // try product_images array
  if (Array.isArray(product.product_images) && product.product_images.length > 0) {
    return { ...product, product_image: product.product_images[0] };
  }

  // try image_map first available
  if (product.image_map && typeof product.image_map === 'object') {
    const keys = Object.keys(product.image_map);
    if (keys.length > 0) {
      return { ...product, product_image: product.image_map[keys[0]] };
    }
  }

  // fallback: find mock product with same id and use its product_image
  const id = product.product_id || product.id || product._id;
  if (id) {
    const found = mockProducts.find(mp => (mp.product_id && mp.product_id.toString() === id.toString()));
    if (found && found.product_image) return { ...product, product_image: found.product_image };
  }

  // nothing found — return original
  return product;
}

export default function FeaturedCollections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        let final = Array.isArray(data) && data.length ? data : mockProducts;
        // normalize images for each product
        final = final.map(p => ensureProductImage(p));
        if (mounted) setProducts(final);
      } catch (err) {
        console.error('Failed to load products for featured collections', err);
        if (mounted) {
          setError(null); // don't show error for users; fallback to mock data
          const final = mockProducts.map(p => ensureProductImage(p));
          setProducts(final);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Scroll to anchor when location.hash changes
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    }
  }, [location]);

  const men = products.filter(p => matchesGender(p, 'men')).slice(0, 3);
  const women = products.filter(p => matchesGender(p, 'women')).slice(0, 3);

  return (
    <section className="featured-collections">
      <div className="featured-inner">
        <header className="featured-header">
          <h2>Featured Collections</h2>
          <p className="muted">Hand-picked pieces from our latest drops.</p>
        </header>

        {loading ? (
          <div className="loading">Loading featured products...</div>
        ) : (
          <>
            <div id="men" className="collection-row">
              <div className="collection-head">
                <h3>Men</h3>
                <Link to="/collections/men" className="view-all" onClick={() => { try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0,0); } }}>View All &rarr;</Link>
              </div>
              <div className="collection-grid">
                {men.length > 0 ? men.map(p => (
                  <div key={p.product_id} className="mini-card">
                    <ProductCard product={p} />
                  </div>
                )) : (
                  <div className="no-items">No items in this collection yet.</div>
                )}
              </div>
            </div>

            <div id="women" className="collection-row">
              <div className="collection-head">
                <h3>Women</h3>
                <Link to="/collections/women" className="view-all" onClick={() => { try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0,0); } }}>View All &rarr;</Link>
              </div>
              <div className="collection-grid">
                {women.length > 0 ? women.map(p => (
                  <div key={p.product_id} className="mini-card">
                    <ProductCard product={p} />
                  </div>
                )) : (
                  <div className="no-items">No items in this collection yet.</div>
                )}
              </div>
            </div>

          </>
        )}

      </div>
    </section>
  );
}
