import { initAuth0 } from '@auth0/nextjs-auth0';

function getSecret(name: string, devFallback?: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variable ${name} in production. Auth0 will not initialize without it.`
      );
    }
    if (devFallback === undefined) {
      throw new Error(
        `Missing required environment variable ${name} and no fallback provided.`
      );
    }
    return devFallback;
  }
  return value;
}

function getSessionSecret(): string {
  // COMPLIANCE-REVIEW: session secret must be set in all envs
  const value = process.env.SESSION_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variable SESSION_SECRET. Auth0 will not initialize without it.`
      );
    } else {
      return 'dev-session-secret';
    }
  }
  return value;
}

export default initAuth0({
  baseURL: getSecret('AUTH0_BASE_URL', 'https://dev.auth0.com'),
  clientID: getSecret('AUTH0_CLIENT_ID', 'dev-client-id'),
  clientSecret: getSecret('AUTH0_CLIENT_SECRET', 'dev-client-secret'),
  issuerBaseURL: getSecret('AUTH0_ISSUER_BASE_URL', 'https://dev.auth0.com'),
  secret: getSessionSecret(),
});