#!/usr/bin/env python3
"""
key_daemon.py — Local hourly key pool refresh daemon.

Runs continuously (or once with --once), every hour:
  1. Git-pulls latest validated_keys.json from GitHub
  2. Re-validates keys locally (removes expired/dead ones)
  3. Writes .api_keys_pool.json (hot cache for chat_agent.py)
  4. Updates ACTIVE_API_KEY in .env.local with the best working key
  5. Logs all activity to logs/key_daemon.log

Usage:
  python scripts/key_daemon.py           # Run as daemon (loops forever)
  python scripts/key_daemon.py --once    # One refresh cycle, then exit
  python scripts/key_daemon.py --status  # Print pool status, then exit
"""
import os
import sys
import json
import time
import logging
import argparse
import datetime
import subprocess
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Suppress DeprecationWarnings from datetime.utcnow() on Python 3.12+
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Reconfigure stdout/stderr to UTF-8 on Windows to prevent UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


try:
    import requests
except ImportError:
    print("[ERROR] requests not installed. Run: pip install requests")
    sys.exit(1)

# ─────────────────────────────────────────────
# Paths — all relative to project root
# ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent.resolve()
VALIDATED_KEYS_PATH = PROJECT_ROOT / "data" / "validated_keys.json"
HOT_CACHE_PATH = PROJECT_ROOT / ".api_keys_pool.json"
ENV_LOCAL_PATH = PROJECT_ROOT / ".env.local"
LOGS_DIR = PROJECT_ROOT / "logs"
LOG_FILE = LOGS_DIR / "key_daemon.log"

# Remote fallback (your own repo's raw file)
REMOTE_VALIDATED_KEYS_URL = (
    "https://raw.githubusercontent.com/Hostilian/eushop/main/data/validated_keys.json"
)

HARVEST_SCRIPT = PROJECT_ROOT / "scripts" / "harvest_keys.py"

# ─────────────────────────────────────────────
# Logging — to both stdout and logfile
# ─────────────────────────────────────────────
LOGS_DIR.mkdir(parents=True, exist_ok=True)

handlers = [logging.StreamHandler(sys.stdout)]
try:
    handlers.append(logging.FileHandler(LOG_FILE, encoding="utf-8"))
except Exception:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    handlers=handlers,
)
log = logging.getLogger("key_daemon")

# Known free proxy base URLs (waterfall fallback order)
PROXY_BASE_URLS = [
    "https://aiapiv2.pekpik.com/v1",
    "https://api.pawan.krd/v1",
    "https://aurora.chatie.io/api/v1",
    "https://chatgpt-api.shn.hk/v1",
    "https://api.freegpt35.eu.org/v1",
    "https://openai.api2d.net/v1",
]

REFRESH_INTERVAL_SECONDS = 3600  # 1 hour


# ─────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────

