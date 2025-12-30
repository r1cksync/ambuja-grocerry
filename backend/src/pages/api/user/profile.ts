import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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
        return getProfile(authUser.userId, res);
      case 'PUT':
        return updateProfile(authUser.userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message || 'Profile operation failed' });
  }
}

async function getProfile(userId: string, res: NextApiResponse) {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ user });
}

async function updateProfile(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, phone, avatar } = req.body;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    message: 'Profile updated successfully',
    user,
  });
}
