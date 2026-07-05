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
  // Security: Set security headers for authentication endpoints
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

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

  // Security: Validate token length to prevent DoS with very long tokens
  if (token.length > 8192) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token too long' });
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
      // Security: Validate base64 encoding before parsing
      if (!/^[A-Za-z0-9+/=]+$/.test(token)) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token encoding' });
      }
      
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (!decoded || typeof decoded !== 'object') {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token structure' });
      }

      // Security: Validate and sanitize user inputs
      req.userId = String(decoded.sub || decoded.userId || 'mock-user-id').substring(0, 128);
      req.userEmail = String(decoded.email || 'mock-user@eushop.eu').substring(0, 255);
      req.userRole = String(decoded.role || 'buyer').substring(0, 20);
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

    // Security: Enforce RS256 algorithm and validate domain and audience with strict validation
    const { payload } = await jwtVerify(token, JWKS, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${domain}/`,
      algorithms: ['RS256'],
      clockTolerance: 30, // Allow 30 seconds clock skew
    });

    if (!payload.sub) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token missing subject claim' });
    }

    // Security: Validate token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token has expired' });
    }

    req.userId = String(payload.sub).substring(0, 128);
    req.userEmail = (payload.email ? String(payload.email).substring(0, 255) : '');
    req.userRole = (payload['https://eushop.eu/role'] ? String(payload['https://eushop.eu/role']).substring(0, 20) : 'buyer');
    req.authMethod = 'jwt';

    // Security: Validate role is one of the expected application roles
    const validRoles = ['buyer', 'seller', 'admin', 'moderator'];
    if (!validRoles.includes(req.userRole)) {
      req.userRole = 'buyer';
    }

    return next();
  } catch (error: any) {
    // Graceful degradation: Provide appropriate error messages based on error type
    let errorMessage = 'Invalid JWT signature or expired token';
    let statusCode = 401;
    
    // Differentiate between different types of errors for better user experience
    if (error.code === 'ERR_JWT_EXPIRED') {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      errorMessage = 'Invalid token claims. Please log in again.';
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      // Graceful fallback for network issues
      errorMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      statusCode = 503; // Service Unavailable
    } else if (error.message?.includes('clock')) {
      errorMessage = 'System clock mismatch. Please check your device time and try again.';
    }
    
    // Security: Do not expose raw internal error details to client in production
    const safeDetails = process.env.NODE_ENV === 'production'
      ? errorMessage
      : error.message || 'Authentication failed';

    // Log the error for server-side monitoring
    console.error('Authentication error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return res.status(statusCode).json({
      error: 'Unauthorized',
      message: errorMessage,
      details: safeDetails,
      // Graceful degradation suggestion for clients
      ...(statusCode === 503 && { retryAfter: 60 })
    });
  }
}
