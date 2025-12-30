import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  appliedCoupon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
});

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    appliedCoupon: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
CartSchema.pre('save', function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.totalItems = this.items.reduce((acc: number, item: ICartItem) => acc + item.quantity, 0);
  this.subtotal = this.items.reduce((acc: number, item: ICartItem) => acc + item.price * item.quantity, 0);
  
  // Free delivery for orders above 500
  this.deliveryCharge = this.subtotal >= 500 ? 0 : 40;
  
  this.total = this.subtotal - this.discount + this.deliveryCharge;
  
  next();
});

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
