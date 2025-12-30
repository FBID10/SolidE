import ProductCard from '../ProductCard/ProductCard.jsx';
import './ProductGrid.css'; 

export default function ProductGrid({ products = [] }) {
  return (
    <div className="product-grid">
      {products.length > 0 ? (
        products.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))
      ) : (
        <div className="no-products-found">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}