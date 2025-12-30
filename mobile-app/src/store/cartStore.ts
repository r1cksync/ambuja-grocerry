import { create } from 'zustand';
import { Cart, CartItem } from '../types';
import { cartAPI } from '../services/api';
import Toast from 'react-native-toast-message';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (cart: Cart | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.get();
      set({ cart: response.data.cart });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      set({ cart: response.data.cart });
      Toast.show({
        type: 'success',
        text1: 'Added to cart',
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || 'Failed to add to cart',
        visibilityTime: 2000,
      });
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const response = await cartAPI.updateItem(productId, quantity);
      set({ cart: response.data.cart });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || 'Failed to update cart',
        visibilityTime: 2000,
      });
    }
  },

  removeFromCart: async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      set({ cart: response.data.cart });
      Toast.show({
        type: 'success',
        text1: 'Removed from cart',
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error || 'Failed to remove item',
        visibilityTime: 2000,
      });
    }
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: null });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  setCart: (cart) => set({ cart }),
}));
