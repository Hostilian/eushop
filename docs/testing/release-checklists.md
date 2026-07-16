# Release, smoke-test, and rollback checklists

Last verified: 2026-07-16.

## Release blockers

- Required CI jobs are green: Node, Maven, configuration, and security.
- The static export contains `index.html` and `versions/index.html`.
- No unresolved high-severity dependency or secret-scanning finding is waived.
- Required deployment configuration and Kubernetes probes validate.
- COMPLIANCE-REVIEW: a qualified legal/tax reviewer approves any change that affects regulatory behavior or claims.

## Post-deploy smoke test

- Open the GitHub Pages root and version portal in a private browser session.
- Confirm navigation, search controls, and empty/unavailable states remain usable with the API unavailable.
- Confirm failed images display an accessible placeholder and no payment success state appears without provider confirmation.
- Verify a protected action fails closed when authentication is unavailable.
- Check browser console and the deployment workflow for actionable errors only; never paste environment values into an issue or log.

## Rollback

1. Identify the last known-good GitHub Actions Pages deployment and its commit.
2. Redeploy that reviewed commit through the normal Pages workflow; do not edit production files in the Pages artifact.
3. Re-run the smoke test above and record the incident without sensitive data.
4. Keep the failed revision available for diagnosis, then fix it in a new reviewed change. Do not bypass required CI jobs to restore service.
