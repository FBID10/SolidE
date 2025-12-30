import React, { useState, useEffect } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,  // 2. ADDED
  deleteProduct,  // 3. ADDED
  uploadImageToCloudinary // 4. NEW
} from '../../data/api.js';
import { FaEdit, FaTrash } from 'react-icons/fa'; // 4. ADDED
import Modal from '../../components/Modal/Modal.jsx';
import { getImageUrl } from '../../data/imageUtils.js';
import './ProductsPage.css'; // Your CSS file

// --- This is the Add Product Form (based on your code) ---
function AddProductForm({ onSuccess, onError }) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('New Arrivals');
  const [newProductGender, setNewProductGender] = useState('unisex');
  const [newProductDescription, setNewProductDescription] = useState('');
  // Accept comma-separated input for colors/sizes, and also allow multiple file uploads for images
  const [newProductColors, setNewProductColors] = useState(''); // comma separated
  const [newProductSizes, setNewProductSizes] = useState(''); // comma separated
  const [newProductImageUrls, setNewProductImageUrls] = useState(''); // comma separated URLs
  const [newProductImageFiles, setNewProductImageFiles] = useState([]); // multiple files

  const resetForm = () => {
    setNewProductName('');
    setNewProductPrice('');
    setNewProductQuantity('');
    setNewProductCategory('New Arrivals');
    setNewProductGender('unisex');
    setNewProductDescription('');
    setNewProductColors('');
    setNewProductSizes('');
    setNewProductImageUrls('');
    setNewProductImageFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build image array: URLs from text + uploaded files
      const images = [];
      if (newProductImageUrls) {
        // split by comma, trim, ignore empty
        const urls = newProductImageUrls.split(',').map(s => s.trim()).filter(Boolean);
        images.push(...urls);
      }

      // Upload each file if present
      if (newProductImageFiles && newProductImageFiles.length > 0) {
        for (const file of newProductImageFiles) {
          const upload = await uploadImageToCloudinary(file);
          const url = upload?.secure_url || upload?.url;
          if (url) images.push(url);
        }
      }

      // Build color and size arrays from comma-separated input
      const colors = newProductColors ? newProductColors.split(',').map(s => s.trim()).filter(Boolean) : [];
      const sizes = newProductSizes ? newProductSizes.split(',').map(s => s.trim()).filter(Boolean) : [];

      const newProductData = {
        product_name: newProductName,
        product_price: parseFloat(newProductPrice),
        product_quantity: parseInt(newProductQuantity, 10),
        category: newProductCategory,
        gender: newProductGender,
        product_description: newProductDescription,
        product_images: images,
        product_colors: colors,
        product_sizes: sizes,
      };

      await createProduct(newProductData);
      resetForm();
      onSuccess(); // This will close the modal and reload products
    } catch (err) {
      onError('Failed to create product.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-field">
        <label>Images (URLs or Upload) - multiple allowed (comma separated URLs or multi-select files)</label>
        <input
          type="text"
          placeholder="e.g., https://example.com/img1.jpg, https://example.com/img2.jpg"
          value={newProductImageUrls}
          onChange={(e) => setNewProductImageUrls(e.target.value)}
        />
        <div style={{marginTop: '8px'}}>
          <input type="file" accept="image/*" multiple onChange={(e) => setNewProductImageFiles(Array.from(e.target.files))} />
        </div>
      </div>
      <div className="form-field">
        <label>Product Name</label>
        <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
      </div>
      <div className="form-field">
        <label>Description</label>
        <textarea rows="4" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} required />
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label>Price (Rs.)</label>
          <input type="number" step="0.01" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Stock Quantity</label>
          <input type="number" value={newProductQuantity} onChange={(e) => setNewProductQuantity(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)}>
            <option value="New Arrivals">New Arrivals</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Pants">Pants</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={newProductGender} onChange={(e) => setNewProductGender(e.target.value)}>
            <option value="unisex">Unisex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-field">
          <label>Colors (comma separated)</label>
          <input type="text" value={newProductColors} onChange={(e) => setNewProductColors(e.target.value)} placeholder="e.g., Black, White, Grey" />
        </div>
        <div className="form-field">
          <label>Sizes (comma separated)</label>
          <input type="text" value={newProductSizes} onChange={(e) => setNewProductSizes(e.target.value)} placeholder="e.g., S, M, L, XL" />
        </div>
      </div>
      <button type="submit" className="form-submit-btn">Create Product</button>
    </form>
  );
}

