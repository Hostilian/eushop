#!/usr/bin/env python3
"""
key_daemon.py — Local always-on API key pool daemon with 9-layer resilience.

RESILIENCE LAYERS (in order of invocation):
  Layer 1: Hot cache (.api_keys_pool.json) — instant, always available
  Layer 2: Local data/validated_keys.json  — git-pulled, refreshed by GH Actions
  Layer 3: Remote validated_keys.json      — fetch from your own GitHub repo
  Layer 4: Re-harvest from 15 source repos — full scrape + validate
  Layer 5: Known-good emergency key store  — embedded fallback keys cache
  Layer 6: Multi-base-URL waterfall        — 6 proxy endpoints per key
  Layer 7: Rate-limited keys as usable     — 429 = key exists, use anyway
  Layer 8: Stale pool extension            — keep using old pool if nothing else works
  Layer 9: Hardcoded test endpoint         — absolute last resort

Usage:
  python scripts/key_daemon.py              # Daemon loop (run forever)
  python scripts/key_daemon.py --once       # One refresh cycle, then exit
  python scripts/key_daemon.py --status     # Print pool status
  python scripts/key_daemon.py --heal       # Force full re-harvest + validate
  python scripts/key_daemon.py --doctor     # Run full diagnostics
"""
import os
import re
import sys
import json
import time
import logging
import argparse
import datetime
import warnings
import subprocess
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# UTF-8 I/O on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
PROJECT_ROOT        = Path(__file__).parent.parent.resolve()
VALIDATED_KEYS_PATH = PROJECT_ROOT / "data" / "validated_keys.json"
HOT_CACHE_PATH      = PROJECT_ROOT / ".api_keys_pool.json"
EMERGENCY_CACHE     = PROJECT_ROOT / ".api_keys_emergency.json"   # Layer 5
ENV_LOCAL_PATH      = PROJECT_ROOT / ".env.local"
LOGS_DIR            = PROJECT_ROOT / "logs"
LOG_FILE            = LOGS_DIR / "key_daemon.log"
HARVEST_SCRIPT      = PROJECT_ROOT / "scripts" / "harvest_keys.py"
CIRCUIT_BREAKER_FILE = PROJECT_ROOT / ".endpoint_health.json"     # Layer 6 circuit breaker

# ─────────────────────────────────────────────────────────────────────────────
# Proxy endpoints (Layer 6 waterfall)
# ─────────────────────────────────────────────────────────────────────────────
PROXY_BASE_URLS = [
    "https://aiapiv2.pekpik.com/v1",
    "https://api.pawan.krd/v1",
    "https://aurora.chatie.io/api/v1",
    "https://chatgpt-api.shn.hk/v1",
    "https://api.freegpt35.eu.org/v1",
    "https://openai.api2d.net/v1",
    "https://api.openai-proxy.com/v1",
    "https://free.churchless.tech/v1",
]

# Remote sources for pulling validated keys (tried in order)
REMOTE_POOL_URLS = [
    "https://raw.githubusercontent.com/Hostilian/eushop/main/data/validated_keys.json",
    "https://cdn.jsdelivr.net/gh/Hostilian/eushop@main/data/validated_keys.json",  # CDN mirror
    "https://raw.githubusercontent.com/alistaitsacle/free-llm-api-keys/main/README.md",  # source fallback
]

# Model priority scores
MODEL_PRIORITY = {
    "claude": 100, "gpt-4o": 95, "gpt-4": 90, "o1": 88, "o3": 88,
    "gemini-2": 87, "gemini-1.5-pro": 85, "deepseek-r1": 82, "grok": 80,
    "deepseek": 75, "kimi": 72, "moonshot": 70,
    "gpt-3.5": 60, "gemini": 60, "llama": 50, "mistral": 45, "qwen": 45,
    "poolside": 40, "cohere": 40, "default": 30,
}

REFRESH_INTERVAL_SECONDS = 3600  # 1 hour
MAX_POOL_AGE_BEFORE_HARVEST_SECONDS = 7200  # 2 hours — trigger full harvest
CIRCUIT_BREAKER_THRESHOLD = 3  # consecutive failures before marking endpoint down
VALIDATION_TIMEOUT = 5
MAX_VALIDATION_WORKERS = 40

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
LOGS_DIR.mkdir(parents=True, exist_ok=True)

_log_handlers = [logging.StreamHandler(sys.stdout)]
try:
    _log_handlers.append(logging.FileHandler(str(LOG_FILE), encoding="utf-8"))
except Exception:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    handlers=_log_handlers,
)
log = logging.getLogger("key_daemon")


