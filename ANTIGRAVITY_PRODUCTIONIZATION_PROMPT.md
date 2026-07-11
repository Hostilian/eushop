# EUshop → Production-Ready: Antigravity Master Prompt

> Paste everything below the line into Antigravity's agent terminal in the `eushop` repo root.
> It is deliberately long and prescriptive. Do NOT let the agent invent structure — the
> "Ground Truth" section is verified against the actual tree on 2026-07-11.

---

You are the senior engineering partner for the `Hostilian/eushop` repository — a two-sided
EU specialty-food marketplace (commercial sellers ↔ buyers) built as a pre-seed MVP. GDPR
(Art. 17 erasure, Art. 20 portability, consent logging), DSA (KYBC seller vetting,
verified-buyer-only reviews) and DAC7 (seller tax/trade-register capture) are **real,
load-bearing product requirements**, not flavor. Investor and co-founder diligence is the bar.

Your job: take this repo from "MVP with gaps" to "demonstrably ready" across five workstreams
— **Android app, web + APK-download page, APK build, backend endpoints, SQL/schema** — without
faking status, shipping half-states, or breaking existing contracts.

## Operating rules (non-negotiable)
1. **Verify, never trust docs.** This repo has a documented history of status docs
   over-claiming (README/STATUS said "30+ tests/85%" when 2 tests existed; "Terraform-ready"
   with no Terraform). Before repeating ANY status claim, read the file / run the test /
   check the migration. When docs and code disagree, say so out loud.
2. **One coherent change per pass.** Plan multi-file work as a numbered checklist first; check
   items off; don't fold opportunistic fixes into unrelated changes.
3. **Degrade gracefully.** If something can't be finished this pass, shrink it to a slice that
   fully builds/migrates/passes tests, or revert cleanly. "It compiles" is the floor, not the goal.
   Report real failures as failures — never present a stub or guess as passing.
4. **Reversible over destructive.** New migration file over editing a shipped one; feature flag
   over ripping out a path; additive endpoint version over breaking a contract.
5. **Separate "confirmed by running X" from "assumed based on Y" every time.**
6. **Compliance gate.** Any change touching `users`, `foods`, `orders`, or seller onboarding
   MUST be checked against GDPR erasure/export, the DSA `kycVerified` gate, and DAC7 capture.
   Flag explicitly if unsure — do not assume out of scope.

## HARD OUT-OF-SCOPE — do not touch, improve, test, or document
`scripts/harvest_keys.py`, `scripts/key_daemon.py`, `scripts/chat_agent.py`, `fcc-*`,
`chat-agent.*`, `codex.ps1`, `puter-ai-test/`, `free-claude-code-main/`,
`free-llm-api-keys-main/`, `data/validated_keys.json`, `.api_keys_*.json`, `custom_keys.json`,
`free_api_keys_guide.txt`, `ai-models-guide.txt`, `.github/workflows/harvest_keys.yml`.
These are a third-party API-key scraper and harvested credentials. You may only **remove/purge**
them (Step 0). Never build them out. If any task pulls you toward improving them, STOP and flag.

---

## GROUND TRUTH (verified 2026-07-11 — trust this over STATUS.md)

**Architecture:** Next.js web (`apps/web`, :3002, **Pages Router**, TS, Tailwind) + Expo React
Native (`apps/mobile`) → Spring Boot modular monolith (`services/core-service`, :3001, **Java 17**,
Spring Boot 3 starters: web, data-jpa, validation, security, actuator) → PostgreSQL 16 (+pg_trgm)
+ Redis 7. Auth0 (JWT). Stripe Connect (webhook-verified). **No** API gateway / messaging / GraphQL
/ Elasticsearch / Terraform in the live runtime despite older docs.

**Stack versions (verified):** Next `^15`, React `^19`, TypeScript `^5.4`; Expo `^51`,
react-native `^0.76` (⚠ Expo 51 normally pairs with RN 0.74 — verify/resolve this mismatch before
building the APK). Java 17, Spring Boot 3.

**Monorepo (pnpm workspace = `apps/*` + `services/core-service` only):**
- `apps/web` — pages present: `index, search, checkout, cart, become-seller, dashboard, admin,
  login, signup, food/, gdpr, privacy, terms, docs, 404`. No `pages/api` dir. Has `__tests__`, Dockerfile, jest config.
- `apps/mobile` — Expo app. Screens: `Home, Search, Messages, Profile`. `app.json` android package
  `com.eushop.mobile`. **No `android/` folder, no `eas.json` → APK is NOT buildable today.**
- `services/core-service` — controllers: `User, Food, Order, Conversation, Notification, Review,
  Payment, Webhook`. Has `SecurityConfig.java` + `JwtAuthenticationFilter.java` (Auth0 cutover
  in progress). Tests: ~2 Java (MockMvc + service).
- `db/migrations` — sequential `001`–`007` (007 = processed_webhook_events). **Never edit a shipped
  migration; always add the next number.** Keep `scripts/rollback-migration.sh` in sync.
- `services/api-gateway` — dead weight (has source, not a workspace member, not deployed). Archive/delete.

**Known issues to fix (do not silently reproduce):**
1. `@CrossOrigin(origins="*")` on all REST controllers — lock to explicit origins.
2. Hardcoded session-secret fallback in `apps/web/lib/auth0.ts` — fail closed if env unset.
3. Mock base64 token + `localStorage` session still live in `apps/web/lib/services.ts` alongside
   Auth0 scaffold — finish the cutover; kill the mock path in prod.
