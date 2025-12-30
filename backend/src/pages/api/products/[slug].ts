import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
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
      return getProduct(slug as string, res);
    case 'PUT':
      return updateProduct(slug as string, req, res);
    case 'DELETE':
      return deleteProduct(slug as string, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProduct(slug: string, res: NextApiResponse) {
  try {
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message || 'Failed to get product' });
  }
}

async function updateProduct(
  slug: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const product = await Product.findOneAndUpdate(
      { slug },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
}

async function deleteProduct(slug: string, res: NextApiResponse) {
  try {
    const product = await Product.findOneAndUpdate(
      { slug },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete product' });
  }
}
