# GitHub Actions CI/CD Pipeline Architecture

## Overview
EUshop uses GitHub Actions for automated CI/CD with static export to GitHub Pages.

## Active Workflow Files
- `.github/workflows/ci-cd.yml` — main CI/CD pipeline
- `.github/workflows/codeql.yml` — security scanning

## CI Gates (All must pass before merge)
1. ✅ TypeScript compilation (`tsc --noEmit`)
2. ✅ ESLint (zero errors)
3. ✅ Unit tests (`npm test`)
4. ✅ Playwright E2E (critical journeys)
5. ✅ CodeQL security scan (zero critical)
6. ✅ Bundle size check (< 250KB First Load JS)
7. ✅ Accessibility audit (axe-core, zero violations)

## Deploy Pipeline
```yaml
deploy:
  needs: [ci]
  if: github.ref == 'refs/heads/main'
  steps:
    - run: npm run build
    - uses: actions/upload-pages-artifact@v3
      with: { path: apps/web/out }
    - uses: actions/deploy-pages@v3
```

## Branch Strategy
- `main` → auto-deploys to GitHub Pages
- Feature branches → CI only, no deploy
- PRs require all gates to pass + 1 review

## Environment Variables
Never committed to repo. Set in GitHub Secrets:
- `NEXT_PUBLIC_API_URL`
- `STRIPE_PUBLISHABLE_KEY` (public — OK in frontend)
