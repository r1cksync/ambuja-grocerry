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

  const { slug } = req.query;

  switch (req.method) {
    case 'GET':
      return getCategory(slug as string, res);
    case 'PUT':
      return updateCategory(slug as string, req, res);
    case 'DELETE':
      return deleteCategory(slug as string, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCategory(slug: string, res: NextApiResponse) {
  try {
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get subcategories
    const subcategories = await Category.find({
      parentCategory: category._id,
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 });

    res.status(200).json({ category, subcategories });
  } catch (error: any) {
    console.error('Get category error:', error);
    res.status(500).json({ error: error.message || 'Failed to get category' });
  }
}

async function updateCategory(
  slug: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const category = await Category.findOneAndUpdate(
      { slug },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ category });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ error: error.message || 'Failed to update category' });
  }
}

async function deleteCategory(slug: string, res: NextApiResponse) {
  try {
    const category = await Category.findOneAndUpdate(
      { slug },
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete category' });
  }
}
