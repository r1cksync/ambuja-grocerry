import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { handleCors } from '@/lib/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    case 'POST':
      return createCategory(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { parent } = req.query;

    const query: any = { isActive: true };
    
    if (parent === 'null' || parent === 'root') {
      query.parentCategory = null;
    } else if (parent) {
      query.parentCategory = parent;
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message || 'Failed to get categories' });
  }
}

async function createCategory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message || 'Failed to create category' });
  }
}
