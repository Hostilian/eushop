import { initAuth0 } from '@auth0/nextjs-auth0';

// In production, we must fail closed on missing session secret.
// In development, we can use a fallback secret to allow startup and offline/mock modes.
function getSecret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variable ${name} in production. Auth0 will not initialize without it.`
      );
    }
    return devFallback;
  }
  return value;
}

export default initAuth0({
  baseURL: getSecret('AUTH0_BASE_URL', 'http://localhost:3000'),
  clientID: getSecret('AUTH0_CLIENT_ID', 'dev-client-id'),
  clientSecret: getSecret('AUTH0_CLIENT_SECRET', 'dev-client-secret'),
  issuerBaseURL: getSecret('AUTH0_ISSUER_BASE_URL', 'https://dev.auth0.com'),
  secret: getSecret('AUTH0_SECRET', 'dev-fallback-secret-key-32-chars-long'),
});
