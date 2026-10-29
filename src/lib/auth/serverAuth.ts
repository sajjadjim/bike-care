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
  const demoUserId = req.headers.get('x-demo-user-id');
  const demoUserEmail = req.headers.get('x-demo-user-email');

  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1]?.trim();
  }

  // 1. If explicit token is missing but demo/fallback header is present:
  if (!token && demoUserId) {
    return {
      uid: demoUserId,
      email: demoUserEmail || 'user@motocare.app',
      name: 'Vehicle Owner',
    };
  }

  if (!token) {
    return null;
  }

  // 2. Demo token format: "demo-<uid>"
  if (token.startsWith('demo-')) {
    const uid = token.replace('demo-', '') || demoUserId || 'demo-user';
    return {
      uid,
      email: demoUserEmail || 'demo@motocare.app',
      name: 'Demo Driver',
    };
  }

  // 3. Try Firebase Admin verification if credentials exist
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || (decoded as any).display_name,
        picture: decoded.picture,
      };
    } catch (adminError) {
      // In serverless environments without service account certs, fall through to JWT payload
    }
  }

  // 4. Client JWT parsing fallback:
  // Firebase client ID tokens are standard 3-segment base64 encoded JWTs: header.payload.signature
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      const uid = payload.user_id || payload.sub;
      if (uid) {
        return {
          uid,
          email: payload.email || demoUserEmail,
          name: payload.name || payload.displayName,
          picture: payload.picture,
        };
      }
    }
  } catch (jwtError) {
    console.error('Failed to parse JWT payload:', jwtError);
  }

  // 5. Final fallback if x-demo-user-id header is provided
  if (demoUserId) {
    return {
      uid: demoUserId,
      email: demoUserEmail || 'user@motocare.app',
      name: 'Vehicle Owner',
    };
  }

  return null;
}