# ─────────────────────────────────────────────────────────────────────────────
# Layer 6: Circuit Breaker for endpoints
# ─────────────────────────────────────────────────────────────────────────────

def load_circuit_breaker() -> dict:
    """Load endpoint health tracking data."""
    if CIRCUIT_BREAKER_FILE.exists():
        try:
            return json.loads(CIRCUIT_BREAKER_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"endpoints": {}}


def save_circuit_breaker(data: dict):
    try:
        CIRCUIT_BREAKER_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        pass


def record_endpoint_success(base_url: str):
    """Reset failure count for a successful endpoint."""
    cb = load_circuit_breaker()
    cb["endpoints"][base_url] = {"failures": 0, "open_until": None}
    save_circuit_breaker(cb)


def record_endpoint_failure(base_url: str):
    """Increment failure count; open circuit if threshold reached."""
    cb = load_circuit_breaker()
    ep = cb["endpoints"].get(base_url, {"failures": 0, "open_until": None})
    ep["failures"] = ep.get("failures", 0) + 1
    if ep["failures"] >= CIRCUIT_BREAKER_THRESHOLD:
        # Open circuit for 30 minutes
        open_until = (datetime.datetime.utcnow() + datetime.timedelta(minutes=30)).isoformat() + "Z"
        ep["open_until"] = open_until
        log.warning(f"Circuit OPEN for {base_url} until {open_until} ({ep['failures']} failures)")
    cb["endpoints"][base_url] = ep
    save_circuit_breaker(cb)


def is_endpoint_open(base_url: str) -> bool:
    """Returns True if the circuit is open (endpoint is down)."""
    cb = load_circuit_breaker()
    ep = cb["endpoints"].get(base_url, {})
    open_until_str = ep.get("open_until")
    if not open_until_str:
        return False
    try:
        open_until = datetime.datetime.fromisoformat(open_until_str.rstrip("Z"))
        if datetime.datetime.utcnow() < open_until:
            return True
        # Circuit expired — reset
        ep["open_until"] = None
        ep["failures"] = 0
        cb["endpoints"][base_url] = ep
        save_circuit_breaker(cb)
        return False
    except Exception:
        return False


def get_healthy_urls(preferred_url: str = None) -> list:
    """Return proxy URLs sorted by health, filtering open circuits."""
    urls = list(PROXY_BASE_URLS)
    if preferred_url and preferred_url not in urls:
        urls.insert(0, preferred_url)
    elif preferred_url and preferred_url in urls:
        urls.remove(preferred_url)
        urls.insert(0, preferred_url)

    # Filter out open circuits
    healthy = [u for u in urls if not is_endpoint_open(u)]
    open_circuits = [u for u in urls if is_endpoint_open(u)]

    if open_circuits:
        log.debug(f"Skipping {len(open_circuits)} open-circuit endpoints")

    # Append open circuits at end as absolute last resort
    return healthy + open_circuits


# ─────────────────────────────────────────────────────────────────────────────
# Validation (Layers 6 + 7)
# ─────────────────────────────────────────────────────────────────────────────

def validate_key(item: dict, timeout: int = VALIDATION_TIMEOUT) -> dict:
    """
    Validate one key across multiple proxy endpoints.
    Layer 6: Tries healthy endpoints first (circuit breaker aware).
    Layer 7: Treats 429 (rate limited) as valid — key exists, just busy.
    """
    item = item.copy()
    item["valid"] = False
    item["validated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    item["working_base_url"] = item.get("working_base_url") or PROXY_BASE_URLS[0]

    key = item["key"]
    model = item.get("model", "gpt-3.5-turbo")
    preferred = item.get("working_base_url") or item.get("base_url")
    urls_to_try = get_healthy_urls(preferred)

    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": [{"role": "user", "content": "hi"}], "max_tokens": 1}

    for base_url in urls_to_try[:4]:  # Try up to 4 endpoints per key
        try:
            if HAS_REQUESTS:
                resp = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=timeout)
                status = resp.status_code
            else:
                # Fallback: urllib (no requests lib)
                import json as _json
                req_data = _json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    f"{base_url}/chat/completions",
                    data=req_data,
                    headers={**headers, "Content-Type": "application/json"},
                    method="POST",
                )
                try:
                    with urllib.request.urlopen(req, timeout=timeout) as r:
                        status = r.status
                except urllib.error.HTTPError as e:
                    status = e.code

            if status == 200:
                item["valid"] = True
                item["working_base_url"] = base_url
                item["rate_limited"] = False
                record_endpoint_success(base_url)
                return item

            elif status == 429:
                # Layer 7: Rate limited = key is real and active
                item["valid"] = True
                item["working_base_url"] = base_url
                item["rate_limited"] = True
                record_endpoint_success(base_url)
                log.debug(f"  [RATE_LIMITED-OK] {key[:10]}... on {base_url}")
                return item

            elif status in (401, 403):
                # Definitively invalid key — don't try other endpoints
                return item

            elif status in (500, 502, 503, 504):
                # Server error — mark endpoint failure, try next
                record_endpoint_failure(base_url)
                continue

        except Exception as e:
            record_endpoint_failure(base_url)
            log.debug(f"  [ERR] {key[:10]}... on {base_url}: {e}")
            continue

    return item


