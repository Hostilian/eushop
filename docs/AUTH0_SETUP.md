# Auth0 Setup Guide for EUshop

## Overview
This guide walks you through setting up OAuth 2.0 authentication with Auth0 for the EUshop marketplace.

## Prerequisites
- Auth0 account (https://auth0.com/signup)
- Admin access to Auth0 dashboard

## Step 1: Create Auth0 Application

1. Go to Auth0 Dashboard → Applications
2. Click "Create Application"
3. Choose application type:
   - **Web Application** for Next.js web app
   - **Native** for React Native mobile app
4. Name: "EUshop Web" / "EUshop Mobile"
5. Click "Create"

## Step 2: Configure Application Settings

### For Web App (Next.js):

**Basic Information**
- **Application ID**: Copy this → `NEXT_PUBLIC_AUTH0_CLIENT_ID`
- **Client Secret**: Copy this → `AUTH0_CLIENT_SECRET`
- **Domain**: Copy this → `NEXT_PUBLIC_AUTH0_DOMAIN`

**Application URIs**
- **Allowed Callback URLs**:
  ```
  http://localhost:3000/api/auth/callback
  https://yourdomain.com/api/auth/callback
  ```

- **Allowed Logout URLs**:
  ```
  http://localhost:3000
  https://yourdomain.com
  ```

- **Allowed Web Origins**:
  ```
  http://localhost:3000
  https://yourdomain.com
  ```

### For Mobile App (React Native):

**Application URIs**
- **Allowed Callback URLs**:
  ```
  com.eushop.mobile://localhost/callback
  ```

- **Allowed Logout URLs**:
  ```
  com.eushop.mobile://localhost
  ```

## Step 3: Create Auth0 API

1. Go to Auth0 Dashboard → APIs
2. Click "Create API"
3. Name: "EUshop API"
4. Identifier (Audience): `https://api.eushop.local`
5. Keep "RS256" as signing algorithm
6. Click "Create"

## Step 4: Create Auth0 Rules (Optional but Recommended)

Add custom claims to JWT tokens:

```javascript
function addRoles(user, context, callback) {
  const namespace = 'https://api.eushop.local';
  const roles = user.app_metadata?.roles || ['buyer'];
  
  context.idToken[namespace + '/roles'] = roles;
  context.accessToken[namespace + '/roles'] = roles;
  
  callback(null, user, context);
}
```

## Step 5: Update Environment Variables

Copy to `.env.local`:

```bash
# Auth0
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.eu.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id_from_step_2
AUTH0_CLIENT_SECRET=your_client_secret_from_step_2
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.eu.auth0.com
```

## Step 6: Configure API Gateway for Token Validation

The API Gateway validates Auth0 tokens from frontend requests.

```typescript
// middleware/auth.ts
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH0_CLIENT_SECRET!);

export async function verifyAuth0Token(token: string) {
  try {
    const verified = await jwtVerify(token, secret, {
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      audience: 'https://api.eushop.local'
    });
    return verified.payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Step 7: Test Authentication

### Web App Test:
```bash
cd apps/web
pnpm dev
# Visit http://localhost:3000/api/auth/login
```

### API Gateway Test:
```bash
curl -X GET http://localhost:3000/api/foods \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"
```

## Troubleshooting

**"Invalid token" error?**
- Verify `AUTH0_DOMAIN` is correct
- Check token hasn't expired (access tokens valid 24h by default)
- Verify `API_IDENTIFIER` matches between Auth0 and code

**Callback URL mismatch?**
- Ensure exact match (including http vs https, trailing slash)
- Common issue: `localhost:3000` vs `localhost:3000/`

**CORS errors?**
- Check "Allowed Web Origins" includes your domain
- Verify `NEXT_PUBLIC_AUTH0_DOMAIN` is set in frontend

## Next Steps

1. Implement login/logout buttons in UI
2. Protect API routes with token validation
3. Store user roles/metadata in PostgreSQL on first login
4. Implement role-based access control (RBAC)

## Reference
- [Auth0 Documentation](https://auth0.com/docs)
- [@auth0/nextjs-auth0](https://github.com/auth0/nextjs-auth0)
- [JWT Verification](https://auth0.com/docs/secure/tokens/access-tokens/verify-access-tokens)