// --- 5. NEW Edit Product Form ---
function EditProductForm({ product, onSuccess, onError }) {
  // State for all product fields, pre-filled with the product's current data
  const [productName, setProductName] = useState(product.product_name);
  const [price, setPrice] = useState(product.product_price);
  const [quantity, setQuantity] = useState(product.product_quantity);
  const [description, setDescription] = useState(product.product_description);
  // Support arrays - if API returns product_images use that, otherwise fallback to product_image
  const initialImages = product.product_images && product.product_images.length > 0 ? product.product_images : (product.product_image ? [product.product_image] : []);
  const [productImageUrls, setProductImageUrls] = useState(initialImages.join(', '));
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [category, setCategory] = useState(product.category);
  const [gender, setGender] = useState(product.gender);
  const initialColors = product.product_colors && product.product_colors.length > 0 ? product.product_colors : (product.product_color ? product.product_color.split(',').map(s => s.trim()) : []);
  const initialSizes = product.product_sizes && product.product_sizes.length > 0 ? product.product_sizes : (product.product_size ? product.product_size.split(',').map(s => s.trim()) : []);
  const [color, setColor] = useState(initialColors.join(', '));
  const [size, setSize] = useState(initialSizes.join(', '));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const images = [];
      if (productImageUrls) {
        images.push(...productImageUrls.split(',').map(s => s.trim()).filter(Boolean));
      }
      if (productImageFiles && productImageFiles.length > 0) {
        for (const file of productImageFiles) {
          const upload = await uploadImageToCloudinary(file);
          const url = upload?.secure_url || upload?.url;
          if (url) images.push(url);
        }
      }

      const colors = color ? color.split(',').map(s => s.trim()).filter(Boolean) : [];
      const sizes = size ? size.split(',').map(s => s.trim()).filter(Boolean) : [];

      const updatedData = {
        product_name: productName,
        product_price: parseFloat(price),
        product_quantity: parseInt(quantity, 10),
        product_description: description,
        product_images: images,
        category: category,
        gender: gender,
        product_colors: colors,
        product_sizes: sizes,
      };
      
      await updateProduct(product.product_id, updatedData);
      onSuccess(); // Close modal and refresh list
    } catch (err) {
      onError('Failed to update product.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-field">
        <label>Images (URLs or Upload) - multiple allowed</label>
        <input type="text" value={productImageUrls} onChange={(e) => setProductImageUrls(e.target.value)} />
        <div style={{marginTop: '8px'}}>
          <input type="file" accept="image/*" multiple onChange={(e) => setProductImageFiles(Array.from(e.target.files))} />
        </div>
      </div>
      <div className="form-field">
        <label>Product Name</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
      </div>
      <div className="form-field">
        <label>Description</label>
        <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label>Price (Rs.)</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Stock Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="New Arrivals">New Arrivals</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Pants">Pants</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div className="form-field">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="unisex">Unisex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-field">
          <label>Colors (comma separated)</label>
          <input type="text" value={color} onChange={(e) => setColor(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Sizes (comma separated)</label>
          <input type="text" value={size} onChange={(e) => setSize(e.target.value)} required />
        </div>
      </div>
      <button type="submit" className="form-submit-btn">Save Changes</button>
    </form>
  );
}


// --- Main ProductsPage Component ---
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // --- 6. ADDED State for Edit and Delete ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products.');
      console.error(err); // Changed from setError to console.error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- 7. ADDED Handlers for Add, Edit, and Delete ---
  const handleProductAdded = () => {
    setIsAddModalOpen(false);
    loadProducts();
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleProductUpdated = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };
  
  const handleOpenDeleteModal = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.product_id);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (err) {
      alert('Failed to delete the product.');
      console.error(err);
    }
  };

  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="page-container">
      {/* Add Modal (This was modified slightly) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product">
        <AddProductForm onSuccess={handleProductAdded} onError={(msg) => alert(msg)} />
      </Modal>

      {/* --- 8. ADDED Edit Modal --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit: ${editingProduct?.product_name}`}>
        {editingProduct && (
          <EditProductForm product={editingProduct} onSuccess={handleProductUpdated} onError={(msg) => alert(msg)} />
        )}
      </Modal>

      {/* --- 9. ADDED Delete Modal --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="delete-confirmation-content">
          <p>Are you sure you want to permanently delete the product: <strong>"{deletingProduct?.product_name}"</strong>?</p>
          <p className="delete-warning">This action cannot be undone.</p>
          <div className="delete-confirmation-actions">
            <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
            <button className="delete-confirm-btn" onClick={handleConfirmDelete}>Confirm Delete</button>
          </div>
        </div>
      </Modal>

      <header className="page-header">
        <h1>Product Management</h1>
        <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>Add New Product</button>
      </header>
      
      <div className="table-wrapper">
        {isLoading ? <p>Loading products...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                {/* 10. ADDED Image Header */}
                <th>Image</th> 
                <th>Product Name</th>
                <th>Category</th>
                <th>Gender</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  {/* 11. ADDED Image Cell */}
                  <td>
                    <img
                      src={getImageUrl((product.product_images && product.product_images.length>0) ? product.product_images[0] : product.product_image)}
                       alt={product.product_name}
                       className="product-table-image"
                       onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/vite.svg'; }}
                     />
                  </td>
                  <td className="product-table-name">{product.product_name}</td>
                  <td>{product.category}</td>
                  <td>{product.gender}</td>
                  <td>Rs. {product.product_price.toFixed(2)}</td>
                  <td>{product.product_quantity}</td>
                  <td>
                    <div className="table-actions">
                      {/* 12. ADDED onClick Handlers */}
                      <button className="action-btn-edit" onClick={() => handleOpenEditModal(product)}><FaEdit /></button>
                      <button className="action-btn-delete" onClick={() => handleOpenDeleteModal(product)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}