# ─────────────────────────────────────────────────────────────────────────────
# Layer 1: Hot cache
# ─────────────────────────────────────────────────────────────────────────────

def load_hot_cache() -> list[dict]:
    if HOT_CACHE_PATH.exists():
        try:
            data = json.loads(HOT_CACHE_PATH.read_text(encoding="utf-8"))
            return data.get("keys", [])
        except Exception:
            pass
    return []


def get_pool_age_minutes() -> float:
    """Return age of hot cache in minutes. Returns inf if no cache."""
    if not HOT_CACHE_PATH.exists():
        return float("inf")
    try:
        data = json.loads(HOT_CACHE_PATH.read_text(encoding="utf-8"))
        updated = datetime.datetime.fromisoformat(
            data.get("updated_at", "1970-01-01T00:00:00Z").rstrip("Z")
        )
        return (datetime.datetime.utcnow() - updated).total_seconds() / 60
    except Exception:
        return float("inf")


# ─────────────────────────────────────────────────────────────────────────────
# Layer 2: Local validated_keys.json
# ─────────────────────────────────────────────────────────────────────────────

def load_local_validated() -> list[dict]:
    if VALIDATED_KEYS_PATH.exists():
        try:
            data = json.loads(VALIDATED_KEYS_PATH.read_text(encoding="utf-8"))
            keys = data.get("keys", [])
            if keys:
                log.info(f"Layer 2: Loaded {len(keys)} keys from data/validated_keys.json")
                return keys
        except Exception as e:
            log.warning(f"Layer 2 failed: {e}")
    return []


# ─────────────────────────────────────────────────────────────────────────────
# Layer 3: Remote pool fetch (multiple CDN URLs)
# ─────────────────────────────────────────────────────────────────────────────

