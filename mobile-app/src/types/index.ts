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
  _id?: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'office' | 'other';
  isDefault: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  parentCategory?: string;
  isActive: boolean;
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
  highlights?: string[];
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

export interface OrderItem {
  product: string;
  name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  appliedCoupon?: string;
  deliverySlot?: string;
  notes?: string;
  cancelReason?: string;
  timeline?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
