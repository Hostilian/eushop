import { jwtVerify } from 'jose';

// Get Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'your-domain.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'eushop-api';
const AUTH0_ALGORITHM = 'RS256';

// Cache for JWKS (JSON Web Key Set)
let cachedJWKS: any = null;
let cacheExpiry = 0;

/**
 * Get JWKS from Auth0 (with caching)
 */
async function getJWKS() {
  // Return cached JWKS if still valid
  if (cachedJWKS && Date.now() < cacheExpiry) {
    return cachedJWKS;
  }

  try {
    const response = await fetch(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`);
    cachedJWKS = await response.json();
    // Cache for 1 hour
    cacheExpiry = Date.now() + 60 * 60 * 1000;
    return cachedJWKS;
  } catch (error) {
    console.error('Failed to fetch JWKS from Auth0:', error);
    // Return cached version even if expired (graceful degradation)
    return cachedJWKS;
  }
}

/**
 * Get signing key from JWKS
 */
function getSigningKey(header: any, JWKS: any) {
  const signingKeys = JWKS.keys.filter(
    (key: any) => key.use === 'sig' && key.kty === 'RSA' && key.kid === header.kid
  );

  if (!signingKeys.length) {
    throw new Error(`Unable to find a signing key that matches: ${header.kid}`);
  }

  return signingKeys[0];
}

/**
 * Verify Auth0 JWT token
 * Phase 1: Mock verification (Base64 decode)
 * Phase 2: Real Auth0 verification with jose
 */
export async function verifyAuth0Token(token: string) {
  // Phase 1: Mock verification (for development/testing)
  if (process.env.NODE_ENV === 'development' && process.env.AUTH0_DOMAIN === 'your-domain.auth0.com') {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      return {
        sub: decoded.sub,
        email: decoded.email,
        aud: decoded.aud || AUTH0_AUDIENCE,
        iss: decoded.iss || `https://${AUTH0_DOMAIN}/`,
      };
    } catch (error) {
      throw new Error('Invalid mock token format');
    }
  }

  // Phase 2: Real Auth0 verification
  try {
    const JWKS = await getJWKS();
    const signingKey = getSigningKey({ kid: token.split('.')[0] }, JWKS);

    const secret = await jwtVerify(
      token,
      async () => signingKey,
    );

    return {
      sub: secret.payload.sub as string,
      email: secret.payload.email as string,
      aud: secret.payload.aud as string,
      iss: secret.payload.iss as string,
    };
  } catch (error: any) {
    console.error('Auth0 token verification failed:', error.message);
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Verify token is from Auth0
 */
export function isAuth0Token(token: string): boolean {
  return token.split('.').length === 3; // JWT has 3 parts
}

/**
 * Generate mock Auth0 token for testing (Phase 1)
 */
export function generateMockAuth0Token(userId: string, email: string) {
  return Buffer.from(
    JSON.stringify({
      iss: `https://${AUTH0_DOMAIN}/`,
      sub: userId,
      aud: AUTH0_AUDIENCE,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      email,
      email_verified: true,
    })
  ).toString('base64');
}
