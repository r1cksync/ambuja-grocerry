import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import User, { IAddress } from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { handleCors } from '@/lib/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  try {
    const authUser = requireAuth(req);
    await dbConnect();

    switch (req.method) {
      case 'GET':
        return getOrders(authUser.userId, req, res);
      case 'POST':
        return createOrder(authUser.userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Order error:', error);
    res.status(500).json({ error: error.message || 'Order operation failed' });
  }
}

async function getOrders(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = '1', limit = '10', status } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const query: any = { user: userId };
  if (status) {
    query.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}

async function createOrder(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { addressId, paymentMethod = 'cod', deliverySlot, notes } = req.body;

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get address
  const address = user.addresses.find(
    (addr: IAddress) => addr._id?.toString() === addressId
  );
  if (!address) {
    return res.status(400).json({ error: 'Please select a delivery address' });
  }

  // Get cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Verify stock and prepare order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product as any;
    
    if (!product || !product.isActive) {
      return res.status(400).json({
        error: `Product "${product?.name || 'Unknown'}" is no longer available`,
      });
    }
    
    if (product.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}"`,
      });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      thumbnail: product.thumbnail,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
    });
  }

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: {
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    paymentMethod,
    subtotal: cart.subtotal,
    discount: cart.discount,
    deliveryCharge: cart.deliveryCharge,
    total: cart.total,
    appliedCoupon: cart.appliedCoupon,
    deliverySlot,
    notes,
  });

  // Update stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], totalItems: 0, subtotal: 0, discount: 0, total: 0, appliedCoupon: null }
  );

  res.status(201).json({
    message: 'Order placed successfully',
    order,
  });
}