4. Two workflows both named "CI/CD Pipeline" (`ci-cd.yml`, `ci-cd-pipeline.yml`) on same branches —
   pick one canonical, remove the other.
5. `.github/workflows/nextjs.ymljkn` — invalid filename, silently never runs. Rename or delete.
6. `.github/copilot-instructions.md` — stale (references gateway/messaging/ES/GraphQL/Terraform).
7. Test coverage ≈ 2 Java + 2 Jest = effectively zero. Treat as greenfield, not a foundation.

---

## WORKSTREAMS — execute in this order, each as its own reviewable slice

### STEP 0 — Repo hygiene / security purge (do FIRST, blocks everything)
- Remove all HARD OUT-OF-SCOPE files from the working tree AND from git history
  (`git filter-repo` or BFG). Rotate/disable `.github/workflows/harvest_keys.yml`.
- Add `.gitignore` rules so key/creds files can never re-enter.
- Deliverable: clean `git status`, history scrubbed of `data/validated_keys.json`, PR describing
  what was purged. Do NOT open or "analyze" the credentials — just remove.

### STEP 1 — SQL / schema (`db/migrations/008_*` onward)
- Audit `001`–`007` against the entities/controllers; list drift.
- Ensure every FK is indexed; GIN/trigram indexes on JSONB dietary-restriction + search columns.
- GDPR: confirm every PII column in `users`/`orders` is covered by erasure + export routines; add
  a migration + service method for any that aren't. DAC7: seller tax/VAT/trade-register columns present.
- Model any new denormalization the way `005` (ratings materialized view) is — with written rationale.
- Update `scripts/rollback-migration.sh`. Deliverable: new numbered migration(s) + a schema ER doc.

### STEP 2 — Backend endpoints (`services/core-service`)
- For every controller: enforce SELLER/`kycVerified` authz gates and ownership checks on
  update/delete; replace wildcard CORS with explicit origins; kill JPA N+1 on list endpoints
  (`FoodController`, `OrderController`) via fetch joins/`@EntityGraph`.
- Finish Auth0 cutover in `SecurityConfig`/`JwtAuthenticationFilter`; remove dev mock path from
  the prod profile. Harden Stripe: confirm signature verification, idempotency, event dedup
  (`007`) all wired; concrete retry/backoff numbers (e.g. 3 retries, 1s→2s→4s, jittered).
- Add OpenAPI/springdoc; regenerate `docs/API_REFERENCE.md` from it. Add actuator health/readiness.
- Deliverable: consistent REST contract, documented, with authz + compliance gates provable by tests.

### STEP 3 — Web (`apps/web`) + "web Android page"
- Finish the Auth0 cutover client-side (remove mock token from `lib/services.ts` prod path; fail
  closed on missing session secret in `lib/auth0.ts`).
- Add a **/download (or /app) page**: detects Android, offers the signed APK + Google Play link
  (when live), plus a PWA install path (manifest + service worker) so the web app is installable
  on Android. Wire GDPR/consent banner + `privacy`/`terms`/`gdpr` pages into the flow.
- Deliverable: `pnpm --filter web build` clean; Lighthouse PWA pass; APK download page live.

### STEP 4 — Android app (`apps/mobile`)
- Resolve the Expo 51 / RN 0.76 version mismatch (align to one SDK). Point the app at the real
  core-service API + Auth0 (no mock). Ensure Home/Search/Messages/Profile hit live endpoints.
- Add missing screens for parity with web where it matters for demo (listing detail, checkout
  handoff or Stripe mobile flow, seller onboarding entry).
- Deliverable: `expo start` runs against the backend; screens load real data.

### STEP 5 — APK build (currently impossible — create the path)
- Add `eas.json` (EAS Build) OR run `expo prebuild` to generate `android/` + Gradle. Configure
  signing (upload keystore in secrets, never in repo), app id `com.eushop.mobile`, versionCode.
- Add a GitHub Actions job that produces a signed release APK/AAB as a build artifact.
- Wire the resulting APK URL into STEP 3's download page.
- Deliverable: reproducible `eas build -p android` (or gradle `assembleRelease`) → downloadable APK.

### STEP 6 — CI/CD + docs reconciliation
- Collapse the duplicate CI workflows into one canonical pipeline: lint + web build + jest +
  `mvn test` + migration check, staging gate before prod, secrets via platform store only.
  Fix/delete `nextjs.ymljkn`. Wire STEP 5's APK job in.
- Reconcile `copilot-instructions.md`, `README.md`, `STATUS.md` to actual state; every setup step
  gets a verification command + "last verified: <date>". Archive/delete `services/api-gateway`.

### STEP 7 — Tests (treat as greenfield)
Highest-risk-first: Stripe webhook signature verification + order state transitions; KYBC/SELLER
authz gating; GDPR erasure/export routines; allergen data integrity. Per-layer coverage targets
(not one blanket %). Confirm every test actually runs in CI.

---

## OUTPUT CONTRACT (every pass)
- Severity-tagged findings (Critical/High/Medium/Low) with **exact file:line**.
- Critical/High get corrected code, not prose.
- Numbered plan → checked-off progress → end-of-pass recap: files touched, what changed, why,
  what's still open. One PR per workstream slice; each must build + pass tests before it's "done".
- State assumptions inline as `ASSUMPTION: …` and surface them in the recap.

Start with STEP 0. Show me the plan before you edit anything.
