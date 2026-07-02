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
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURI(parts.join('='));
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
  if (authHeader && authHeader.startsWith('Bearer ')) {
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
    try {
      // Decode mock base64 token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      req.userId = decoded.sub || 'mock-user-id';
      req.userEmail = decoded.email || 'mock-user@eushop.eu';
      req.userRole = decoded.role || 'buyer';
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

    const { payload } = await jwtVerify(token, JWKS, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${domain}/`,
    });

    req.userId = payload.sub;
    req.userEmail = payload.email as string;
    // Map custom claims if mapped in Auth0 rules (defaulting to buyer)
    req.userRole = (payload['https://eushop.eu/role'] as string) || 'buyer';

    return next();
  } catch (error: any) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid JWT signature or expired token',
      details: error.message,
    });
  }
}
