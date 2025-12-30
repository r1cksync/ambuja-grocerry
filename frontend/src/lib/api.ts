import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    employeeId: string;
    phone: string;
    department: string;
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
};

// Product APIs
export const productAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    isVeg?: boolean;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: string;
    sort?: string;
  }) => api.get('/products', { params }),
  
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  
  search: (params: {
    q: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => api.get('/products/search', { params }),
  
  create: (data: any) => api.post('/products', data),
  
  update: (slug: string, data: any) => api.put(`/products/${slug}`, data),
  
  delete: (slug: string) => api.delete(`/products/${slug}`),
};

// Category APIs
export const categoryAPI = {
  getAll: (parent?: string) => api.get('/categories', { params: { parent } }),
  
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  
  create: (data: any) => api.post('/categories', data),
  
  update: (slug: string, data: any) => api.put(`/categories/${slug}`, data),
  
  delete: (slug: string) => api.delete(`/categories/${slug}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  
  add: (productId: string, quantity: number) =>
    api.post('/cart', { productId, quantity }),
  
  update: (productId: string, quantity: number) =>
    api.put('/cart', { productId, quantity }),
  
  remove: (productId: string) =>
    api.delete('/cart', { data: { productId } }),
  
  clear: () => api.delete('/cart/clear'),
  
  applyCoupon: (code: string) => api.post('/coupons/apply', { code }),
};

// Order APIs
export const orderAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),
  
  getById: (id: string) => api.get(`/orders/${id}`),
  
  create: (data: {
    items: { product: string; quantity: number; price: number }[];
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMethod: string;
    couponCode?: string;
  }) => api.post('/orders', data),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}`, { status }),
  
  cancel: (id: string, reason?: string) =>
    api.patch(`/orders/${id}`, { status: 'cancelled', reason }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (data: { name?: string; email?: string; phone?: string; avatar?: string }) =>
    api.put('/user/profile', data),
  
  getAddresses: () => api.get('/user/addresses'),
  
  addAddress: (data: {
    type: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) => api.post('/user/addresses', data),
  
  updateAddress: (addressId: string, data: any) =>
    api.put('/user/addresses', { addressId, ...data }),
  
  deleteAddress: (addressId: string) =>
    api.delete('/user/addresses', { data: { addressId } }),
  
  setDefaultAddress: (addressId: string) =>
    api.put('/user/addresses', { addressId, isDefault: true }),
};

// Coupon API
export const couponAPI = {
  apply: (code: string, subtotal: number) =>
    api.post('/coupons/apply', { code, subtotal }),
};

// Upload API
export const uploadAPI = {
  getSignedUrl: (fileName: string, fileType: string, folder?: string) =>
    api.post('/upload', { fileName, fileType, folder }),
  
  uploadFile: async (file: File, folder?: string) => {
    // Get signed URL from backend
    const { data } = await api.post('/upload', {
      fileName: file.name,
      fileType: file.type,
      folder,
    });
    
    const { signedUrl, publicUrl, key } = data;
    
    // Upload to S3 using signed URL
    await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    // Return the public file URL
    return { data: { url: publicUrl, key } };
  },
};

// Chat API (AI Assistant)
export const chatAPI = {
  send: (message: string, history?: { role: string; content: string }[]) =>
    api.post('/chat', { message, history }),
  
  getRecipe: (ingredients: string[]) =>
    api.post('/chat/recipe', { ingredients }),
};

export default api;
