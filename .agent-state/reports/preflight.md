# Hermes/FCC Preflight Report

Generated: 2026-07-18T11:33:00+02:00
Repository: D:\CODING\eushop
Branch: version-44

## Environment

| Component | Version | Path |
|-----------|---------|------|
| PowerShell | 5.1.22621.6133 | built-in |
| Windows | 10.0.22631.0 | - |
| Git | 2.55.0.windows.1 | - |
| Python | 3.12.5 | - |
| Node.js | 22.11.0 | - |
| npm | 10.9.0 | - |
| pnpm | 9.7.1 | - |

## AI Tool Executables

| Tool | Version | Path | Status |
|------|---------|------|--------|
| hermes.exe | 0.18.2 (2026.7.7.2) | C:\Users\Hostilian\AppData\Local\hermes\hermes-agent\venv\Scripts\hermes.exe | FOUND |
| claude.exe | 2.1.212 | C:\Users\Hostilian\.local\bin\claude.exe | FOUND |
| codex.exe | 0.144.5 | C:\Users\Hostilian\AppData\Local\Programs\OpenAI\Codex\bin\codex.exe | FOUND |
| fcc-work.cmd | 0.0.0.0 | C:\Users\Hostilian\.local\bin\fcc-work.cmd | FOUND |
| lms.exe | 20.12.2.0 | C:\Users\Hostilian\.cache\lm-studio\bin\lms.exe | FOUND |

## FCC Server

| Item | Status |
|------|--------|
| FCC health endpoint | http://127.0.0.1:8082/health = HEALTHY |
| FCC start script | C:\Users\Hostilian\.fcc\Start-FCC-Work.ps1 |
| FCC Claude launcher | C:\Users\Hostilian\.fcc\Start-FCC-Claude-Native.ps1 |
| FCC env file | C:\Users\Hostilian\.fcc\.env (external, untracked) |

## Hermes Configuration

| Item | Value |
|------|-------|
| Config file | C:\Users\Hostilian\AppData\Local\hermes\config.yaml |
| Primary model | openrouter/free |
| Primary provider | openrouter |
| Fallback chain | 6 entries (gemini, kimi, minimax, nvidia, huggingface, alibaba) |
| Max turns | 150 |
| Context compression | enabled at 50% threshold |
| OpenRouter key | <configured> |
| Gemini key | <configured> |
| Kimi key | <configured> |
| MiniMax key | <configured> |
| NVIDIA NIM key | <configured> |
| Anthropic key | NOT SET (using FCC) |

## Credential Conflicts

| Conflict | Status |
|----------|--------|
| ANTHROPIC_API_KEY vs ANTHROPIC_AUTH_TOKEN | No conflict: API_KEY not set, AUTH_TOKEN in FCC env |
| OPENAI_API_KEY vs OPENAI_BASE_URL | Not checked (not primary provider) |

## Security Issues Found

### CRITICAL: custom_keys.json tracked by Git
- File: D:\CODING\eushop\custom_keys.json
- Contains: 4 API key entries (sk-b...a10d pattern)
- Action required: Add to .gitignore, git rm --cached

### data/validated_keys.json tracked by Git
- File: D:\CODING\eushop\data\validated_keys.json
- Contains: Only metadata (total_valid=0, no actual keys)
- Risk: Low, but should still be in .gitignore

## Repository Anomalies

| Item | Classification | Action |
|------|---------------|--------|
| nul | Accidental Windows path artifact (48 bytes) | Archive then remove |
| "The content you provided for `apps" dir | Accidental shell artifact | Archive then remove |
| scripts/harvest_keys.py | Security-sensitive script | Audit before execution |
| scripts/key_daemon.py | Security-sensitive script | Audit before execution |
| CLAUDE.md.backup-20260718-020626 | Backup file | Add to .gitignore |
| scripts/Invoke-FccNonstop.ps1.backup-* | Backup files | Add to .gitignore |

## Git Status

| Item | Status |
|------|--------|
| Branch | version-44 |
| HEAD | c08132da |
| Modified | CLAUDE.md, apps/web/components/user/UserSearch.tsx |
| Deleted | apps/web/tsconfig.tsbuildinfo |
| Modified untracked | data/validated_keys.json |
| Untracked | CLAUDE.md.backup-*, nul, scripts/Invoke-FccNonstop.ps1* |
| Worktrees | 20 worktrees across multiple branches |

## Active Processes (AI-related)

FCC server process confirmed running (health check passed).
No stale AUTONOMOUS_RUNNER.lock file detected.

## Local Model Runtime

LM Studio (lms.exe) installed. Server status unknown - not checked in this preflight.
No Ollama detected.
No llama.cpp server detected.

## Conclusion

- Hermes: OPERATIONAL
- FCC: OPERATIONAL  
- Provider chain: 7+ configured providers available
- Security: ISSUES FOUND (custom_keys.json in git)
- Lock status: NONE (clean)
- Next action: Fix secret tracking, create canonical launcher
