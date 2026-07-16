# CI security controls

Last verified: 2026-07-16.

The canonical workflow is `.github/workflows/ci-cd.yml`. Pull requests run Node quality checks, Maven tests/package, configuration validation, secret scanning, and CodeQL. GitHub Pages deployment runs only after those required jobs succeed on a push to `main`.

The workflow uses `contents: read` by default. Only the Pages deployment job receives `pages: write` and `id-token: write`; CodeQL alone receives `security-events: write`. Do not add broad workflow-level write permissions.

Secret scanning uses Gitleaks. CI commands must not print environment dumps, rendered Compose configuration, or secret-bearing command arguments. The configuration validator intentionally reports paths and missing controls only.

This is a technical control, not a guarantee that all historic credentials have been rotated or that the service is legally compliant.
