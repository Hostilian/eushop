import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="en" className="">
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />

          {/* Google Fonts — preconnect for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
          {/*
            SPA routing for GitHub Pages: reads ?p=/path set by 404.html and replaces
            the URL in history so Next.js client router handles the correct route.
            See: https://github.com/rafgraph/spa-github-pages
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function() {
  try {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    } else {
      // Handle ?p= style redirect from 404.html
      var params = new URLSearchParams(location.search.slice(1));
      var p = params.get('p');
      if (p) {
        params.delete('p');
        var search = params.toString() ? '?' + params.toString().replace(/~and~/g, '&') : '';
        history.replaceState(null, null, p + search + location.hash);
      }
    }
  } catch(e) {}
})();
`,
            }}
          />
          {/*
            Dark mode initialisation: runs before hydration to read localStorage preference.
            Prevents flash of wrong theme (FOUT) without a server round-trip.
          */}

          <script
            dangerouslySetInnerHTML={{
              __html: `
(function() {
  try {
    var stored = localStorage.getItem('eushop-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

