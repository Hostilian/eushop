# Quality, security, and CI implementation report

Date: 2026-07-16

## Implemented

- Replaced the overlapping CI and Pages workflows with one canonical
  `.github/workflows/ci-cd.yml` workflow.
- Made Node lint, type checks, tests, static export, Maven tests/package,
  configuration validation, Gitleaks, and CodeQL required before Pages deploy.
- Applied default read-only workflow permissions; only Pages and CodeQL jobs
  receive their respective write permissions.
- Added a repository configuration validator and a focused test proving it does
  not emit an environment-value sentinel.
- Added Docker Compose syntax and Kubernetes manifest validation in CI without
  rendering Compose values to logs.
- Made pgAdmin opt-in via the `tools` Compose profile, removed fixed container
  names, and made the Redis health check authenticate using the container
  environment value without exposing it in host logs.
- Added release-blocker, smoke-test, and rollback checklists and CI controls
  documentation.

## Validation

- Passed: `node --test scripts/__tests__/validate-config.test.js` (1/1 tests).
- Passed: `node scripts/validate-config.js`.
- Timed out: `services/core-service/mvnw.cmd --batch-mode --no-transfer-progress test` after 121 seconds while Maven was compiling. No test result was produced.
- Unavailable in this workspace: `pnpm`, Docker, and kubectl. `corepack pnpm`
  could not create its user-level cache due to sandbox permissions, so Node
  package tests/build and container/Kubernetes validation could not run locally.

## Graceful degradation

- Public Pages deployment is withheld if required quality or security checks
  fail; it is not replaced by a false-success deployment.
- Configuration validation reports missing file/probe names without exposing
  environment values.
- pgAdmin remains available only when explicitly requested with
  `docker compose --profile tools up`.

## Risks and follow-up

- The repository currently ignores and does not commit `pnpm-lock.yaml`; CI uses
  `--no-frozen-lockfile` explicitly as a temporary compatibility measure. Add a
  reviewed lockfile and change CI back to `--frozen-lockfile` for reproducible
  dependency resolution.
- The old Android workflow remains separate because it is a manually triggered
  mobile build path; its optional cloud-build behavior should be reviewed when
  the mobile release path is made mandatory.
- Gitleaks may surface historic repository findings. Findings require triage or
  authorized credential rotation; do not silence the scanner.
- Kubernetes and Docker validation will run in GitHub Actions; local tooling was
  absent, not treated as a successful local check.

## Likely merge conflicts

- `.github/workflows/ci-cd.yml`, `docker-compose.yml`, `SECURITY.md`,
  `package.json`, and `CHANGELOG.md` may overlap with other quality/security or
  release work.
