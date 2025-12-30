import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  department: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses: Address[];
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  mrp: number;
  discount: number;
  category: { _id: string; name: string; slug: string };
  brand: string;
  images: string[];
  thumbnail: string;
  unit: string;
  quantity: string;
  stock: number;
  minOrderQty: number;
  maxOrderQty: number;
  isVeg: boolean;
  isActive: boolean;
  avgRating: number;
  totalReviews: number;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  appliedCoupon?: string;
}

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  setCart: (cart: Cart | null) => void;
  setLoading: (loading: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  setCart: (cart) => set({ cart }),
  setLoading: (isLoading) => set({ isLoading }),
  clearCart: () => set({ cart: null }),
}));

// UI Store
interface UIState {
  isSidebarOpen: boolean;
  isCartOpen: boolean;
  isChatOpen: boolean;
  isSearchOpen: boolean;
  toggleSidebar: () => void;
  toggleCart: () => void;
  toggleChat: () => void;
  toggleSearch: () => void;
  closeSidebar: () => void;
  closeCart: () => void;
  closeChat: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isCartOpen: false,
  isChatOpen: false,
  isSearchOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  closeChat: () => set({ isChatOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}));

// Alias for backward compatibility - pages use useStore to get auth state
export const useStore = useAuthStore;
