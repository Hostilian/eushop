import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

/**
 * Custom 404 page with SPA redirect support for GitHub Pages.
 *
 * GitHub Pages serves 404.html for any route that doesn't match a static file.
 * This page detects if the URL contains a path we should handle as an SPA route,
 * and if so, redirects to the correct page via client-side navigation.
 *
 * This enables direct URL access (e.g. bookmarks, shared links) to work correctly
 * even though we're serving a static site.
 */
export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // GitHub Pages SPA redirect: if query has a redirect path stored by 404.html
    // See: https://github.com/rafgraph/spa-github-pages
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('p');
    if (redirectPath) {
      // Reconstruct the original URL and redirect
      const cleanPath = redirectPath.replace(/~and~/g, '&');
      router.replace(cleanPath);
<<<<<<< HEAD
      return undefined;
=======
      return;
>>>>>>> pull-1
    }

    // If no redirect, auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Page Not Found — EUshop</title>
        <meta name="robots" content="noindex" />
        {/*
          GitHub Pages SPA 404 redirect script.
          When GitHub Pages serves this 404.html for an unmatched route,
          this script converts the path to a query param and redirects back
          to the index, where Next.js router picks it up.

          This technique is from: https://github.com/rafgraph/spa-github-pages
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  var segmentCount = 1; // Number of path segments in the basePath (/eushop = 1)
  var l = window.location;
  if (l.pathname.slice(1).split('/').length > segmentCount) {
    var path = l.pathname.slice(1).split('/').slice(segmentCount).join('/');
    var query = l.search.slice(1) ? ('~and~' + l.search.slice(1)) : '';
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, segmentCount + 1).join('/') +
      '/?p=/' + path + query + l.hash
    );
  }
})();
`,
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-sand dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Visual */}
          <div className="relative mb-8 inline-flex items-center justify-center">
            <span
              className="text-[120px] font-black text-gray-100 dark:text-gray-800 select-none leading-none"
              aria-hidden="true"
            >
              404
            </span>
            <span className="absolute text-5xl" role="img" aria-label="Lost in Europe">
              🗺️
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-3 font-display">
            Page Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
            This page wandered off the EU Single Market. Don't worry — your cart and account data
            are safe in your browser.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
<<<<<<< HEAD
              <button className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition text-sm">
=======
              <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition text-sm">
>>>>>>> pull-1
                ← Return Home
              </button>
            </Link>
            <Link href="/search">
              <button className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition text-sm">
                Browse Marketplace
              </button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-600 mt-8">
            Auto-redirecting to home in 5 seconds…
          </p>
        </div>
      </div>
    </>
  );
}
