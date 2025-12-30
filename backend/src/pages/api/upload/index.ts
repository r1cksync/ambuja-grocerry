import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrlForUpload } from '@/lib/s3';
import { requireAuth } from '@/lib/auth';
import { handleCors } from '@/lib/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAuth(req);

    const { fileName, fileType, folder = 'uploads' } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Generate unique key
    const ext = fileName.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    // Get signed URL
    const signedUrl = await getSignedUrlForUpload(key, fileType);

    // Generate public URL
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      signedUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Upload URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
}
