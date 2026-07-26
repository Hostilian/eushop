# Next.js Static Export GitHub Pages Configuration

## Overview
EUshop web app (`apps/web/`) uses Next.js Pages Router with static export for GitHub Pages deployment.

## Key Configuration
```javascript
// next.config.js
module.exports = {
  output: 'export',
  basePath: '/eushop',
  assetPrefix: '/eushop/',
  trailingSlash: true,
  images: { unoptimized: true }, // Required for static export
};
```

## GitHub Actions Deploy
```yaml
- name: Build
  run: npm run build
- name: Deploy to Pages
  uses: actions/deploy-pages@v3
  with:
    artifact_name: github-pages
```

## Routing Constraints
- No API routes in static export
- All data fetching must be `getStaticProps` or `getStaticPaths`
- Dynamic routes require `getStaticPaths` with `fallback: false`
- No `getServerSideProps` — will break build

## Known Issues
- `next/image` requires `unoptimized: true` in static export
- Link components need `as` prop for proper GitHub Pages paths
