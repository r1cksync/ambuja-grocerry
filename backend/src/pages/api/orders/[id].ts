import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
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

    const { id } = req.query;

    switch (req.method) {
      case 'GET':
        return getOrder(authUser.userId, id as string, res);
      case 'PATCH':
        return cancelOrder(authUser.userId, id as string, req, res);
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

async function getOrder(
  userId: string,
  orderId: string,
  res: NextApiResponse
) {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.status(200).json({ order });
}

async function cancelOrder(
  userId: string,
  orderId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check if order can be cancelled
  if (['delivered', 'cancelled'].includes(order.orderStatus)) {
    return res.status(400).json({
      error: `Order cannot be cancelled as it is already ${order.orderStatus}`,
    });
  }

  // Update order status
  order.orderStatus = 'cancelled';
  order.cancelReason = reason || 'Cancelled by user';
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  res.status(200).json({
    message: 'Order cancelled successfully',
    order,
  });
}
