import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('token');
      SecureStore.deleteItemAsync('user');
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
    sortBy?: string;
    isFeatured?: boolean;
  }) => api.get('/products', { params }),

  getBySlug: (slug: string) => api.get(`/products/${slug}`),

  search: (params: { q: string; limit?: number }) =>
    api.get('/products/search', { params }),
};

// Category APIs
export const categoryAPI = {
  getAll: (parent?: string) =>
    api.get('/categories', { params: parent ? { parent } : {} }),

  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),

  addItem: (productId: string, quantity: number) =>
    api.post('/cart', { productId, quantity }),

  updateItem: (productId: string, quantity: number) =>
    api.put('/cart', { productId, quantity }),

  removeItem: (productId: string) =>
    api.delete('/cart', { data: { productId } }),

  clear: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get('/orders', { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  create: (data: {
    shippingAddress: any;
    paymentMethod: string;
    deliverySlot?: string;
    notes?: string;
    couponCode?: string;
  }) => api.post('/orders', data),

  cancel: (id: string, reason?: string) =>
    api.patch(`/orders/${id}`, { action: 'cancel', reason }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/user/profile', data),

  getAddresses: () => api.get('/user/addresses'),

  addAddress: (data: {
    name: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    type: 'home' | 'office' | 'other';
    isDefault?: boolean;
  }) => api.post('/user/addresses', data),

  updateAddresses: (addresses: any[]) =>
    api.put('/user/addresses', { addresses }),

  updateAddress: (addressId: string, data: any) =>
    api.put('/user/addresses', { addressId, ...data }),

  deleteAddress: (addressId: string) =>
    api.delete('/user/addresses', { data: { addressId } }),
};

// Coupon APIs
export const couponAPI = {
  apply: (code: string) => api.post('/coupons/apply', { code }),
};

// Chat APIs
export const chatAPI = {
  send: (message: string, history?: { role: string; content: string }[]) =>
    api.post('/chat', { message, history }),

  getRecipe: (ingredients: string[]) =>
    api.post('/chat/recipe', { ingredients }),
};

export default api;
