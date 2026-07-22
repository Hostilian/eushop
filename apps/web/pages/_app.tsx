import type { AppProps } from 'next/app';
import Head from 'next/head';
<<<<<<< HEAD
import React from 'react';
=======
import React, { Component, ErrorInfo, ReactNode } from 'react';
>>>>>>> pull-1
import '../globals.css';
import CookieBanner from '../components/CookieBanner';
import ErrorBoundary, { type ErrorRegion } from '../components/common/ErrorBoundary';
import { AuthProvider } from '../lib/auth';
import { purgeUnsafeLegacyStorage } from '../lib/storageSafety';

function getPageRegion(pathname: string): ErrorRegion {
  if (pathname === '/' || pathname === '/search') return 'marketplace';
  if (pathname.startsWith('/food/')) return 'product-details';
  if (pathname === '/cart' || pathname === '/checkout') return 'cart';
  if (pathname === '/become-seller') return 'seller-onboarding';
  if (
    pathname === '/dashboard' ||
    pathname === '/gdpr' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/admin')
  ) return 'account-controls';
  return 'page';
}

function ThemeInitializer() {
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem('eushop-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', stored === 'dark' || (!stored && prefersDark));
    } catch {
      // Theme storage is optional; the default theme remains usable.
    }
  }, []);
  return null;
}

export default function App({ Component, pageProps, router }: AppProps) {
  React.useEffect(() => {
    purgeUnsafeLegacyStorage();
  }, []);

  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline caching is optional and must not interrupt the page.
      });
    };

    window.addEventListener('load', registerServiceWorker);
    return () => window.removeEventListener('load', registerServiceWorker);
  }, []);

<<<<<<< HEAD
=======
// ─── Global Error Boundary ────────────────────────────────────────────────────
// Catches any unhandled React errors and renders a user-friendly fallback
// instead of a blank/crashed screen. This is the top-level resilience layer.

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[EUshop] Uncaught render error:', error, info.componentStack);
    // In a real app, send to an error-tracking service like Sentry here
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('eushop_error_log') || '[]');
      existing.unshift(errorLog);
      // Keep last 20 errors only
      localStorage.setItem('eushop_error_log', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // localStorage may not be available — fail silently
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Navigate to home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
            background: 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #f0f9ff 100%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#1a1a2e',
              marginBottom: '0.5rem',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: '#6b7280',
              maxWidth: '400px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            EUshop encountered an unexpected error. Your local data is safe.
            You can continue using the marketplace by returning to the home page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.7rem',
                color: '#7f1d1d',
                maxWidth: '600px',
                overflow: 'auto',
                textAlign: 'left',
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ← Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Theme + Version initializer (runs once on mount) ────────────────────────
// Reads stored theme preference and applies dark class.
// Also handles ?v= URL query param for direct version-link activation
// (e.g. /eushop/?v=v1 → sets version to v1 instantly)
function ThemeInitializer() {
  React.useEffect(() => {
    // 1. Apply theme
    try {
      const stored = localStorage.getItem('eushop-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // localStorage unavailable — default to light theme
    }

    // 2. Handle ?v= version selector from URL (e.g. /?v=v1, /?v=v3)
    try {
      const params = new URLSearchParams(window.location.search);
      const vParam = params.get('v');
      if (vParam && /^v[1-5]$/.test(vParam)) {
        localStorage.setItem('eushop-demo-version', vParam);
        // Dispatch event so VersionSelector and index page react instantly
        window.dispatchEvent(new Event('demo-version-changed'));
        // Clean up the ?v= param from the URL bar without navigating
        params.delete('v');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    } catch {
      // Silently ignore if URL API unavailable
    }
  }, []);
  return null;
}

// ─── App Entry Point ──────────────────────────────────────────────────────────
export default function App({ Component, pageProps }: AppProps) {
>>>>>>> pull-1
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
<<<<<<< HEAD
        <meta
          name="description"
          content="EUshop — Pan-European artisanal food marketplace connecting buyers with independent producers across the EU Single Market."
        />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#1e3f20" />

        <meta property="og:title" content="EUshop — Pan-European Artisanal Food Marketplace" />
        <meta
          property="og:description"
          content="Discover regional foods from independent European producers with trader information on each listing."
        />
        <meta property="og:type" content="website" />

        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="robots" content="noindex, follow" />
        {/* COMPLIANCE-REVIEW: X-Frame-Options is NOT honoured as a <meta> tag by browsers,
            so the old `<meta name="frame-options" content="DENY">` was inert. Clickjacking
            protection is now enforced via the CSP `frame-ancestors 'none'` directive on
            sensitive pages (checkout). A real HTTP header at the CDN/proxy layer should be
            added site-wide before production. */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
=======
        <meta name="description" content="EUshop — Europe's premier artisanal food marketplace. Discover verified sellers across the EU Single Market." />

        {/* Open Graph */}
        <meta property="og:title" content="EUshop — Pan-European Artisanal Food Marketplace" />
        <meta property="og:description" content="Discover rare artisanal delicacies from verified EU sellers. DSA-compliant, VAT-transparent, allergen-disclosed." />
        <meta property="og:type" content="website" />

        {/* Security headers via meta tags */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="robots" content="index, follow" />
        <meta name="frame-options" content="DENY" />
>>>>>>> pull-1
      </Head>

      <ThemeInitializer />

<<<<<<< HEAD
      <ErrorBoundary region="page" resetKey={router.asPath}>
        <AuthProvider>
          <ErrorBoundary region={getPageRegion(router.pathname)} resetKey={router.asPath}>
            <Component {...pageProps} />
          </ErrorBoundary>
          <ErrorBoundary region="page" compact resetKey={router.asPath}>
            <CookieBanner />
          </ErrorBoundary>
        </AuthProvider>
      </ErrorBoundary>
=======
      <GlobalErrorBoundary>
        <Component {...pageProps} />
        <CookieBanner />
      </GlobalErrorBoundary>
>>>>>>> pull-1
    </>
  );
}
