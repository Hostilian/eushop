#!/usr/bin/env python3
"""
harvest_keys.py — Multi-source GitHub LLM API key harvester + validator.

Scrapes 15 GitHub repositories for free LLM API keys, validates them in
parallel, deduplicates, scores by freshness/model priority, and writes
data/validated_keys.json for use by key_daemon.py and chat_agent.py.

Usage:
  python scripts/harvest_keys.py [--output data/validated_keys.json]
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
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

# Suppress DeprecationWarnings (datetime.utcnow) on Python 3.12+
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Reconfigure stdout/stderr to UTF-8 on Windows
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
# Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("harvest_keys")

# ─────────────────────────────────────────────
# Source repositories & their raw content URLs
# ─────────────────────────────────────────────
SOURCE_REPOS = [
    {
        "name": "alistaitsacle/free-llm-api-keys",
        "priority": 5,
        "urls": [
            "https://raw.githubusercontent.com/alistaitsacle/free-llm-api-keys/main/README.md",
        ],
        "format": "table",
    },
    {
        "name": "chatanywhere/GPT_API_free",
        "priority": 5,
        "urls": [
            "https://raw.githubusercontent.com/chatanywhere/GPT_API_free/main/README.md",
            "https://raw.githubusercontent.com/chatanywhere/GPT_API_free/main/README_en.md",
        ],
        "format": "regex",
    },
    {
        "name": "popjane/free_chatgpt_api",
        "priority": 4,
        "urls": [
            "https://raw.githubusercontent.com/popjane/free_chatgpt_api/main/readme.md",
            "https://raw.githubusercontent.com/popjane/free_chatgpt_api/main/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "cheahjs/free-llm-api-resources",
        "priority": 4,
        "urls": [
            "https://raw.githubusercontent.com/cheahjs/free-llm-api-resources/main/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "PawanOsman/ChatGPT",
        "priority": 4,
        "urls": [
            "https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/README.md",
        ],
        "format": "regex",
        "base_url": "https://api.pawan.krd/v1",
    },
    {
        "name": "x-dr/chatgptProxyAPI",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/x-dr/chatgptProxyAPI/main/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "ayaka14732/ChatGPTAPIFree",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/ayaka14732/ChatGPTAPIFree/main/README.md",
        ],
        "format": "regex",
        "base_url": "https://chatgpt-api.shn.hk/v1",
    },
    {
        "name": "aurora-develop/aurora",
        "priority": 4,
        "urls": [
            "https://raw.githubusercontent.com/aurora-develop/aurora/main/README.md",
            "https://raw.githubusercontent.com/aurora-develop/aurora/master/README.md",
        ],
        "format": "regex",
        "base_url": "https://aurora.chatie.io/api/v1",
    },
    {
        "name": "dan1471/FREE-openai-api-keys",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/dan1471/FREE-openai-api-keys/main/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "missuo/FreeGPT35",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/missuo/FreeGPT35/main/README.md",
        ],
        "format": "regex",
        "base_url": "https://api.freegpt35.eu.org/v1",
    },
    {
        "name": "mnfst/awesome-free-llm-apis",
        "priority": 4,
        "urls": [
            "https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/main/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "fangzesheng/free-api",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/fangzesheng/free-api/main/README.md",
            "https://raw.githubusercontent.com/fangzesheng/free-api/master/README.md",
        ],
        "format": "regex",
    },
    {
        "name": "justlovemaki/AIClient2API",
        "priority": 3,
        "urls": [
            "https://raw.githubusercontent.com/justlovemaki/AIClient2API/main/README.md",
        ],
        "format": "regex",
    },
]

# ─────────────────────────────────────────────
# Known free proxy base URLs (waterfall fallback)
# ─────────────────────────────────────────────
PROXY_BASE_URLS = [
    "https://aiapiv2.pekpik.com/v1",
    "https://api.pawan.krd/v1",
    "https://aurora.chatie.io/api/v1",
    "https://chatgpt-api.shn.hk/v1",
    "https://api.freegpt35.eu.org/v1",
    "https://openai.api2d.net/v1",
]

# ─────────────────────────────────────────────
# Model priority scores (higher = more valuable)
# ─────────────────────────────────────────────
MODEL_PRIORITY = {
    "claude": 100,
    "gpt-4o": 95,
    "gpt-4": 90,
    "o1": 88,
    "o3": 88,
    "gemini-1.5-pro": 85,
    "gemini-2": 85,
    "deepseek-r1": 82,
    "grok": 80,
    "deepseek": 75,
    "gpt-3.5": 60,
    "gemini": 60,
    "llama": 50,
    "mistral": 45,
    "qwen": 45,
    "default": 30,
}

# Regex patterns to extract API keys from text
KEY_PATTERNS = [
    # OpenAI-style sk- keys
    re.compile(r'\b(sk-[a-zA-Z0-9\-_]{20,})\b'),
    # OpenRouter-style keys
    re.compile(r'\b(sk-or-v1-[a-zA-Z0-9\-_]{20,})\b'),
    # Anthropic-style claude keys
    re.compile(r'\b(sk-ant-[a-zA-Z0-9\-_]{20,})\b'),
    # Generic Bearer tokens that look like API keys
    re.compile(r'Bearer\s+(sk-[a-zA-Z0-9\-_]{20,})'),
    # Key: or api_key: patterns
    re.compile(r'[Kk]ey[:\s"\']+([a-zA-Z0-9\-_]{30,})'),
]

# Table column header patterns for alistaitsacle-style repos
TABLE_KEY_COL_PATTERNS = [
    re.compile(r'\|\s*`?(sk-[a-zA-Z0-9\-_]{20,})`?\s*\|'),
]

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/plain,text/html,*/*",
}


# ─────────────────────────────────────────────
# Fetching
# ─────────────────────────────────────────────

def fetch_url(url: str, timeout: int = 8) -> str | None:
    """Fetch raw content from a URL. Returns text or None."""
    try:
        req = urllib.request.Request(url, headers=REQUEST_HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log.debug(f"  fetch_url({url}) failed: {e}")
        return None


def fetch_repo_content(repo: dict) -> str | None:
    """Try each URL for a repo, return first successful content."""
    for url in repo["urls"]:
        content = fetch_url(url)
        if content:
            log.info(f"  [OK] Fetched {repo['name']} from {url}")
            return content
        log.debug(f"  [MISS] {url}")
    log.warning(f"  [FAIL] Could not fetch any URL for {repo['name']}")
    return None


# ─────────────────────────────────────────────
# Parsing
# ─────────────────────────────────────────────

def parse_table_format(content: str, repo: dict) -> list[dict]:
    """Parse alistaitsacle-style markdown tables with columns: key | model | status | budget | rate_limit | expires | desc."""
    keys = []
    current_group = "Unknown"
    base_url = repo.get("base_url", PROXY_BASE_URLS[0])

    for line in content.splitlines():
        line_stripped = line.strip()

        # Track section headers
        if line_stripped.startswith("### "):
            current_group = line_stripped[4:].split("`")[0].strip()
            continue

        # Only process table rows with pipe characters
        if not line_stripped.startswith("|") or "sk-" not in line_stripped:
            continue

        parts = [p.strip() for p in line_stripped.split("|")]
        # Remove empty first/last from leading/trailing pipes
        parts = [p for p in parts if p]
        if len(parts) < 2:
            continue

        # Extract key from first column
        key_raw = parts[0].replace("`", "").strip()
        for pat in KEY_PATTERNS:
            m = pat.search(key_raw)
            if m:
                key_raw = m.group(1)
                break

        if not key_raw.startswith("sk-") or len(key_raw) < 20:
            continue

        model = parts[1].replace("`", "").strip() if len(parts) > 1 else "unknown"
        budget = parts[3].replace("`", "").strip() if len(parts) > 3 else ""
        expires = parts[5].replace("`", "").strip() if len(parts) > 5 else ""
        desc = parts[6].replace("`", "").strip() if len(parts) > 6 else ""

        keys.append({
            "key": key_raw,
            "model": model,
            "group": current_group,
            "base_url": base_url,
            "budget": budget,
            "expires": expires,
            "desc": desc,
            "source_repo": repo["name"],
            "source_priority": repo["priority"],
        })

    return keys


def parse_regex_format(content: str, repo: dict) -> list[dict]:
    """Extract keys from arbitrary text using regex patterns."""
    keys = []
    base_url = repo.get("base_url", PROXY_BASE_URLS[0])
    seen = set()

    for pat in KEY_PATTERNS:
        for m in pat.finditer(content):
            key = m.group(1).strip()
            if len(key) < 20 or key in seen:
                continue
            seen.add(key)

            # Try to find a model name near this key
            start = max(0, m.start() - 200)
            end = min(len(content), m.end() + 200)
            surrounding = content[start:end]
            model = detect_model_from_context(surrounding)

            keys.append({
                "key": key,
                "model": model,
                "group": repo["name"],
                "base_url": base_url,
                "budget": "",
                "expires": "",
                "desc": "",
                "source_repo": repo["name"],
                "source_priority": repo["priority"],
            })

    return keys


def detect_model_from_context(text: str) -> str:
    """Detect the model name from surrounding text."""
    text_lower = text.lower()
    model_hints = [
        ("claude-3-5-sonnet", "claude-3-5-sonnet-20241022"),
        ("claude-3-opus", "claude-3-opus-20240229"),
        ("claude-3-sonnet", "claude-3-sonnet-20240229"),
        ("claude-3-haiku", "claude-3-haiku-20240307"),
        ("claude", "claude-3-haiku-20240307"),
        ("gpt-4o-mini", "gpt-4o-mini"),
        ("gpt-4o", "gpt-4o"),
        ("gpt-4-turbo", "gpt-4-turbo"),
        ("gpt-4", "gpt-4"),
        ("o3-mini", "o3-mini"),
        ("o1-mini", "o1-mini"),
        ("o1", "o1"),
        ("deepseek-r1", "deepseek-r1"),
        ("deepseek-chat", "deepseek-chat"),
        ("deepseek", "deepseek-chat"),
        ("gemini-2.0-flash", "gemini-2.0-flash"),
        ("gemini-1.5-pro", "gemini-1.5-pro"),
        ("gemini-pro", "gemini-pro"),
        ("gemini", "gemini-pro"),
        ("grok-2", "grok-2"),
        ("grok", "grok-2"),
        ("llama-3.1-70b", "llama-3.1-70b"),
        ("llama-3.1-8b", "llama-3.1-8b"),
        ("llama", "llama-3.1-8b"),
        ("mistral-large", "mistral-large"),
        ("mistral", "mistral-7b"),
        ("qwen", "qwen-turbo"),
        ("gpt-3.5-turbo", "gpt-3.5-turbo"),
        ("gpt-3.5", "gpt-3.5-turbo"),
    ]
    for hint, model_id in model_hints:
        if hint in text_lower:
            return model_id
    return "gpt-3.5-turbo"  # Safe fallback


def model_priority_score(model: str) -> int:
    """Return priority score for a model name."""
    model_lower = model.lower()
    for prefix, score in MODEL_PRIORITY.items():
        if prefix in model_lower:
            return score
    return MODEL_PRIORITY["default"]


# ─────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────

def validate_key(item: dict, timeout: int = 5) -> dict:
    """
    Attempt a minimal chat completion call to verify key validity.
    Tries multiple base URLs if the primary fails.
    Returns item with 'valid', 'validated_at', 'working_base_url' fields.
    """
    item = item.copy()
    item["valid"] = False
    item["validated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    item["working_base_url"] = None

    key = item["key"]
    model = item.get("model", "gpt-3.5-turbo")

    # Build list of base URLs to try (item's own first, then global waterfall)
    base_urls_to_try = [item.get("base_url", PROXY_BASE_URLS[0])] + [
        u for u in PROXY_BASE_URLS if u != item.get("base_url")
    ]

    # Strip duplicates while preserving order
    seen_urls = set()
    unique_urls = []
    for u in base_urls_to_try:
        if u and u not in seen_urls:
            seen_urls.add(u)
            unique_urls.append(u)

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 1,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    for base_url in unique_urls[:3]:  # Max 3 URLs per key to keep it fast
        url = f"{base_url}/chat/completions"
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                item["valid"] = True
                item["working_base_url"] = base_url
                log.debug(f"  [VALID] {key[:8]}... on {base_url}")
                return item
            elif resp.status_code in (401, 403):
                # Definitely invalid key — don't try other URLs
                log.debug(f"  [INVALID] {key[:8]}... → {resp.status_code}")
                return item
            elif resp.status_code == 429:
                # Rate limited but key exists — mark as valid with caveat
                item["valid"] = True
                item["working_base_url"] = base_url
                item["rate_limited"] = True
                log.debug(f"  [RATE_LIMITED] {key[:8]}... on {base_url}")
                return item
        except Exception as e:
            log.debug(f"  [TIMEOUT/ERR] {key[:8]}... on {base_url}: {e}")
            continue

    return item


# ─────────────────────────────────────────────
# Deduplication
# ─────────────────────────────────────────────

def deduplicate(keys: list[dict]) -> list[dict]:
    """Remove duplicate keys, keeping the highest-priority source."""
    seen: dict[str, dict] = {}
    for item in keys:
        k = item["key"]
        if k not in seen:
            seen[k] = item
        else:
            # Keep the one with higher source_priority
            if item.get("source_priority", 0) > seen[k].get("source_priority", 0):
                seen[k] = item
    return list(seen.values())


# ─────────────────────────────────────────────
# Main harvest pipeline
# ─────────────────────────────────────────────

def harvest(output_path: str, max_validation_workers: int = 40) -> dict:
    """Full harvest pipeline: fetch → parse → deduplicate → validate → write."""
    start = time.time()
    all_raw_keys: list[dict] = []

    # 1. Fetch and parse all repos in parallel
    log.info("=" * 60)
    log.info("Phase 1: Fetching source repositories")
    log.info("=" * 60)

    with ThreadPoolExecutor(max_workers=len(SOURCE_REPOS)) as executor:
        future_to_repo = {
            executor.submit(fetch_repo_content, repo): repo
            for repo in SOURCE_REPOS
        }
        for future in as_completed(future_to_repo):
            repo = future_to_repo[future]
            content = future.result()
            if not content:
                continue

            fmt = repo.get("format", "regex")
            if fmt == "table":
                parsed = parse_table_format(content, repo)
            else:
                parsed = parse_regex_format(content, repo)

            log.info(f"  [{repo['name']}] → {len(parsed)} raw keys found")
            all_raw_keys.extend(parsed)

    log.info(f"\nTotal raw keys collected: {len(all_raw_keys)}")

    # 2. Deduplicate
    log.info("\nPhase 2: Deduplicating keys")
    unique_keys = deduplicate(all_raw_keys)
    log.info(f"Unique keys after dedup: {len(unique_keys)}")

    # 3. Validate in parallel
    log.info(f"\nPhase 3: Validating {len(unique_keys)} keys in parallel ({max_validation_workers} workers)")
    log.info("(This may take 15-30 seconds...)")

    validated: list[dict] = []
    workers = min(max_validation_workers, len(unique_keys)) if unique_keys else 1

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(validate_key, item): item for item in unique_keys}
        done = 0
        for future in as_completed(futures):
            done += 1
            result = future.result()
            validated.append(result)
            status = "✓" if result["valid"] else "✗"
            if done % 10 == 0 or result["valid"]:
                log.info(f"  [{done}/{len(unique_keys)}] {status} {result['key'][:12]}... ({result.get('model', '?')})")

    valid_keys = [k for k in validated if k["valid"]]
    log.info(f"\nValid keys: {len(valid_keys)} / {len(validated)}")

    # 4. Sort by priority: model score DESC, then source_priority DESC
    valid_keys.sort(
        key=lambda x: (model_priority_score(x.get("model", "")), x.get("source_priority", 0)),
        reverse=True,
    )

    # 5. Write output
    output = {
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "schema_version": "2",
        "total_valid": len(valid_keys),
        "total_checked": len(validated),
        "elapsed_seconds": round(time.time() - start, 1),
        "keys": valid_keys,
    }

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    log.info(f"\n[OK] Written {len(valid_keys)} valid keys → {output_path}")
    log.info(f"Total elapsed: {output['elapsed_seconds']}s")
    log.info("=" * 60)

    return output


# ─────────────────────────────────────────────
# CLI entry point
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Harvest and validate free LLM API keys from GitHub")
    parser.add_argument(
        "--output",
        default=os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data", "validated_keys.json"
        ),
        help="Output JSON file path (default: data/validated_keys.json)"
    )
    parser.add_argument("--workers", type=int, default=40, help="Max parallel validation workers")
    parser.add_argument("--verbose", action="store_true", help="Enable debug logging")
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    result = harvest(args.output, args.workers)
    print(f"\n[DONE] {result['total_valid']} valid keys -> {args.output}")
    sys.exit(0 if result["total_valid"] > 0 else 1)


if __name__ == "__main__":
    main()
