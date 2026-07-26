---
name: eushop-error-boundary-resilience
description: Next.js Error Boundary & Graceful Degradation Skill — implements React error boundaries, fallback UI, and retry mechanisms for resilient user experience.
---

# Next.js Error Boundary & Resilience Patterns

## Error Boundary Implementation
```tsx
// components/ErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info);
    // Send to error tracking (Sentry/OpenTelemetry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Graceful Degradation Patterns
1. **Product images**: Show placeholder if CDN fails
2. **Search**: Fall back to basic SQL search if OpenSearch is down
3. **Allergen data**: Show "Allergen information unavailable" — NEVER hide
4. **Payment**: Disable checkout cleanly if Stripe is unavailable (don't throw)
5. **Geo features**: Disable PDO/PGI filter if PostGIS query fails

## Never Fail Silently on Compliance Data
Allergen declarations and DSA Art.30 data must NEVER be hidden by an error boundary — they should show an explicit error state instead.
