/**
 * API Configuration
 * Environment-specific settings for API endpoints
 */

export const API_CONFIG = {
  // API Gateway endpoints
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds

  // Auth0 configuration
  AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
  AUTH0_AUDIENCE: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || '',
  AUTH0_REDIRECT_URI: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/callback',

  // Feature flags
  USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== 'false',
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Cache TTL (Time To Live)
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_BACKOFF: 2, // exponential backoff multiplier
};

// Validate required Auth0 configuration
if (!API_CONFIG.USE_MOCK_AUTH && (!API_CONFIG.AUTH0_DOMAIN || !API_CONFIG.AUTH0_CLIENT_ID)) {
  if (typeof window !== 'undefined') {
    console.warn('Auth0 configuration is incomplete. Using mock authentication.');
  }
}

export default API_CONFIG;
