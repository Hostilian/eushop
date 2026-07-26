# EUshop V243 Continuation Failures

## 2026-07-26T19:28:12Z — Third concurrent worktree branch mutation

- Operation: external agent-skills process advanced the safe branch to
  `bf5c1c4a`, merged it to `main`, advanced `main` to `84d6d57d`, and switched
  the shared primary worktree during refund implementation
- Category: multi-agent coordination / branch isolation failure
- Fallback: restored the safe branch; all refund changes remained intact and
  unrelated skill changes remain preserved in history
- Remaining limitation: branch isolation in the shared primary worktree is not
  reliable, so branch verification remains mandatory before tests and commits

## 2026-07-26T19:23:14Z — Repeated concurrent primary-worktree mutation

- Operation: external process committed the dirty checkout files, added a cart
  commit, switched the shared worktree to `main`, and committed the last test
  repair on `main`
- Category: multi-agent coordination / branch isolation failure
- Evidence: safe branch advanced through `b618f070` and `7cd47e8d`; shared
  worktree then moved to `main` at `64acedde`
- Fallback: restored the safe branch and cherry-picked only the one-file test
  repair as `7413b449`; no reset, force-push, or history rewrite
- Remaining limitation: the external process moved `main`; this agent will not
  rewrite it and will continue verifying the branch before each commit

## 2026-07-26T19:23:14Z — Web Jest mock initialization

- Operation: focused `checkout-vat.test.tsx` run
- Category: introduced test fixture / Jest hoisting error
- Evidence: the mocked services factory read `const` mocks before
  initialization
- Fallback: use inline factory mocks and obtain typed references from the
  mocked module after initialization
- Remaining limitation: none; the focused suite passes 3/3

## 2026-07-26T19:23:14Z — pnpm web test forwarding syntax

- Operation: `pnpm --filter @eushop/web test -- ... --runInBand`
- Category: command invocation syntax
- Retry decision: do not repeat that forwarding form
- Fallback: `pnpm --dir apps/web exec jest ... --runInBand`
- Remaining limitation: none; test and type-check commands pass

## 2026-07-26T19:16:24Z — Concurrent primary-worktree state mutation

- Operation: external process committed and switched the shared primary
  worktree during C-02 implementation
- Category: multi-agent coordination / branch isolation failure
- Evidence: reflog shows `694294ec`, `b8215078`, checkout to `main`, then
  fast-forward merge of the safe child branch
- Fallback: returned to the safe child branch, retained all history, logged the
  event, and adopted branch verification plus explicit path-limited staging
- Remaining limitation: `main` was changed by the concurrent process; this
  agent will not rewrite or force-correct it

## 2026-07-26T19:11:23Z — Focused checkout test expectation

- Operation: 8-test marketplace checkout service/orchestrator/payment suite
- Category: introduced test-expectation error
- Evidence: 7 passed; one Mockito verification expected one line-batch save
  for a cart containing two seller groups
- Fallback: corrected the expectation to the intended two per-seller batches
- Remaining limitation: focused suite rerun is pending

## 2026-07-26T19:11:23Z — PowerShell comma parsing in Maven selector

- Operation: unquoted comma-separated `-Dtest` argument
- Category: shell syntax
- Retry decision: do not repeat unquoted
- Fallback: single-quote the full `-Dtest=...` argument
- Remaining limitation: none

## 2026-07-26T15:08:30Z — pnpm/Jest forwarding syntax

- Operation: `pnpm --filter @eushop/compliance test -- --runInBand ...`
- Category: command invocation syntax
- Retry decision: do not repeat
- Fallback: `pnpm --filter @eushop/compliance exec jest ... --runInBand`
- Remaining limitation: none; fallback and type check passed

## 2026-07-26T15:05:57Z — Windows wildcard path syntax

- Operation: `rg ... db/migrations/*.sql` and a similar composite glob
- Category: shell/path syntax incompatibility
- Retry decision: do not repeat wildcard paths as positional Windows paths
- Fallback: pass the directory and use `-g '*.sql'`
- Remaining limitation: none; fallback succeeded

## 2026-07-26T15:05:57Z — Missing historical VAT test

- Operation: read `packages/compliance/__tests__/vat.test.ts`
- Category: stale assumption/documentation drift
- Retry decision: inspect the test directory instead of retrying the path
- Fallback: confirmed no VAT suite existed and added a narrow suite
- Remaining limitation: new test still requires execution

## 2026-07-26T15:01:30Z — Graphify foreground timeout

- Operation: repository-local `graphify extract ... --code-only --no-cluster`
- Category: long-running local analysis / foreground timeout
- Retry decision: do not launch a duplicate extraction
- Fallback: monitor process `44516` and continue direct source inspection
- Remaining limitation: graph queries are unavailable until `graph.json` is
  finalized

## 2026-07-26T14:59:39Z — Graphify legacy command mismatch

- Operation: `python -m graphify analyze D:\CODING\eushop`
- Category: incompatible tool/skill command version
- Retry decision: do not repeat the same legacy command
- Fallback: run the repository-local Graphify package with offline
  `extract --code-only`, then use its query/affected commands
- Remaining limitation: none expected if local extraction succeeds

## 2026-07-26T14:59:39Z — PowerShell UTC flag mismatch

- Operation: `Get-Date -AsUTC`
- Category: shell/version incompatibility
- Retry decision: do not repeat
- Fallback: `[DateTime]::UtcNow.ToString(...)`
- Remaining limitation: none; fallback succeeded
