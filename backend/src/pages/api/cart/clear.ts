import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { requireAuth } from '@/lib/auth';
import { handleCors } from '@/lib/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = requireAuth(req);
    await dbConnect();

    const cart = await Cart.findOneAndUpdate(
      { user: authUser.userId },
      { items: [], totalItems: 0, subtotal: 0, discount: 0, total: 0 },
      { new: true }
    );

    res.status(200).json({ cart, message: 'Cart cleared successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message || 'Failed to clear cart' });
  }
}
