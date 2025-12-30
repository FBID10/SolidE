import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../data/api.js';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import './ShopPage.css';

// Helper function to parse attribute strings
const parseAttributeString = (attrString) => {
    if (!attrString) return [];
    try {
        const parsed = JSON.parse(attrString);
        if (Array.isArray(parsed)) return parsed;
    } catch (err) { void err; } // use err to avoid unused-var and keep behavior
    // Fallback for comma-separated or single value strings
    return attrString.split(',').map(item => item.trim());
};

export default function ShopPage() {
  const { collectionName } = useParams();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  // Move state declarations before effects so `loading` is defined when used
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define defaultFilters inside the component or ensure it's stable
  const defaultFilters = React.useMemo(() => ({
    category: initialCategory,
    size: 'all',
    color: 'all',
    inStock: false,
  }), [initialCategory]);

  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('featured');

  // ensure page is at top when the shop page mounts or when the collection changes
  useLayoutEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // make browser not restore previous scroll
        if ('scrollRestoration' in window.history) {
          try { window.history.scrollRestoration = 'manual'; } catch (err) { void err; }
        }
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (err) { window.scrollTo(0,0); void err; }
      }
    } catch (err) {
      void err;
      try { window.scrollTo(0,0); } catch (err2) { void err2; }
    }
  }, [collectionName]);

  // Also ensure we are at the top after products finish loading (to avoid layout shifts)
  useEffect(() => {
    if (!loading) {
      const id = setTimeout(() => {
        try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (err) { window.scrollTo(0,0); void err; }
      }, 80);
      return () => clearTimeout(id);
    }
  }, [loading]);


  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to load products:', error);
        setAllProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []); // Empty dependency array means this runs once on mount

  // Filter and sort products whenever dependencies change
  useEffect(() => {
    let products = allProducts;

    // Filter by collection/gender (case-insensitive)
    if (collectionName) {
        const targetGender = collectionName.toLowerCase();
        products = products.filter(p => {
            if (!p.gender) return false;
            const productGender = p.gender.toLowerCase();
            if (targetGender === 'men' && productGender === 'male') return true;
            if (targetGender === 'women' && productGender === 'female') return true;
            if (targetGender === 'unisex' && productGender === 'unisex') return true;
            return productGender === targetGender;
        });
    }

    // Apply other filters
    if (filters.category !== 'all') {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.size !== 'all') {
      products = products.filter(p => {
        const sizes = parseAttributeString(p.product_size);
        return sizes.includes(filters.size);
      });
    }
    if (filters.color !== 'all') {
      products = products.filter(p => {
         const colors = parseAttributeString(p.product_color);
         return colors.some(color => color.toLowerCase() === filters.color.toLowerCase());
      });
    }
    if (filters.inStock) {
      products = products.filter(p => p.product_quantity > 0);
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      products = [...products].sort((a, b) => a.product_price - b.product_price);
    } else if (sortBy === 'price-desc') {
      products = [...products].sort((a, b) => b.product_price - a.product_price);
    }

    setFilteredProducts(products);

  }, [collectionName, filters, sortBy, allProducts]); // Re-run when these change

  // --- Handlers defined within the component ---
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSortBy('featured');

    // Reset the actual form elements if needed
    const form = document.querySelector('.filter-sidebar form');
    if (form) {
      form.reset();
    }
  };

  return (
    <div className="shop-page-container">
      <header className="shop-header">
        <h1>{collectionName ? collectionName.charAt(0).toUpperCase() + collectionName.slice(1) : 'All Products'} Collection</h1>
      </header>
      <div className="shop-layout">
        
        {/* --- THIS IS THE FIX --- */}
        {/* Only render the FilterSidebar AFTER products have loaded */}
        {!loading ? ( // Check only loading state
          <FilterSidebar
            products={allProducts} // Pass allProducts down
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
            currentFilters={filters}
            currentSort={sortBy}
          />
        ) : (
          // Show a placeholder while loading
          <div className="filter-sidebar-placeholder">Loading Filters...</div> 
        )}
        {/* --- END OF FIX --- */}

        <main className="product-grid-main">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </main>
      </div>
    </div>
  );
}