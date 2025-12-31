// Backend API base URL - reads from window.CONFIG set in index.html at runtime
const API_BASE_URL = window.CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:9090/api';

// Cloudinary config (use unsigned upload preset in production; do NOT commit secrets)
// NOTE: You provided cloud name and API secret; do not embed API secret in client code.
// We'll use unsigned uploads from the browser. Create an unsigned preset in your Cloudinary dashboard
// and replace UPLOAD_PRESET below if needed.
const CLOUDINARY_CLOUD_NAME = 'dni9qj9qs';
const CLOUDINARY_UPLOAD_PRESET = 'SolidDesign'; // replace with your unsigned preset name if different
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken'); 
};

// Helper function to check if a token looks like a JWT (has exactly two '.' separators)
const isJwt = (token) => {
  try {
    return typeof token === 'string' && token.split('.').length === 3;
  } catch (e) {
    return false;
  }
};

// Helper function to create headers with auth token
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    if (isJwt(token)) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // If a non-JWT token exists, log and clear it to avoid hitting backend with malformed token
      console.warn('createAuthHeaders: found non-JWT token in localStorage, clearing it to avoid backend errors.');
      try { localStorage.removeItem('authToken'); } catch (e) { /* ignore */ }
    }
  }
  return headers;
};

// New: upload image file (File object) to Cloudinary via unsigned upload
export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided for upload');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  // Optionally set folder or public_id by adding additional form fields (if unsigned preset allows)

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
  }
  const data = await response.json();
  // data.secure_url is the HTTPS URL of the uploaded image
  return data;
};

// --- Authentication APIs ---
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    if (data.jwtToken) {
        localStorage.setItem('authToken', data.jwtToken);
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (email, password, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
              console.log('User not authenticated or lacks permission for /users/me');
              return null;
          }
          throw new Error('Failed to fetch user data');
      }
      return response.json();
    } catch (error) {
      console.error('Fetch current user error:', error);
      return null;
    }
};

// --- Product APIs ---
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
    });
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Product with ID ${id} not found.`);
        }
      throw new Error(`Failed to fetch product. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch product error:', error);
    throw error;
  }
};

// --- Cart APIs ---
export const getCartItems = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cart items');
    return await response.json();
  } catch (error) {
    console.error('Get cart items error:', error);
    return [];
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add/${userId}`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    
    if (!response.ok) {
        let errorMessage = `Failed to add to cart. Status: ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody && errorBody.message) {
                errorMessage = errorBody.message; 
            }
        } catch (jsonError) {
            console.debug('Could not parse error body as JSON', jsonError);
        }
        throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return await response.json();
  } catch (error) {
    console.error('Update cart item error:', error);
    throw error;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${cartItemId}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return true;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

// --- Order APIs --- 

// --- THIS FUNCTION IS UPDATED ---
/**
 * Creates an order based on the user's current cart and shipping details.
 * The frontend may pass additional fields: paymentMethod ("card"|"cod"|"bank-slip")
 * and paymentProofUrl for bank-slip images.
 * @param {object} shippingDetails The shipping details from the checkout form
 * @returns {Promise<object>} The newly created order.
 */
export const createOrder = async (shippingDetails) => { // <-- 1. Accept shippingDetails
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: createAuthHeaders(),
      // --- 2. Send shippingDetails as the JSON body ---
      body: JSON.stringify(shippingDetails)
    });

    if (!response.ok) {
        let errorMessage = `Failed to create order. Status: ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody && errorBody.message) {
                errorMessage = errorBody.message;
            }
        } catch (jsonError) {
            console.debug('Could not parse create order error body', jsonError);
            try {
                const textBody = await response.text();
                if (textBody) {
                    errorMessage = textBody;
                }
            } catch (textError) {
                console.debug('Could not read create order error as text', textError);
            }
        }
        console.error("Create order failed with status:", response.status, "Message:", errorMessage);
        throw new Error(errorMessage); 
    }
    
    return await response.json(); 
  } catch (error) {
    console.error('Create order error:', error);
    throw error; 
  }
};
// --- END OF UPDATE ---

export const getUserOrders = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user orders');
    return await response.json();
  } catch (error) {
    console.error('Get user orders error:', error);
    return [];
  }
};

// This function is for the USER track-order page
export const fetchOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: createAuthHeaders(), 
    });
    if (!response.ok) {
        if (response.status === 404) {
             throw new Error(`Order with ID ${orderId} not found.`);
        }
        if (response.status === 403) {
            const token = getAuthToken();
            if (!token) {
                 throw new Error(`You must be logged in to view order details.`);
            } else {
                 throw new Error(`You do not have permission to view order ${orderId}.`);
            }
        }
      throw new Error(`Failed to fetch order ${orderId}. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch order by ID error:', error);
    throw error;
  }
};


/* NOTE: fetchOrders and updateOrderStatus are for your ADMIN panel.
  If your admin panel has a *separate* api.js, you need to make sure 
  these functions exist there. If it uses this same file, you're all set.
*/

// Admin: Get All Orders
export const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: createAuthHeaders(), // Requires admin token
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch all orders. Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch all orders error:', error);
      throw error;
    }
};

// Admin: Update Order Status
export const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: createAuthHeaders(), // Requires admin token
        body: JSON.stringify({ status: status }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update status. Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
};