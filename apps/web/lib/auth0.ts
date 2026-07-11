import { initAuth0 } from '@auth0/nextjs-auth0';

// Fail closed on missing config. A hardcoded fallback `secret` is a critical vuln:
// the session-cookie signing key would be public, so anyone could forge a logged-in
// session. Never provide a default here — require the env var and crash loudly if unset.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Auth0 will not initialize without it. ` +
        `Set it in your environment (e.g. apps/web/.env.local) — do not hardcode a fallback.`
    );
  }
  return value;
}

export default initAuth0({
  baseURL: requireEnv('AUTH0_BASE_URL'),
  clientID: requireEnv('AUTH0_CLIENT_ID'),
  clientSecret: requireEnv('AUTH0_CLIENT_SECRET'),
  issuerBaseURL: requireEnv('AUTH0_ISSUER_BASE_URL'),
  secret: requireEnv('AUTH0_SECRET'),
});
