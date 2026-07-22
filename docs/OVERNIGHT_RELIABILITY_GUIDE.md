# EUshop Unattended Overnight Reliability & Operations Guide

This document is the canonical operational manual for running the EUshop platform and autonomous AI agent framework unattended for long periods.

---

## 🚀 Quick Commands Summary

| Action | Command Line |
| :--- | :--- |
| **Start Supervised Service** | `powershell -ExecutionPolicy Bypass -File .\scripts\Start-EUshop-Supervised.ps1` |
| **Check System Status** | `powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-Status.ps1` |
| **Follow Live Logs** | `powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -Follow` |
| **Filter Log Errors** | `powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -ErrorsOnly` |
| **View Restart History** | `powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -RestartHistory` |
| **Stop Watchdog Service** | `powershell -ExecutionPolicy Bypass -File .\scripts\EUshop-Agent-Watchdog.ps1 -Stop` |
| **Run Resilience Tests** | `powershell -ExecutionPolicy Bypass -File .\scripts\Test-OvernightResilience.ps1` |

---

## 🏛️ Architecture & Supervision Layers

```
┌─────────────────────────────────────────────────────────────┐
│              Start-EUshop-Supervised.ps1                    │
│            (Production Process Supervisor)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│   Agent Watchdog      │             │  Agent Orchestrator   │
│  (3-Tier Health Check)│ ──────────> │   (Autonomous Loop)   │
└───────────────────────┘             └───────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │   Circuit Breaker     │
                                      │ (12 Provider Tiers)   │
                                      └───────────────────────┘
```

### 1. 3-Tier Health Supervision
- **Tier 1 (Process)**: Monitors OS process IDs (`watchdog.pid`, `supervisor.pid`, `AGENT_FAILOVER.lock`).
- **Tier 2 (App)**: Verifies Next.js web application (`apps/web`) and Spring Boot monolith (`services/core-service`) integrity.
- **Tier 3 (AI Gateway)**: Conducts synthetic health pings against `http://127.0.0.1:8082/health` with strict 4s timeouts.

### 2. Circuit Breaker & Fallback Chain
- Providers automatically transition through `CLOSED` (Healthy) $\rightarrow$ `OPEN` (Tripped after 3 errors, 15m cooldown) $\rightarrow$ `HALF-OPEN` (Probe test).
- **Fallback Chain**:
  1. FCC Gateway (`http://127.0.0.1:8082`)
  2. Codex (ChatGPT session token)
  3. OpenRouter (`openrouter/free` models)
  4. Gemini CLI Engine
  5. Local / Offline Survival Mode

---

## 🔒 Secret Safety & Redaction Standards
- Secrets (`custom_keys.json`, `.env.local`) are strictly non-tracked.
- `Invoke-LogRotation.ps1` automatically redacts API keys (`sk-...`), bearer tokens, and credentials before writing logs.

---

## 🚑 Incident Recovery & Rollback

### If a background runner stalls:
1. Run status command to identify PID:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-Status.ps1
   ```
2. Clear stale lock files if needed:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\EUshop-Agent-Watchdog.ps1 -Stop
   ```
3. Restart supervised background loop:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\Start-EUshop-Supervised.ps1
   ```

### Emergency Rollback:
- Non-destructive checkpointing saves all progress to `.agent-state/version-55/`.
- To roll back to main baseline SHA:
  ```bash
  git checkout main
  ```