def fetch_url_raw(url: str, timeout: int = 8) -> str | None:
    """Fetch raw text content from a URL (urllib only, no requests dependency)."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EushopKeyDaemon/3.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log.debug(f"  fetch_url({url}) failed: {e}")
        return None


def load_remote_pool() -> list[dict]:
    """Layer 3: Try multiple remote URLs for validated_keys.json."""
    for url in REMOTE_POOL_URLS[:2]:  # Only try JSON pool URLs (not README)
        if not url.endswith(".json"):
            continue
        content = fetch_url_raw(url)
        if content:
            try:
                data = json.loads(content)
                keys = data.get("keys", [])
                if keys:
                    log.info(f"Layer 3: Loaded {len(keys)} keys from {url}")
                    # Cache locally for future use
                    try:
                        VALIDATED_KEYS_PATH.parent.mkdir(parents=True, exist_ok=True)
                        VALIDATED_KEYS_PATH.write_text(content, encoding="utf-8")
                    except Exception:
                        pass
                    return keys
            except Exception as e:
                log.warning(f"Layer 3 parse failed for {url}: {e}")

    log.warning("Layer 3: All remote pool URLs failed")
    return []


# ─────────────────────────────────────────────────────────────────────────────
# Layer 4: Full re-harvest
# ─────────────────────────────────────────────────────────────────────────────

def run_full_harvest() -> list[dict]:
    """Layer 4: Run harvest_keys.py to scrape all 15 source repos."""
    if not HARVEST_SCRIPT.exists():
        log.warning("Layer 4: harvest_keys.py not found, skipping")
        return []

    python_exe = _find_python()
    log.info("Layer 4: Running full harvest from 15 source repos...")
    try:
        result = subprocess.run(
            [python_exe, str(HARVEST_SCRIPT), "--output", str(VALIDATED_KEYS_PATH)],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=180,
            encoding="utf-8",
            errors="replace",
        )
        if VALIDATED_KEYS_PATH.exists():
            data = json.loads(VALIDATED_KEYS_PATH.read_text(encoding="utf-8"))
            keys = data.get("keys", [])
            log.info(f"Layer 4: Harvest complete — {len(keys)} valid keys")
            return keys
        else:
            log.warning(f"Layer 4: Harvest ran but produced no output file")
    except subprocess.TimeoutExpired:
        log.warning("Layer 4: Harvest timed out after 180s")
    except Exception as e:
        log.warning(f"Layer 4: Harvest failed: {e}")
    return []


# ─────────────────────────────────────────────────────────────────────────────
# Layer 5: Emergency key store (persisted known-good keys)
# ─────────────────────────────────────────────────────────────────────────────

def load_emergency_cache() -> list[dict]:
    """Layer 5: Load the emergency key store (never cleared, only appended)."""
    if EMERGENCY_CACHE.exists():
        try:
            data = json.loads(EMERGENCY_CACHE.read_text(encoding="utf-8"))
            keys = data.get("keys", [])
            if keys:
                log.warning(f"Layer 5 EMERGENCY: Loading {len(keys)} emergency keys")
                return keys
        except Exception:
            pass
    return []


def save_to_emergency_cache(valid_keys: list[dict]):
    """
    Save valid keys to emergency cache. This file is ADDITIVE — it keeps
    the best keys ever seen so we always have something to fall back to.
    Prunes keys older than 48 hours to avoid stale junk.
    """
    existing = []
    if EMERGENCY_CACHE.exists():
        try:
            existing = json.loads(EMERGENCY_CACHE.read_text(encoding="utf-8")).get("keys", [])
        except Exception:
            pass

    # Merge: prefer new over old for same key
    existing_map = {k["key"]: k for k in existing}
    for k in valid_keys:
        existing_map[k["key"]] = k

    # Prune entries older than 48 hours
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=48)
    pruned = []
    for k in existing_map.values():
        try:
            validated_at_str = k.get("validated_at", "1970-01-01T00:00:00Z").rstrip("Z")
            validated_at = datetime.datetime.fromisoformat(validated_at_str)
            if validated_at > cutoff:
                pruned.append(k)
        except Exception:
            pruned.append(k)  # Keep if unparseable

    data = {
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "note": "Emergency fallback store — auto-managed, do not edit",
        "keys": pruned[:50],  # Keep max 50 keys
    }
    try:
        EMERGENCY_CACHE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception as e:
        log.warning(f"Failed to write emergency cache: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Layer 8: Stale pool extension
# ─────────────────────────────────────────────────────────────────────────────

def extend_stale_pool(stale_keys: list[dict]) -> list[dict]:
    """
    Layer 8: When all refresh methods fail, try re-validating the stale pool.
    Even if keys are old, some may still work.
    """
    if not stale_keys:
        return []

    log.warning(f"Layer 8: Extending stale pool — re-validating {len(stale_keys)} old keys")
    workers = min(MAX_VALIDATION_WORKERS, len(stale_keys))
    validated = []

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(validate_key, k, 8): k for k in stale_keys}
        for future in as_completed(futures):
            result = future.result()
            validated.append(result)

    still_valid = [k for k in validated if k.get("valid")]
    log.warning(f"Layer 8: {len(still_valid)} / {len(validated)} stale keys still valid")
    return still_valid


# ─────────────────────────────────────────────────────────────────────────────
# Layer 9: Last resort synthetic key test
# ─────────────────────────────────────────────────────────────────────────────

def check_any_endpoint_alive() -> dict | None:
    """
    Layer 9: Test if any free endpoint is reachable at all (network check).
    Uses a known-free public endpoint that doesn't require a key.
    Returns a synthetic key entry if found, or None.
    """
    # Public endpoints that may work without auth or with a dummy key
    test_endpoints = [
        ("https://api.pawan.krd/v1", "pk-this-is-a-real-test-key-for-pawan"),
        ("https://chatgpt-api.shn.hk/v1", "sk-test"),
    ]
    for base_url, test_key in test_endpoints:
        try:
            req = urllib.request.Request(
                f"{base_url}/models",
                headers={"Authorization": f"Bearer {test_key}"},
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status in (200, 401, 403):  # Any real HTTP = endpoint is alive
                    log.warning(f"Layer 9: Endpoint reachable: {base_url} (status {resp.status})")
                    return None  # We know network works but have no valid key
        except urllib.error.HTTPError as e:
            if e.code in (200, 401, 403, 429):
                log.warning(f"Layer 9: Endpoint reachable: {base_url} (HTTP {e.code})")
                return None
        except Exception:
            continue
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Hot cache writer
# ─────────────────────────────────────────────────────────────────────────────

def model_score(model: str) -> int:
    m = (model or "").lower()
    for prefix, score in MODEL_PRIORITY.items():
        if prefix in m:
            return score
    return MODEL_PRIORITY["default"]


def write_hot_cache(valid_keys: list[dict], source_tag: str = "refresh"):
    """Write the hot cache sorted by model priority."""
    # Sort: non-rate-limited first, then by model score
    sorted_keys = sorted(
        valid_keys,
        key=lambda k: (not k.get("rate_limited", False), model_score(k.get("model", ""))),
        reverse=True,
    )
    data = {
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "schema_version": "3",
        "source": source_tag,
        "total_valid": len(sorted_keys),
        "total_rate_limited": sum(1 for k in sorted_keys if k.get("rate_limited")),
        "total_clean": sum(1 for k in sorted_keys if not k.get("rate_limited")),
        "keys": sorted_keys,
    }
    HOT_CACHE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")
    log.info(
        f"Hot cache written: {len(sorted_keys)} keys "
        f"({data['total_clean']} clean, {data['total_rate_limited']} rate-limited) "
        f"[source: {source_tag}]"
    )


# ─────────────────────────────────────────────────────────────────────────────
# .env.local patcher
# ─────────────────────────────────────────────────────────────────────────────

def patch_env_local(best_key: dict):
    """Patch .env.local with the best available key (prefer non-rate-limited)."""
    if not ENV_LOCAL_PATH.exists():
        log.warning(".env.local not found, skipping patch")
        return
    try:
        content = ENV_LOCAL_PATH.read_text(encoding="utf-8")
        lines = content.splitlines(keepends=True)

        new_entries = {
            "ACTIVE_API_KEY":      f"ACTIVE_API_KEY={best_key['key']}\n",
            "ACTIVE_API_MODEL":    f"ACTIVE_API_MODEL={best_key.get('model', 'gpt-3.5-turbo')}\n",
            "ACTIVE_API_BASE_URL": f"ACTIVE_API_BASE_URL={best_key.get('working_base_url', PROXY_BASE_URLS[0])}\n",
        }
        updated = {k: False for k in new_entries}
        new_lines = []

        for line in lines:
            matched = False
            for key_name, new_line in new_entries.items():
                if line.startswith(f"{key_name}="):
                    new_lines.append(new_line)
                    updated[key_name] = True
                    matched = True
                    break
            if not matched:
                new_lines.append(line)

        # Append any missing entries
        missing = [v for k, v in new_entries.items() if not updated[k]]
        if missing:
            new_lines.append("\n# Auto-managed by key_daemon.py\n")
            new_lines.extend(missing)

        ENV_LOCAL_PATH.write_text("".join(new_lines), encoding="utf-8")
        log.info(
            f"Patched .env.local: key={best_key['key'][:12]}... "
            f"model={best_key.get('model')} "
            f"url={best_key.get('working_base_url')} "
            f"rate_limited={best_key.get('rate_limited', False)}"
        )
    except Exception as e:
        log.error(f"Failed to patch .env.local: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Git pull
# ─────────────────────────────────────────────────────────────────────────────

def git_pull():
    """Attempt git pull with timeout and error handling."""
    try:
        result = subprocess.run(
            ["git", "pull", "--ff-only"],
            cwd=str(PROJECT_ROOT),
            capture_output=True, text=True, timeout=30,
            encoding="utf-8", errors="replace",
        )
        if result.returncode == 0:
            log.info(f"git pull: {result.stdout.strip() or 'OK'}")
        else:
            log.warning(f"git pull failed: {result.stderr.strip()}")
    except subprocess.TimeoutExpired:
        log.warning("git pull timed out (30s)")
    except FileNotFoundError:
        log.warning("git not found — skipping pull")
    except Exception as e:
        log.warning(f"git pull error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Python finder
# ─────────────────────────────────────────────────────────────────────────────

def _find_python() -> str:
    """Find best available Python executable."""
    venv_python = PROJECT_ROOT / ".venv" / "Scripts" / "python.exe"
    if venv_python.exists():
        return str(venv_python)
    for candidate in [sys.executable, "python", "python3"]:
        try:
            result = subprocess.run([candidate, "--version"], capture_output=True, timeout=3)
            if result.returncode == 0:
                return candidate
        except Exception:
            continue
    return sys.executable


# ─────────────────────────────────────────────────────────────────────────────
# Validation runner
# ─────────────────────────────────────────────────────────────────────────────

def validate_keys_parallel(keys: list[dict], label: str = "") -> list[dict]:
    """Validate a list of keys in parallel. Returns only valid ones."""
    if not keys:
        return []
    workers = min(MAX_VALIDATION_WORKERS, len(keys))
    validated = []

    log.info(f"Validating {len(keys)} keys ({workers} workers) [{label}]...")
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(validate_key, k): k for k in keys}
        for future in as_completed(futures):
            try:
                validated.append(future.result())
            except Exception as e:
                log.debug(f"Validation future error: {e}")

    valid = [k for k in validated if k.get("valid")]
    log.info(f"Validation [{label}]: {len(valid)} valid / {len(validated)} checked")
    return valid


# ─────────────────────────────────────────────────────────────────────────────
# Deduplication
# ─────────────────────────────────────────────────────────────────────────────

def deduplicate(keys: list[dict]) -> list[dict]:
    seen = {}
    for k in keys:
        key_val = k["key"]
        if key_val not in seen:
            seen[key_val] = k
        else:
            # Keep higher priority source
            if k.get("source_priority", 0) > seen[key_val].get("source_priority", 0):
                seen[key_val] = k
    return list(seen.values())


# ─────────────────────────────────────────────────────────────────────────────
# Known-invalid feedback
# ─────────────────────────────────────────────────────────────────────────────

def get_known_invalid_keys() -> set:
    """Load set of keys marked invalid by chat_agent.py failure reports."""
    cache = load_hot_cache()
    return {k["key"] for k in cache if not k.get("valid", True) and k.get("failed_at")}


# ─────────────────────────────────────────────────────────────────────────────
# 9-LAYER REFRESH CYCLE
# ─────────────────────────────────────────────────────────────────────────────

def refresh_cycle(force_harvest: bool = False) -> int:
    """
    Execute one full refresh using all 9 layers of resilience.
    Returns count of valid keys in pool.
    """
    log.info("-" * 70)
    log.info("REFRESH CYCLE START")

    known_invalid = get_known_invalid_keys()
    if known_invalid:
        log.info(f"Skipping {len(known_invalid)} known-invalid keys (feedback loop)")

    # ── Step 1: Git pull to get latest committed keys ────────────────────────
    git_pull()

    # ── Determine if we need a full harvest ──────────────────────────────────
    pool_age = get_pool_age_minutes()
    stale = pool_age > (MAX_POOL_AGE_BEFORE_HARVEST_SECONDS / 60)
    if force_harvest or stale:
        log.info(f"Pool age: {pool_age:.0f} min — {'forced harvest' if force_harvest else 'stale, triggering harvest'}")

    # ── Layer 4 (early): Full harvest if forced or very stale ────────────────
    if force_harvest:
        fresh_from_harvest = run_full_harvest()
    else:
        fresh_from_harvest = []

    # ── Layer 2: Load local validated_keys.json ──────────────────────────────
    local_keys = load_local_validated()

    # ── Layer 3: Remote pool (if local is empty) ─────────────────────────────
    remote_keys = []
    if not local_keys:
        remote_keys = load_remote_pool()

    # ── Merge all raw sources ─────────────────────────────────────────────────
    all_raw = fresh_from_harvest + local_keys + remote_keys
    all_raw = [k for k in all_raw if k.get("key") and k["key"] not in known_invalid]
    all_raw = deduplicate(all_raw)

    valid_keys = []

    if all_raw:
        # ── Validate merged keys ─────────────────────────────────────────────
        valid_keys = validate_keys_parallel(all_raw, label="main")

    # ── Layer 4 (late): Harvest if still empty ───────────────────────────────
    if not valid_keys and not force_harvest:
        log.warning("No valid keys after main validation — running late harvest (Layer 4)")
        harvest_keys = run_full_harvest()
        if harvest_keys:
            valid_keys = validate_keys_parallel(harvest_keys, label="late-harvest")

    # ── Layer 5: Emergency cache ──────────────────────────────────────────────
    if not valid_keys:
        log.warning("Layers 1-4 empty — trying emergency cache (Layer 5)")
        emergency_keys = load_emergency_cache()
        if emergency_keys:
            valid_keys = validate_keys_parallel(emergency_keys, label="emergency")

    # ── Layer 8: Re-validate stale hot cache ──────────────────────────────────
    if not valid_keys:
        stale_pool = load_hot_cache()
        if stale_pool:
            valid_keys = extend_stale_pool(stale_pool)

    # ── Layer 9: Network diagnostics if completely empty ─────────────────────
    if not valid_keys:
        log.error("ALL LAYERS FAILED — zero valid keys found")
        check_any_endpoint_alive()
        # Keep existing hot cache to prevent total blackout
        existing = load_hot_cache()
        if existing:
            log.warning("Keeping existing hot cache to prevent blackout (Layer 8 extension)")
            return len(existing)
        return 0

    # ── Save emergency backup before writing hot cache ────────────────────────
    save_to_emergency_cache(valid_keys)  # Layer 5: persist for emergencies

    # ── Write hot cache (Layer 1 for next call) ───────────────────────────────
    source_tag = "harvest" if force_harvest else ("remote" if remote_keys and not local_keys else "local")
    write_hot_cache(valid_keys, source_tag=source_tag)

    # ── Patch .env.local with best available key ──────────────────────────────
    if valid_keys:
        # Prefer: non-rate-limited first, highest model score
        best = valid_keys[0]  # Already sorted by write_hot_cache
        patch_env_local(best)
        log.info(f"Best key: {best['key'][:12]}... model={best.get('model')} rate_limited={best.get('rate_limited', False)}")

    log.info(f"REFRESH CYCLE DONE: {len(valid_keys)} valid keys in pool")
    log.info("-" * 70)
    return len(valid_keys)


# ─────────────────────────────────────────────────────────────────────────────
# Status display
# ─────────────────────────────────────────────────────────────────────────────

def show_status():
    """Print detailed pool status."""
    print()
    print("=" * 60)
    print("  EUshop API Key Pool — Status v3")
    print("=" * 60)

    age = get_pool_age_minutes()
    age_str = f"{age:.0f} min" if age < float("inf") else "NEVER"
    print(f"  Pool age     : {age_str}")

    # Hot cache
    if HOT_CACHE_PATH.exists():
        try:
            data = json.loads(HOT_CACHE_PATH.read_text(encoding="utf-8"))
            print(f"  Updated at   : {data.get('updated_at', '?')}")
            print(f"  Source       : {data.get('source', '?')}")
            print(f"  Valid keys   : {data.get('total_valid', 0)}")
            print(f"    - Clean    : {data.get('total_clean', '?')}")
            print(f"    - Rate-lim : {data.get('total_rate_limited', '?')}")
            print("-" * 60)
            keys = data.get("keys", [])
            for i, k in enumerate(keys[:15], 1):
                model = (k.get("model") or "?")[:30]
                base = (k.get("working_base_url") or "?")[:35]
                rl = "[RL]" if k.get("rate_limited") else "    "
                print(f"  {i:2}. {k['key'][:12]}... | {model:<30} | {rl} {base}")
            if len(keys) > 15:
                print(f"  ... and {len(keys) - 15} more")
        except Exception as e:
            print(f"  [ERROR reading cache] {e}")
    else:
        print("  [!] No hot cache found — run: python scripts\\key_daemon.py --once")

    # Emergency cache
    if EMERGENCY_CACHE.exists():
        try:
            data = json.loads(EMERGENCY_CACHE.read_text(encoding="utf-8"))
            print(f"\n  Emergency store: {len(data.get('keys', []))} keys (updated {data.get('updated_at', '?')})")
        except Exception:
            pass

    # Circuit breaker status
    cb = load_circuit_breaker()
    open_circuits = [url for url, ep in cb.get("endpoints", {}).items() if ep.get("open_until")]
    if open_circuits:
        print(f"\n  [!] Open circuits ({len(open_circuits)} endpoints down):")
        for url in open_circuits:
            print(f"      - {url}")
    else:
        print(f"\n  Circuits: all healthy")

    print("=" * 60)
    print()


# ─────────────────────────────────────────────────────────────────────────────
# Doctor: full diagnostics
# ─────────────────────────────────────────────────────────────────────────────

def run_doctor():
    """Run full diagnostics on all layers."""
    print("\n" + "=" * 60)
    print("  EUshop Key Daemon — DOCTOR MODE")
    print("=" * 60)

    checks = [
        ("Python version", lambda: f"{sys.version.split()[0]} on {sys.platform}"),
        ("Project root", lambda: str(PROJECT_ROOT)),
        ("Hot cache", lambda: f"EXISTS ({get_pool_age_minutes():.0f} min old)" if HOT_CACHE_PATH.exists() else "MISSING"),
        ("validated_keys.json", lambda: "EXISTS" if VALIDATED_KEYS_PATH.exists() else "MISSING"),
        ("Emergency cache", lambda: "EXISTS" if EMERGENCY_CACHE.exists() else "MISSING"),
        (".env.local", lambda: "EXISTS" if ENV_LOCAL_PATH.exists() else "MISSING"),
        ("harvest_keys.py", lambda: "EXISTS" if HARVEST_SCRIPT.exists() else "MISSING"),
        ("git", lambda: subprocess.run(["git", "--version"], capture_output=True, text=True).stdout.strip()),
        ("requests lib", lambda: "INSTALLED" if HAS_REQUESTS else "MISSING (using urllib fallback)"),
    ]

    for name, check_fn in checks:
        try:
            result = check_fn()
            status = "[OK]" if "MISSING" not in str(result) else "[!!]"
            print(f"  {status} {name:<25}: {result}")
        except Exception as e:
            print(f"  [ERR] {name:<25}: {e}")

    # Endpoint reachability
    print("\n  Endpoint health check:")
    for url in PROXY_BASE_URLS[:4]:
        open_c = is_endpoint_open(url)
        status = "[OPEN CIRCUIT]" if open_c else "[OK]"
        try:
            req = urllib.request.Request(
                f"{url}/models",
                headers={"Authorization": "Bearer test"},
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                http_status = resp.status
        except urllib.error.HTTPError as e:
            http_status = e.code
        except Exception as e:
            http_status = f"ERR ({e})"
        print(f"  {status} {url}: HTTP {http_status}")

    print("=" * 60 + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# Daemon loop
# ─────────────────────────────────────────────────────────────────────────────

def run_daemon():
    """Main daemon loop — runs indefinitely with full resilience."""
    log.info("=" * 70)
    log.info("EUshop Key Daemon v3.0 — 9-Layer Resilience Mode")
    log.info(f"Project: {PROJECT_ROOT}")
    log.info(f"Refresh: every {REFRESH_INTERVAL_SECONDS // 60} minutes")
    log.info(f"Harvest: every 6 cycles (every 6 hours)")
    log.info(f"Pool max age before forced harvest: {MAX_POOL_AGE_BEFORE_HARVEST_SECONDS // 60} min")
    log.info("=" * 70)

    cycle_count = 0
    consecutive_failures = 0
    BACKOFF_INTERVALS = [300, 600, 900, 1800]  # 5, 10, 15, 30 min on failure

    while True:
        cycle_count += 1
        log.info(f"\n[Cycle #{cycle_count}] (consecutive_failures={consecutive_failures})")

        try:
            # Full harvest every 6th cycle (every 6 hours)
            force_harvest = (cycle_count % 6 == 1)
            count = refresh_cycle(force_harvest=force_harvest)

            if count > 0:
                consecutive_failures = 0
                sleep_time = REFRESH_INTERVAL_SECONDS
            else:
                consecutive_failures += 1
                # Exponential-ish backoff on repeated failures
                idx = min(consecutive_failures - 1, len(BACKOFF_INTERVALS) - 1)
                sleep_time = BACKOFF_INTERVALS[idx]
                log.warning(f"No valid keys (failure #{consecutive_failures}) — retrying in {sleep_time}s")

        except KeyboardInterrupt:
            log.info("Daemon stopped by user (KeyboardInterrupt)")
            break
        except Exception as e:
            consecutive_failures += 1
            idx = min(consecutive_failures - 1, len(BACKOFF_INTERVALS) - 1)
            sleep_time = BACKOFF_INTERVALS[idx]
            log.error(f"Cycle #{cycle_count} crashed: {e}", exc_info=True)
            log.warning(f"Retrying in {sleep_time}s (backoff, failure #{consecutive_failures})")

        next_run = datetime.datetime.now() + datetime.timedelta(seconds=sleep_time)
        log.info(f"Next refresh: {next_run.strftime('%Y-%m-%dT%H:%M:%S')} (in {sleep_time}s)")
        time.sleep(sleep_time)


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EUshop Key Daemon v3 — 9-Layer Resilience")
    parser.add_argument("--once",   action="store_true", help="Run one refresh cycle then exit")
    parser.add_argument("--status", action="store_true", help="Print pool status and exit")
    parser.add_argument("--heal",   action="store_true", help="Force full re-harvest + validate, then exit")
    parser.add_argument("--doctor", action="store_true", help="Run full diagnostics and exit")
    args = parser.parse_args()

    if args.status:
        show_status()
        return

    if args.doctor:
        run_doctor()
        return

    if args.heal:
        log.info("HEAL MODE: Force full harvest + validate")
        count = refresh_cycle(force_harvest=True)
        sys.exit(0 if count > 0 else 1)

    if args.once:
        count = refresh_cycle(force_harvest=False)
        sys.exit(0 if count > 0 else 1)

    run_daemon()


if __name__ == "__main__":
    main()
