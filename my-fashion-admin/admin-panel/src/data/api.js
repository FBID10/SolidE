const API_BASE_URL = 'http://localhost:9090/api';

// Cloudinary config (unsigned preset recommended)
const CLOUDINARY_CLOUD_NAME = 'dni9qj9qs';
const CLOUDINARY_UPLOAD_PRESET = 'SolidDesign';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// Helper function to get the token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// --- 1. THIS HELPER FUNCTION WAS MISSING ---
// Creates the required headers for an authenticated request
const createAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    console.warn("No auth token found in localStorage.");
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Logs in a user and stores the token.
 */
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  localStorage.setItem('authToken', data.jwtToken);
  return data;
};

/**
 * Fetches the current logged-in user's details.
 */
export const fetchCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user data.');
  }
  return response.json();
};

/**
 * Fetches all products.
 */
export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products.');
  }
  return response.json();
};

/**
 * Creates a new product by sending JSON data.
 * @param {object} productData - The product data object.
 * @returns {Promise<object>} The newly created product.
 */
export const createProduct = async (productData) => {
  // --- THIS FUNCTION IS NOW REVERTED ---
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Set header back to JSON
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(productData), // Stringify the JSON object
  });

  if (!response.ok) {
    throw new Error(`Failed to create product. Status: ${response.status}`);
  }
  return response.json();
};

// --- 2. THIS FUNCTION WAS MISSING ---
/**
 * Updates an existing product.
 * @param {string} productId
 * @param {object} updatedData
 * @returns {Promise<object>} The updated product.
 * @throws {Error} If the API call fails.
 */
export const updateProduct = async (productId, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: createAuthHeaders(), // Needs the helper function
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update product. Server status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

/**
 * Deletes a product.
 * @param {string} productId
 * @returns {Promise<object>} A success message.
 * @throws {Error} If the API call fails.
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(), // Needs the helper function
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product. Server status: ${response.status}`);
    }
    // DELETE requests often return 204 No Content, so we don't try to parse JSON.
    return { success: true, message: "Product deleted successfully." };
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

// --- 3. THESE ARE THE NEWLY ADDED FUNCTIONS ---

/**
 * Fetches all orders.
 * @returns {Promise<Array>} A list of orders.
 */
export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: createAuthHeaders(), // We need this helper function
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch orders. Server status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch orders error:', error);
    throw error;
  }
};

/**
 * Fetches a single order by its ID.
 * @param {string} orderId
 * @returns {Promise<object>} The order details.
 */
export const fetchOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch order ${orderId}. Server status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch order error:', error);
    throw error;
  }
};

/**
 * Updates the status of an order.
 * @param {string} orderId
 * @param {string} newStatus
 * @returns {Promise<object>} The updated order.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update order status. Server status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

/**
 * Uploads an image file to Cloudinary using unsigned preset.
 * @param {File} file
 * @returns {Promise<object>} Cloudinary response (contains secure_url)
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided for upload');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  return res.json();
};
