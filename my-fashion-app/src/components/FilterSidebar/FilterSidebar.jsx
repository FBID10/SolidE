import React, { useMemo } from 'react';
import './FilterSidebar.css';

// Helper function (same as before)
const parseAttributeString = (attrString) => {
    if (!attrString) return [];
    try {
        const parsed = JSON.parse(attrString);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) { /* Ignore */ }
    return attrString.split(',').map(item => item.trim());
};

export default function FilterSidebar({
  products = [], // Default to empty array
  onFilterChange,
  onSortChange,
  onResetFilters,
  currentFilters,
  currentSort
}) {

  const uniqueOptions = useMemo(() => {
    const categories = new Set();
    const sizes = new Set();
    const colors = new Set();

    // --- DEBUG: Log the products received by the sidebar ---
    console.log("FilterSidebar received products:", products);

    products.forEach(product => {
      if (product.category) categories.add(product.category);

      const productSizes = parseAttributeString(product.product_size);
      productSizes.forEach(size => sizes.add(size));

      const productColors = parseAttributeString(product.product_color);
      productColors.forEach(color => colors.add(color));
    });

    // --- DEBUG: Log the extracted unique values ---
    console.log("Extracted Categories:", Array.from(categories));
    console.log("Extracted Sizes:", Array.from(sizes));
    console.log("Extracted Colors:", Array.from(colors));

    return {
      categories: Array.from(categories).sort(),
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort((a, b) => a.localeCompare(b)),
    };
  }, [products]);

  return (
    <form className="filter-sidebar">
      {/* Rest of the form is unchanged */}
      <div className="filter-group">
        <h3 className="filter-title">Sort By</h3>
        <select
          name="sort"
          className="filter-select"
          value={currentSort}
          onChange={onSortChange}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Filter By</h3>

        <label htmlFor="category">Category</label>
        <select
          name="category"
          id="category"
          className="filter-select"
          value={currentFilters.category}
          onChange={onFilterChange}
        >
          <option value="all">All Categories</option>
          {uniqueOptions.categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="size">Size</label>
        <select
          name="size"
          id="size"
          className="filter-select"
          value={currentFilters.size}
          onChange={onFilterChange}
        >
          <option value="all">All Sizes</option>
          {uniqueOptions.sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="color">Color</label>
        <select
          name="color"
          id="color"
          className="filter-select"
          value={currentFilters.color}
          onChange={onFilterChange}
        >
          <option value="all">All Colors</option>
          {uniqueOptions.colors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="inStock"
            name="inStock"
            checked={currentFilters.inStock}
            onChange={onFilterChange}
          />
          <label htmlFor="inStock">In Stock Only</label>
        </div>
      </div>

      <div className="filter-group">
        <button
          type="button"
          className="reset-button"
          onClick={onResetFilters}
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
}