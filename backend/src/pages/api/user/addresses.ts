import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';
import { IAddress } from '@/models/User';
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
        return getAddresses(authUser.userId, res);
      case 'POST':
        return addAddress(authUser.userId, req, res);
      case 'PUT':
        return updateAddress(authUser.userId, req, res);
      case 'DELETE':
        return deleteAddress(authUser.userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Address error:', error);
    res.status(500).json({ error: error.message || 'Address operation failed' });
  }
}

async function getAddresses(userId: string, res: NextApiResponse) {
  const user = await User.findById(userId).select('addresses');

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({ addresses: user.addresses });
}

async function addAddress(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { label, street, city, state, pincode, isDefault } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // If this is the default address, unset other defaults
  if (isDefault) {
    user.addresses.forEach((addr: IAddress) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    label,
    street,
    city,
    state,
    pincode,
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();

  res.status(201).json({
    message: 'Address added successfully',
    addresses: user.addresses,
  });
}

async function updateAddress(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { addressId, label, street, city, state, pincode, isDefault } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const addressIndex = user.addresses.findIndex(
    (addr: IAddress) => addr._id?.toString() === addressId
  );

  if (addressIndex === -1) {
    return res.status(404).json({ error: 'Address not found' });
  }

  // If this is the default address, unset other defaults
  if (isDefault) {
    user.addresses.forEach((addr: IAddress) => {
      addr.isDefault = false;
    });
  }

  user.addresses[addressIndex] = {
    ...user.addresses[addressIndex],
    _id: user.addresses[addressIndex]._id,
    label: label || user.addresses[addressIndex].label,
    street: street || user.addresses[addressIndex].street,
    city: city || user.addresses[addressIndex].city,
    state: state || user.addresses[addressIndex].state,
    pincode: pincode || user.addresses[addressIndex].pincode,
    isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
  };

  await user.save();

  res.status(200).json({
    message: 'Address updated successfully',
    addresses: user.addresses,
  });
}

async function deleteAddress(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { addressId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const addressIndex = user.addresses.findIndex(
    (addr: IAddress) => addr._id?.toString() === addressId
  );

  if (addressIndex === -1) {
    return res.status(404).json({ error: 'Address not found' });
  }

  const wasDefault = user.addresses[addressIndex].isDefault;
  user.addresses.splice(addressIndex, 1);

  // If deleted address was default, make first address default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    message: 'Address deleted successfully',
    addresses: user.addresses,
  });
}
