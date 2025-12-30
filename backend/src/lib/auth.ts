import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  email: string;
  employeeId: string;
  role: 'user' | 'admin';
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export function authenticateRequest(req: NextApiRequest): JwtPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export function requireAuth(req: NextApiRequest): JwtPayload {
  const user = authenticateRequest(req);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export function requireAdmin(req: NextApiRequest): JwtPayload {
  const user = requireAuth(req);
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}
