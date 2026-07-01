import type { AppProps } from 'next/app';
import '../globals.css';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}