def validate_key(item: dict, timeout: int = 5) -> dict:
    """Quick liveness check for a key. Returns item with updated 'valid' field."""
    item = item.copy()
    item["valid"] = False
    item["validated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    item["working_base_url"] = item.get("working_base_url") or PROXY_BASE_URLS[0]

    key = item["key"]
    model = item.get("model", "gpt-3.5-turbo")

    # Build URL list: working_base_url first, then waterfall
    base_url_primary = item.get("working_base_url") or PROXY_BASE_URLS[0]
    urls_to_try = [base_url_primary] + [u for u in PROXY_BASE_URLS if u != base_url_primary]

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": [{"role": "user", "content": "hi"}], "max_tokens": 1}

    for base_url in urls_to_try[:3]:
        try:
            resp = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                item["valid"] = True
                item["working_base_url"] = base_url
                return item
            elif resp.status_code in (401, 403):
                return item  # Definitively invalid
            elif resp.status_code == 429:
                item["valid"] = True  # Exists but rate-limited
                item["working_base_url"] = base_url
                item["rate_limited"] = True
                return item
        except Exception:
            continue

    return item


# ─────────────────────────────────────────────
# Key pool loading
# ─────────────────────────────────────────────

def load_validated_keys() -> list[dict]:
    """Load keys from local file, then try remote if local is stale/empty."""
    # Try local file first
    if VALIDATED_KEYS_PATH.exists():
        try:
            data = json.loads(VALIDATED_KEYS_PATH.read_text(encoding="utf-8"))
            keys = data.get("keys", [])
            if keys:
                updated = data.get("updated_at", "")
                log.info(f"Loaded {len(keys)} keys from local validated_keys.json (updated: {updated})")
                return keys
        except Exception as e:
            log.warning(f"Failed to read local validated_keys.json: {e}")

    # Try remote
    log.info("Local keys empty or missing — fetching from remote repo...")
    try:
        import urllib.request
        req = urllib.request.Request(
            REMOTE_VALIDATED_KEYS_URL,
            headers={"User-Agent": "EushopKeyDaemon/2.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            keys = data.get("keys", [])
            if keys:
                log.info(f"Loaded {len(keys)} keys from remote validated_keys.json")
                return keys
    except Exception as e:
        log.warning(f"Remote fetch failed: {e}")

    return []


def load_hot_cache() -> list[dict]:
    """Load the local hot cache .api_keys_pool.json."""
    if HOT_CACHE_PATH.exists():
        try:
            data = json.loads(HOT_CACHE_PATH.read_text(encoding="utf-8"))
            return data.get("keys", [])
        except Exception:
            pass
    return []


# ─────────────────────────────────────────────
# Git pull
# ─────────────────────────────────────────────

def git_pull():
    """Run git pull in the project root to get latest validated_keys.json."""
    try:
        result = subprocess.run(
            ["git", "pull", "--ff-only"],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            log.info(f"git pull OK: {result.stdout.strip()}")
        else:
            log.warning(f"git pull failed: {result.stderr.strip()}")
    except Exception as e:
        log.warning(f"git pull error: {e}")


# ─────────────────────────────────────────────
# Hot cache writing
# ─────────────────────────────────────────────

def write_hot_cache(valid_keys: list[dict]):
    """Write the hot cache file for instant consumption by chat_agent.py."""
    data = {
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "schema_version": "2",
        "total_valid": len(valid_keys),
        "keys": valid_keys,
    }
    HOT_CACHE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")
    log.info(f"Hot cache written: {len(valid_keys)} valid keys -> {HOT_CACHE_PATH}")


# ─────────────────────────────────────────────
# .env.local patching
# ─────────────────────────────────────────────

def patch_env_local(best_key: dict):
    """Write/update ACTIVE_API_KEY and ACTIVE_API_MODEL in .env.local."""
    if not ENV_LOCAL_PATH.exists():
        log.warning(f".env.local not found at {ENV_LOCAL_PATH}, skipping patch")
        return

    try:
        content = ENV_LOCAL_PATH.read_text(encoding="utf-8")
        lines = content.splitlines(keepends=True)

        new_key_line = f"ACTIVE_API_KEY={best_key['key']}\n"
        new_model_line = f"ACTIVE_API_MODEL={best_key.get('model', 'gpt-3.5-turbo')}\n"
        new_base_url_line = f"ACTIVE_API_BASE_URL={best_key.get('working_base_url', PROXY_BASE_URLS[0])}\n"

        updated = {"ACTIVE_API_KEY": False, "ACTIVE_API_MODEL": False, "ACTIVE_API_BASE_URL": False}
        new_lines = []
        for line in lines:
            if line.startswith("ACTIVE_API_KEY="):
                new_lines.append(new_key_line)
                updated["ACTIVE_API_KEY"] = True
            elif line.startswith("ACTIVE_API_MODEL="):
                new_lines.append(new_model_line)
                updated["ACTIVE_API_MODEL"] = True
            elif line.startswith("ACTIVE_API_BASE_URL="):
                new_lines.append(new_base_url_line)
                updated["ACTIVE_API_BASE_URL"] = True
            else:
                new_lines.append(line)

        # Append any missing entries at end
        if not updated["ACTIVE_API_KEY"]:
            new_lines.append(f"\n# Auto-managed by key_daemon.py\n{new_key_line}")
        if not updated["ACTIVE_API_MODEL"]:
            new_lines.append(new_model_line)
        if not updated["ACTIVE_API_BASE_URL"]:
            new_lines.append(new_base_url_line)

        ENV_LOCAL_PATH.write_text("".join(new_lines), encoding="utf-8")
        log.info(
            f"Patched .env.local: key={best_key['key'][:12]}... "
            f"model={best_key.get('model')} "
            f"base_url={best_key.get('working_base_url')}"
        )
    except Exception as e:
        log.error(f"Failed to patch .env.local: {e}")


# ─────────────────────────────────────────────
# Core refresh cycle
# ─────────────────────────────────────────────

def refresh_cycle(run_harvest: bool = False) -> int:
    """
    Execute one full refresh:
      1. git pull
      2. (optionally) run harvest_keys.py locally
      3. load keys
      4. validate
      5. write hot cache
      6. patch .env.local

    Returns the count of valid keys found.
    """
    log.info("-" * 60)
    log.info("Starting refresh cycle")

    # 1. Pull latest from remote
    git_pull()

    # 2. Optional: re-run full harvest locally (slower but more thorough)
    if run_harvest and HARVEST_SCRIPT.exists():
        log.info("Running local harvest_keys.py...")
        try:
            python_exe = str(PROJECT_ROOT / ".venv" / "Scripts" / "python.exe")
            if not Path(python_exe).exists():
                python_exe = sys.executable
            subprocess.run(
                [python_exe, str(HARVEST_SCRIPT)],
                cwd=str(PROJECT_ROOT),
                timeout=120,
            )
        except Exception as e:
            log.warning(f"Local harvest failed: {e}")

    # 3. Load keys (from freshly pulled or remote validated_keys.json)
    keys = load_validated_keys()

    if not keys:
        # Last resort: load hot cache to not starve the agent
        keys = load_hot_cache()
        if keys:
            log.warning("Using stale hot cache — could not fetch fresh keys")
        else:
            log.error("No keys available from any source!")
            return 0

    # 4. Filter to only keys not already known-invalid in hot cache
    # Mark previously-known-bad keys to skip (feedback loop)
    old_cache = load_hot_cache()
    known_invalid = {k["key"] for k in old_cache if not k.get("valid", True)}
    fresh_keys = [k for k in keys if k["key"] not in known_invalid]

    log.info(f"Validating {len(fresh_keys)} keys (skipped {len(keys) - len(fresh_keys)} known-invalid)...")
    workers = min(40, len(fresh_keys)) if fresh_keys else 1

    validated: list[dict] = []
    if fresh_keys:
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(validate_key, item): item for item in fresh_keys}
            for future in as_completed(futures):
                validated.append(future.result())

    valid_keys = [k for k in validated if k.get("valid")]

    # Sort: valid first, then by model priority
    model_scores = {
        "claude": 100, "gpt-4o": 95, "gpt-4": 90, "o1": 88, "o3": 88,
        "gemini-1.5-pro": 85, "gemini-2": 85, "deepseek-r1": 82, "grok": 80,
        "deepseek": 75, "gpt-3.5": 60, "gemini": 60, "llama": 50, "default": 30,
    }

    def score(k):
        m = k.get("model", "").lower()
        for prefix, s in model_scores.items():
            if prefix in m:
                return s
        return 30

    valid_keys.sort(key=score, reverse=True)

    # 5. Write hot cache
    write_hot_cache(valid_keys)

    # 6. Patch .env.local with the best working key
    if valid_keys:
        patch_env_local(valid_keys[0])
        log.info(f"Best key: {valid_keys[0]['key'][:12]}... model={valid_keys[0].get('model')}")
    else:
        log.error("No valid keys found — .env.local NOT updated")

    log.info(f"Refresh complete. {len(valid_keys)} valid / {len(validated)} checked.")
    return len(valid_keys)


# ─────────────────────────────────────────────
# Status display
# ─────────────────────────────────────────────

def show_status():
    """Print current hot cache status to stdout."""
    if not HOT_CACHE_PATH.exists():
        print("[STATUS] No hot cache found. Run key_daemon.py --once to initialize.")
        return

    try:
        data = json.loads(HOT_CACHE_PATH.read_text(encoding="utf-8"))
        updated = data.get("updated_at", "unknown")
        keys = data.get("keys", [])
        total = data.get("total_valid", 0)

        print(f"\n{'=' * 60}")
        print(f"  EUshop API Key Pool — Status")
        print(f"{'=' * 60}")
        print(f"  Last updated : {updated}")
        print(f"  Valid keys   : {total}")
        print(f"{'─' * 60}")

        for i, k in enumerate(keys[:10], 1):
            model = k.get("model", "?")
            base = k.get("working_base_url", "?")
            rate = "[RATE_LIMITED]" if k.get("rate_limited") else ""
            print(f"  {i:2}. {k['key'][:12]}... | {model:<30} | {base} {rate}")

        if len(keys) > 10:
            print(f"  ... and {len(keys) - 10} more")
        print(f"{'=' * 60}\n")
    except Exception as e:
        print(f"[STATUS ERROR] {e}")


# ─────────────────────────────────────────────
# Main daemon loop
# ─────────────────────────────────────────────

def run_daemon():
    """Run the daemon loop indefinitely."""
    log.info("=" * 60)
    log.info("EUshop Key Daemon v2.0 starting")
    log.info(f"Project root : {PROJECT_ROOT}")
    log.info(f"Hot cache    : {HOT_CACHE_PATH}")
    log.info(f"Refresh every: {REFRESH_INTERVAL_SECONDS}s ({REFRESH_INTERVAL_SECONDS // 60} min)")
    log.info("=" * 60)

    cycle_count = 0
    while True:
        cycle_count += 1
        log.info(f"\n[Cycle #{cycle_count}]")
        try:
            # Run local harvest every 6th cycle (every 6 hours) for deep refresh
            run_harvest = (cycle_count % 6 == 1)
            refresh_cycle(run_harvest=run_harvest)
        except Exception as e:
            log.error(f"Cycle #{cycle_count} failed: {e}", exc_info=True)

        next_run = datetime.datetime.now() + datetime.timedelta(seconds=REFRESH_INTERVAL_SECONDS)
        log.info(f"Next refresh: {next_run.strftime('%Y-%m-%dT%H:%M:%S')}")
        time.sleep(REFRESH_INTERVAL_SECONDS)


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EUshop API Key Pool Daemon")
    parser.add_argument("--once", action="store_true", help="Run one refresh cycle then exit")
    parser.add_argument("--status", action="store_true", help="Print current pool status and exit")
    parser.add_argument("--harvest", action="store_true", help="Also run local harvest_keys.py in the cycle")
    args = parser.parse_args()

    if args.status:
        show_status()
        return

    if args.once:
        log.info("Running single refresh cycle...")
        count = refresh_cycle(run_harvest=args.harvest)
        sys.exit(0 if count > 0 else 1)

    run_daemon()


if __name__ == "__main__":
    main()
