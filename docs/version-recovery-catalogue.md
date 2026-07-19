# EUshop Version Recovery Catalogue

Last verified: 2026-07-18

This catalogue separates three things that the previous version portal mixed
together: the current application, routes within that application, and preserved
static design snapshots. A snapshot is evidence that an artifact exists; it is
not evidence that its depicted features are production-ready or legally
compliant.

## Recovery evidence

- Fixed recovery directory: `D:\CODING\eushop-recovery-20260718-012209`
- Verified pre-existing preservation layers: reachable-object bundle, mirror
  backup, `.git` backup, untracked-file backup, reflog captures, and rescue-ref
  inventories.
- Recovered dangling history: 38 original commits under
  `refs/recovery/dangling/20260718-012209/`.
- Preserved rewrite history: 41 branch-tip refs under
  `refs/recovery/rewrite/20260718-140158/` plus 10 transient rewrite commits
  under `refs/recovery/rewrite-unreachable/20260718-140830/`.
- Reconstructed preflight refs: 68 refs under
  `refs/recovery/preflight/20260718-012209/`.
- Verification: `git fsck --unreachable --no-reflogs` reported zero unreachable
  commits after the recovery refs were restored.

The recovery refs are local preservation refs. They have not been pushed and
must not be treated as deployable branches without a separate safety review.

## Current application views

These are routes in one current Next.js build, not historical releases.

| View | Route | Evidence-based description |
|---|---|---|
| Buyer marketplace | `/` | Current storefront route using demo or API-backed catalogue data. |
| Seller onboarding | `/become-seller/` | Current seller onboarding route; legal and tax outcomes still require qualified human review. |
| Operator dashboard | `/admin/dashboard/` | Current administrative demonstration route; backend authorization must be validated separately. |
| Project documentation | `/docs/` | Repository-backed documentation view; status statements must be checked against source and tests. |

The old portal labels `V1` through `V5` selected these routes or wrote a value to
`localStorage`; they did not identify five immutable builds. The old dynamic
`V15` entry similarly pointed to `/` even though an actual `/v15/` static
snapshot exists. The `V20` label described the current app rather than a frozen
V20 artifact.

## Preserved static snapshots

All 15 directories below contain `index.html`, `app.js`, `data.js`, and
`styles.css`. Their directories are left unchanged by the catalogue/navigation
work.

| Snapshot | Path | Introduced | Lineage | What is actually distinct |
|---|---|---:|---|---|
| V3 | `/v3/` | `d08148c9` | Recovered Cursor/Antigravity prototype | Recovered base prototype with later navigation repairs. |
| V6 | `/v6/` | `4d4b5c27` | Base prototype | Baseline catalogue, listing, and request UI. |
| V7 | `/v7/` | `4d4b5c27` | Core theme variant | Emerald visual treatment over shared logic/data. |
| V8 | `/v8/` | `4d4b5c27` | Core theme variant | Midnight visual treatment over shared logic/data. |
| V9 | `/v9/` | `4d4b5c27` | Core theme variant | Rose visual treatment over shared logic/data. |
| V10 | `/v10/` | `d08148c9` | Core theme variant | Platinum visual treatment over shared logic/data. |
| V11 | `/v11/` | `d08148c9` | Core theme variant | Forest visual treatment over shared logic/data. |
| V12 | `/v12/` | `d08148c9` | Core theme variant | Terracotta visual treatment over shared logic/data. |
| V13 | `/v13/` | `d08148c9` | Core theme variant | Lavender visual treatment over shared logic/data. |
| V14 | `/v14/` | `84fe48fc` | Core theme variant | White-modern markup and styling with shared logic/data. |
| V15 | `/v15/` | `3f44c710` | Core theme variant | Azure styling over the V14 markup; this was previously unlinked. |
| V16 | `/v16/` | `84fe48fc` | Core theme variant | Cherry-blossom visual treatment over shared logic/data. |
| V17 | `/v17/` | `84fe48fc` | Core theme variant | Gold visual treatment over shared logic/data. |
| V18 | `/v18/` | `7057bb84` | Marketplace concept | Independent auction-oriented markup, logic, and data. |
| V19 | `/v19/` | `7057bb84` | Marketplace concept | Independent catalogue-oriented markup, logic, and data. |

Hash comparison confirms that V3 and V6-V17 share common application/data
logic and differ mainly in CSS or markup. V18 and V19 have independent
`index.html`, `app.js`, `data.js`, and `styles.css` content. The gaps in the
snapshot numbering are intentional: no distinct static V1, V2, V4, or V5
artifact was found in the repository or inspected sibling sources.

## Source archaeology

- `D:\CODING\eushopCursor` is a separate Git repository at `8008742e`; its
  `apps/web/public/v3` data and styles match the recovered V3 lineage, while its
  entry markup and script predate later navigation changes.
- `D:\CODING\eushopAntigravity` contains loose static prototype files. Its
  `data.js` matches V3 and V6-V17, and its `styles.css` matches V3. The nested
  Git repository contains only `.gitattributes` at commit `0c9cd176` and does
  not provide additional application history.
- Git history records V6-V9 in `4d4b5c27`, V3 and V10-V13 in `d08148c9`,
  V14/V16/V17 in `84fe48fc`, V15 in `3f44c710`, and V18/V19 in `7057bb84`.

## Interpretation limits

- The V-labels are catalogue identifiers, not semantic versions or signed
  releases.
- Static snapshots contain demonstration data and historical claims that have
  not been re-certified during recovery.
- This recovery implements preservation and truthful navigation structure. It
  does not certify GDPR, DSA, DAC7, VAT, food-law, accessibility, security, or
  production readiness. Qualified legal, tax, security, and accessibility
  review remains required before launch.
