import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import '../globals.css';
import CookieBanner from '../components/CookieBanner';
import { AuthProvider } from '../lib/auth';

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
              background: '#1e3f20',
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

// ─── Theme initializer (runs once on mount) ─────────────────────────────────
// Reads stored theme preference and applies dark class to <html>.
function ThemeInitializer() {
  React.useEffect(() => {
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
  }, []);
  return null;
}

// ─── App Entry Point ──────────────────────────────────────────────────────────
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="EUshop — Pan-European artisanal food marketplace. Buy directly from ID-verified independent producers across the EU Single Market." />

        {/* Open Graph */}
        <meta property="og:title" content="EUshop — Pan-European Artisanal Food Marketplace" />
        {/* COMPLIANCE-REVIEW: og:description must not claim compliance status that hasn't been legally verified. */}
        <meta property="og:description" content="Discover rare artisanal delicacies from independent EU producers. Every seller is ID-verified before listing." />
        <meta property="og:type" content="website" />

        {/* Security headers via meta tags */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="robots" content="noindex, follow" />
        <meta name="frame-options" content="DENY" />
      </Head>

      <ThemeInitializer />

      <AuthProvider>
        <GlobalErrorBoundary>
          <Component {...pageProps} />
          <CookieBanner />
        </GlobalErrorBoundary>
      </AuthProvider>
    </>
  );
}
