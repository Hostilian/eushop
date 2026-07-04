import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Keyset cache helper
let jwksResolver: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKSResolver() {
  if (!jwksResolver && process.env.AUTH0_DOMAIN) {
    const domain = process.env.AUTH0_DOMAIN.startsWith('http')
      ? process.env.AUTH0_DOMAIN
      : `https://${process.env.AUTH0_DOMAIN}`;
    jwksResolver = createRemoteJWKSet(new URL(`${domain}/.well-known/jwks.json`));
  }
  return jwksResolver;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  authMethod?: 'mock' | 'jwt';
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts.shift()!.trim()] = decodeURI(parts.join('='));
    }
  });
  return list;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authorization header must use Bearer scheme' });
    }
    token = authHeader.split(' ')[1];
  } else {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies['token'] || '';
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization token' });
  }

  // Fallback for Mock Auth (development mode)
  if (process.env.USE_MOCK_AUTH === 'true' || !process.env.AUTH0_DOMAIN) {
    // Security: NEVER allow mock auth in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized', message: 'Mock authentication is disabled in production' });
    }

    try {
      // Decode mock base64 token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (!decoded || typeof decoded !== 'object') {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token structure' });
      }

      req.userId = decoded.sub || decoded.userId || 'mock-user-id';
      req.userEmail = decoded.email || 'mock-user@eushop.eu';
      req.userRole = decoded.role || 'buyer';
      req.authMethod = 'mock';

      // Security: Validate role is one of the expected application roles
      const validRoles = ['buyer', 'seller', 'admin', 'moderator'];
      if (!validRoles.includes(req.userRole)) {
        req.userRole = 'buyer'; // Default to least privileged role
      }

      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Failed to parse mock token' });
    }
  }

  // Real Auth0 JWT Verification
  try {
    const JWKS = getJWKSResolver();
    if (!JWKS) {
      throw new Error('JWKS keyset resolver could not be initialized');
    }

    const domain = process.env.AUTH0_DOMAIN.startsWith('http')
      ? process.env.AUTH0_DOMAIN
      : `https://${process.env.AUTH0_DOMAIN}`;

    // Security: Enforce RS256 algorithm and validate domain and audience
    const { payload } = await jwtVerify(token, JWKS, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${domain}/`,
      algorithms: ['RS256'],
    });

    if (!payload.sub) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token missing subject claim' });
    }

    req.userId = payload.sub;
    req.userEmail = (payload.email as string) || '';
    req.userRole = (payload['https://eushop.eu/role'] as string) || 'buyer';
    req.authMethod = 'jwt';

    // Security: Validate role is one of the expected application roles
    const validRoles = ['buyer', 'seller', 'admin', 'moderator'];
    if (!validRoles.includes(req.userRole)) {
      req.userRole = 'buyer';
    }

    return next();
  } catch (error: any) {
    // Security: Do not expose raw internal error details to client in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Invalid JWT signature or expired token'
      : error.message;

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid JWT signature or expired token',
      details: errorMessage,
    });
  }
}
