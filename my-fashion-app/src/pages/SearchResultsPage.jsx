import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../data/api.js'; // Ensure path is correct
import ProductCard from '../components/ProductCard/ProductCard'; // Ensure path is correct
import './SearchResultsPage.css'; // Ensure path is correct

export default function SearchResultsPage() {
  // Get the search query 'q' from the URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";

  // State to hold products, loading status, and errors
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from the backend when the component first loads
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true); // Start loading indicator
        setError(null); // Clear previous errors
        const productsFromApi = await fetchProducts(); // Call the API
        setAllProducts(productsFromApi); // Store the fetched products
      } catch (err) {
        console.error("Failed to fetch products for search:", err);
        setError("Could not load products. Please try again later."); // Set error message
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    };
    loadProducts();
  }, []); // Empty array means this effect runs only once when the component mounts

  // Filter the fetched products based on the search query
  const filteredProducts = allProducts.filter(product => {
    // Ensure query is lowercase for case-insensitive search
    const queryLower = query.toLowerCase();

    // Check if the product name matches
    const nameMatch = product.product_name &&
                      product.product_name.toLowerCase().includes(queryLower);

    // Check if the category matches
    const categoryMatch = product.category &&
                          product.category.toLowerCase().includes(queryLower);

    // Check if the gender matches (example of searching another field)
    const genderMatch = product.gender &&
                        product.gender.toLowerCase().includes(queryLower);

    // Return true if ANY of the fields match the query
    return nameMatch || categoryMatch || genderMatch;
  });

  // Display loading message
  if (isLoading) {
    return (
      <div className="search-results-page">
        <p>Loading products...</p>
      </div>
    );
  }

  // Display error message if fetching failed
  if (error) {
     return (
       <div className="search-results-page">
         <p style={{ color: 'red' }}>{error}</p>
       </div>
     );
  }

  // Display the search results
  return (
    <div className="search-results-page">
      <h1 className="search-results-title">
        {/* Dynamic title based on results */}
        {filteredProducts.length > 0
          ? `Showing ${filteredProducts.length} results for "${query}"`
          : `No results found for "${query}"`}
      </h1>
      <div className="search-results-grid">
        {/* Map through the filtered products and render a card for each */}
        {filteredProducts.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
}