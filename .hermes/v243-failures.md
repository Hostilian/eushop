# EUshop V243 Continuation Failures

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
