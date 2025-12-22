import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './auth';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user: decoded };
}

export function permissionMiddleware(user: TokenPayload, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role as UserRole)) {
    return { error: 'Forbidden: Insufficient permissions', status: 403 };
  }
  return null;
}

export function locationMiddleware(user: TokenPayload, resourceCountry: string) {
  if (user.role === UserRole.ADMIN) return null; // Admins can access everything

  if (user.country !== resourceCountry) {
    return { error: 'Forbidden: Location restriction', status: 403 };
  }
  return null;
}

// Helper to apply filters to queries
export function getCountryFilter(user: TokenPayload) {
  if (user.role === UserRole.ADMIN) return {};
  return { country: user.country };
}
