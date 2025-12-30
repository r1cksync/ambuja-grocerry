import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
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
        return getCart(authUser.userId, res);
      case 'POST':
        return addToCart(authUser.userId, req, res);
      case 'PUT':
        return updateCartItem(authUser.userId, req, res);
      case 'DELETE':
        return removeFromCart(authUser.userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Cart error:', error);
    res.status(500).json({ error: error.message || 'Cart operation failed' });
  }
}

async function getCart(userId: string, res: NextApiResponse) {
  let cart = await Cart.findOne({ user: userId })
    .populate('items.product', 'name slug thumbnail price mrp discount stock unit quantity');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  res.status(200).json({ cart });
}

async function addToCart(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { productId, quantity = 1 } = req.body;

  // Get product details
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!product.isActive) {
    return res.status(400).json({ error: 'Product is not available' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (newQuantity > product.maxOrderQty) {
      return res.status(400).json({
        error: `Maximum ${product.maxOrderQty} items allowed`,
      });
    }
    
    if (newQuantity > product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  await cart.save();

  // Populate and return
  cart = await Cart.findById(cart._id)
    .populate('items.product', 'name slug thumbnail price mrp discount stock unit quantity');

  res.status(200).json({ cart });
}

async function updateCartItem(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  if (quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Verify stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (quantity > product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    if (quantity > product.maxOrderQty) {
      return res.status(400).json({
        error: `Maximum ${product.maxOrderQty} items allowed`,
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
  }

  await cart.save();

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name slug thumbnail price mrp discount stock unit quantity');

  res.status(200).json({ cart: updatedCart });
}

async function removeFromCart(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  cart.items = cart.items.filter(
    (item: any) => item.product.toString() !== productId
  );

  await cart.save();

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name slug thumbnail price mrp discount stock unit quantity');

  res.status(200).json({ cart: updatedCart });
}
