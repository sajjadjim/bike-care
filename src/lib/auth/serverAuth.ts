import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Extracts and verifies Firebase ID token from Authorization header.
 * Returns the decoded token payload or throws/returns null.
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If running in development and client sent mock header for demo evaluation:
    const devUserId = req.headers.get('x-demo-user-id');
    if (process.env.NODE_ENV !== 'production' && devUserId) {
      return {
        uid: devUserId,
        email: req.headers.get('x-demo-user-email') || 'demo@motocare.app',
        name: 'Demo Pilot',
      };
    }
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  // If Firebase Admin is initialized with credentials, verify securely
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.display_name,
        picture: decoded.picture,
      };
    } catch (error) {
      console.error('Firebase token verification error:', error);
      // Fallback in non-production for dev tokens
      if (process.env.NODE_ENV !== 'production' && token.startsWith('demo-')) {
        return {
          uid: token.replace('demo-', ''),
          email: 'demo@motocare.app',
          name: 'Demo Driver',
        };
      }
      return null;
    }
  }

  // If in dev and admin credentials are pending setup in .env.local
  if (process.env.NODE_ENV !== 'production') {
    return {
      uid: token.startsWith('demo-') ? token.replace('demo-', '') : 'demo-user-123',
      email: 'pilot@motocare.app',
      name: 'MotoCare Pilot',
    };
  }

  return null;
}
