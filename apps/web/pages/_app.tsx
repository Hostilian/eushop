import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
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

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
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
        <meta name="frame-options" content="DENY" />
      </Head>

      <ThemeInitializer />

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
    </>
  );
}
