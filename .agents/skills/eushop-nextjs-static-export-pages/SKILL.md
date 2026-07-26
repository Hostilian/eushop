---
name: eushop-nextjs-static-export-pages
description: Next.js Pages Router Static Export Pre-rendering & GitHub Pages Deployment Skill for EUshop
---

# Next.js Static Export Pre-rendering Engine

This skill optimizes Next.js Pages Router static export builds for GitHub Pages.

## Standards
1. **`output: 'export'`**: Ensure `next.config.js` configures `basePath: '/eushop'`, `trailingSlash: true`, `images.unoptimized: true`.
2. **Build Verification**: Verify `out/index.html` and `out/versions/index.html` exist before deploy artifact upload.
