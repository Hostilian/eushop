import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../globals.css';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Content Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.auth0.com; 
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com;
          img-src 'self' data: https:;
          connect-src 'self' https://*.auth0.com https://*.eushop.eu;
          frame-src 'self' https://*.auth0.com;"
        />

        {/* Security headers via meta tags */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="robots" content="index, follow" />

        {/* Prevent clickjacking */}
        <meta name="frame-options" content="DENY" />
      </Head>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}
