#!/usr/bin/env python3
import os
import re
import sys
import argparse
import subprocess
import urllib.request
import json
import requests
import http.server
import socketserver
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# Reconfigure stdout/stderr to UTF-8 on Windows to prevent UnicodeEncodeError
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown
from rich.prompt import Prompt, Confirm

console = Console()

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Primary default (first in waterfall)
DEFAULT_API_BASE = os.environ.get("ACTIVE_API_BASE_URL", "https://aiapiv2.pekpik.com/v1")

# Multi-base-URL waterfall — tried in order on failure
PROXY_BASE_URLS = [
    "https://aiapiv2.pekpik.com/v1",
    "https://api.pawan.krd/v1",
    "https://aurora.chatie.io/api/v1",
    "https://chatgpt-api.shn.hk/v1",
    "https://api.freegpt35.eu.org/v1",
    "https://openai.api2d.net/v1",
]

GITHUB_README_URL = "https://raw.githubusercontent.com/alistaitsacle/free-llm-api-keys/main/README.md"
REMOTE_VALIDATED_KEYS_URL = "https://raw.githubusercontent.com/Hostilian/eushop/main/data/validated_keys.json"

HOT_CACHE_PATH = os.path.join(PROJECT_ROOT, ".api_keys_pool.json")
VALIDATED_KEYS_PATH = os.path.join(PROJECT_ROOT, "data", "validated_keys.json")
HISTORY_FILE = os.path.join(PROJECT_ROOT, ".chat_agent_history")

# ─────────────────────────────────────────────
# Key Pool Loader — NEW multi-source cascade
# ─────────────────────────────────────────────

def load_key_pool() -> list[dict]:
    """
    Load validated keys from sources in priority order:
    1. .api_keys_pool.json (local hot cache, freshest)
    2. data/validated_keys.json (committed, refreshed by GitHub Actions)
    3. Remote validated_keys.json from Hostilian/eushop repo
    4. Existing README scrape (original fallback)
    Returns list of key dicts compatible with the original format.
    """
    # Source 1: hot cache
    if os.path.exists(HOT_CACHE_PATH):
        try:
            with open(HOT_CACHE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            keys = data.get("keys", [])
            if keys:
                updated = data.get("updated_at", "?")
                console.print(f"[green][OK] Loaded {len(keys)} keys from hot cache (updated {updated})[/green]")
                return _normalize_pool_keys(keys)
        except Exception as e:
            console.print(f"[yellow][WARN] Hot cache read failed: {e}[/yellow]")

    # Source 2: committed validated_keys.json
    if os.path.exists(VALIDATED_KEYS_PATH):
        try:
            with open(VALIDATED_KEYS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            keys = data.get("keys", [])
            if keys:
                console.print(f"[green][OK] Loaded {len(keys)} keys from data/validated_keys.json[/green]")
                return _normalize_pool_keys(keys)
        except Exception as e:
            console.print(f"[yellow][WARN] validated_keys.json read failed: {e}[/yellow]")

    # Source 3: remote validated_keys.json
    console.print("[yellow]Fetching validated keys from remote repo...[/yellow]")
    try:
        req = urllib.request.Request(
            REMOTE_VALIDATED_KEYS_URL,
            headers={"User-Agent": "EushopAgent/2.0"}
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        keys = data.get("keys", [])
        if keys:
            console.print(f"[green][OK] Loaded {len(keys)} keys from remote repo[/green]")
            return _normalize_pool_keys(keys)
    except Exception as e:
        console.print(f"[yellow][WARN] Remote pool fetch failed: {e}[/yellow]")

    # Source 4: original README scrape fallback
    console.print("[yellow]Falling back to README scrape...[/yellow]")
    return []  # Caller will handle README path


def _normalize_pool_keys(keys: list[dict]) -> list[dict]:
    """
    Normalise pool keys to the format expected by parse_keys_from_readme(),
    adding required fields if missing.
    """
    normalized = []
    for k in keys:
        normalized.append({
            "key": k.get("key", ""),
            "model": k.get("model", "gpt-3.5-turbo"),
            "group": k.get("group", k.get("source_repo", "Pool")),
            "status": "Active" if k.get("valid", True) else "Expired",
            "valid": k.get("valid", True),
            "rate_limited": k.get("rate_limited", False),
            "budget": k.get("budget", ""),
            "rate_limit": "",
            "expires": k.get("expires", ""),
            "desc": k.get("desc", ""),
            "base_url": k.get("working_base_url", k.get("base_url", DEFAULT_API_BASE)),
        })
    return [n for n in normalized if n["key"]]


def report_key_failure(key: str):
    """Mark a key as invalid in the hot cache for daemon feedback loop."""
    if not os.path.exists(HOT_CACHE_PATH):
        return
    try:
        with open(HOT_CACHE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        for k in data.get("keys", []):
            if k.get("key") == key:
                k["valid"] = False
                k["failed_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
        with open(HOT_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass  # Best-effort, don't crash agent

SYSTEM_PROMPT = """You are a helpful AI coding assistant integrated into the terminal for the EUshop project.
EUshop is an EU Specialty Food Marketplace Platform.
Tech stack:
- Backend: Java Spring Boot core-service (Spring Data JPA, PostgreSQL, REST controllers).
- Frontend: Next.js Web app (apps/web) under a pnpm workspace.
- Database: PostgreSQL (tables for users, foods, orders, reviews, chat, notifications).

You have access to read files in the project. If the user asks you about a file or wants you to inspect it, ask them to use the `/read <filepath>` command.
You can suggest code modifications, bug fixes, or improvements.
Be concise and focus on terminal-friendly, actionable suggestions.
"""

def clean_text(text: str) -> str:
    """Clean emojis and special characters from text to prevent terminal encoding issues."""
    if not text:
        return ""
    replacements = {
        "🆕": "[NEW]",
        "🎁": "[GIFT]",
        "💡": "[INFO]",
        "⚠️": "[WARN]",
        "⏰": "[TIME]",
        "📋": "[LIST]",
        "🚀": "[START]",
        "🤖": "[AI]",
        "❓": "[FAQ]",
        "🧪": "[TEST]",
        "💼": "[WORK]",
        "⭐": "[STAR]",
        "🔔": "[BELL]",
        "✓": "[OK]",
        "✗": "[ERROR]",
        "▲": "[WARN]"
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    return re.sub(r'[^\x00-\x7F]+', '?', text)

def fetch_readme_remote() -> str:
    """Fetch README.md from remote repo with a 3s timeout."""
    try:
        req = urllib.request.Request(
            GITHUB_README_URL,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=3) as response:
            return response.read().decode("utf-8")
    except Exception as e:
        console.print(f"[yellow][WARN] Remote fetch failed: {e}. Trying local fallback...[/yellow]")
        return None

def fetch_readme_local() -> str:
    """Read README.md from local repository fallback."""
    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "free-llm-api-keys-main", "README.md"),
        os.path.join(os.getcwd(), "free-llm-api-keys-main", "README.md"),
        "D:\\CODING\\eushop\\free-llm-api-keys-main\\README.md"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception as e:
                console.print(f"[yellow][WARN] Failed to read local keys from {path}: {e}[/yellow]")
    return None

def refresh_local_readme(content: str):
    """Write remote README content back to the local cache path."""
    possible_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "free-llm-api-keys-main", "README.md"),
        os.path.join(os.getcwd(), "free-llm-api-keys-main", "README.md"),
        "D:\\CODING\\eushop\\free-llm-api-keys-main\\README.md"
    ]
    for path in possible_paths:
        if os.path.exists(path) or os.path.exists(os.path.dirname(path)):
            try:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                break
            except Exception:
                pass

def parse_keys_from_readme(readme_content: str) -> list[dict]:
    """Parse keys, models, groups, and rates from README markdown content."""
    keys = []
    current_group = "Unknown"
    for line in readme_content.splitlines():
        line = line.strip()
        if line.startswith("### "):
            current_group = line.replace("### ", "").split("`")[0].strip()
        elif line.startswith("|") and "sk-" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 8:
                key = parts[1].replace("`", "").strip()
                model = parts[2].replace("`", "").strip()
                status = clean_text(parts[3])
                budget = clean_text(parts[4])
                rate_limit = clean_text(parts[5])
                expires = clean_text(parts[6])
                desc = clean_text(parts[7]) if len(parts) > 7 else ""
                keys.append({
                    "key": key,
                    "model": model,
                    "group": clean_text(current_group),
                    "status": status,
                    "budget": budget,
                    "rate_limit": rate_limit,
                    "expires": expires,
                    "desc": desc
                })
    return keys

# ─────────────────────────────────────────────────────────────────────────────
# Local Key-Rotation API Proxy Server (Background Thread)
# ─────────────────────────────────────────────────────────────────────────────

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def start_local_proxy_server(all_keys, default_model, port=48123):
    """
    Spins up a lightweight local OpenAI-compatible API proxy server.
    Interceptors requests from Aider / Chat, automatically rotates keys on
    failure/429, and handles streaming SSE back to the client transparently.
    """
    class LocalProxyHandler(http.server.BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            # Silence default HTTP request logger to keep console clean
            pass

        def do_GET(self):
            if self.path.rstrip('/') in ('/v1/models', '/models'):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                mock_models = {
                    "object": "list",
                    "data": [
                        {"id": "gemini-2.5-flash", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "deepseek-chat", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "kimi-k2.5", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "claude-3-5-sonnet", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "claude-3-5-haiku", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "gpt-4o", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "o1-mini", "object": "model", "created": 1677610602, "owned_by": "openai"},
                        {"id": "deepseek-r1", "object": "model", "created": 1677610602, "owned_by": "openai"},
                    ]
                }
                self.wfile.write(json.dumps(mock_models).encode('utf-8'))
                return
            self.send_error(404, "Not Found")

        def do_POST(self):
            if self.path.rstrip('/') in ('/v1/chat/completions', '/chat/completions'):
                content_length = int(self.headers.get('Content-Length', 0))
                body_bytes = self.rfile.read(content_length) if content_length > 0 else b''
                try:
                    body = json.loads(body_bytes.decode('utf-8'))
                except Exception as e:
                    self.send_error(400, f"Invalid JSON: {e}")
                    return

                req_model = body.get("model", "")
                target_model = req_model.split("/")[-1] if "/" in req_model else req_model

                success = self.forward_request_with_retry(target_model, body)
                if not success:
                    self.send_error(502, "All upstream LLM keys and fallbacks exhausted.")
            else:
                self.send_error(404, "Not Found")

        def forward_request_with_retry(self, target_model, original_payload) -> bool:
            keys_pool = []
            if os.path.exists(HOT_CACHE_PATH):
                try:
                    with open(HOT_CACHE_PATH, "r", encoding="utf-8") as f:
                        keys_pool = json.load(f).get("keys", [])
                except Exception:
                    pass

            if not keys_pool:
                keys_pool = self.all_keys

            # 1. Build a prioritized order of models to try (graceful degradation)
            models_to_try = [target_model]
            
            MODEL_FALLBACKS = {
                "deepseek-chat": ["gemini-2.5-flash", "kimi-k2.5", "gpt-4o", "claude-3-5-haiku", "claude-3-5-sonnet"],
                # claude-3-5-sonnet has ~200K ctx; when it hits limits try models with larger/different context
                "claude-3-5-sonnet": ["gemini-2.5-flash", "kimi-k2.5", "deepseek-chat", "claude-3-5-haiku", "gpt-4o", "deepseek-r1"],
                "claude-3-5-haiku": ["gemini-2.5-flash", "kimi-k2.5", "claude-3-5-sonnet", "gpt-4o", "deepseek-chat"],
                "gpt-4o": ["gemini-2.5-flash", "kimi-k2.5", "claude-3-5-haiku", "deepseek-chat"],
                "gemini-2.5-flash": ["kimi-k2.5", "gpt-4o", "claude-3-5-haiku", "deepseek-chat"],
                "kimi-k2.5": ["gemini-2.5-flash", "deepseek-chat", "gpt-4o", "claude-3-5-haiku"],
                "o1-mini": ["deepseek-r1", "gpt-4o", "claude-3-5-sonnet", "gemini-2.5-flash"],
                "deepseek-r1": ["o1-mini", "claude-3-5-sonnet", "gpt-4o", "gemini-2.5-flash"],
                "cohere/north-mini-code:free": ["poolside/laguna-m.1:free", "poolside/laguna-xs.2:free", "gemini-2.5-flash", "deepseek-chat"],
                "poolside/laguna-m.1:free": ["poolside/laguna-xs.2:free", "cohere/north-mini-code:free", "gemini-2.5-flash", "deepseek-chat"],
                "poolside/laguna-xs.2:free": ["poolside/laguna-m.1:free", "cohere/north-mini-code:free", "gemini-2.5-flash", "deepseek-chat"],
                "nvidia/nemotron-3-nano": ["gemini-2.5-flash", "deepseek-chat"],
            }
            
            normalized_target = target_model.lower()
            found_mapping = False
            for k, fallbacks in MODEL_FALLBACKS.items():
                if k in normalized_target or normalized_target in k:
                    models_to_try.extend(fallbacks)
                    found_mapping = True
                    break
            if not found_mapping:
                models_to_try.extend(["gemini-2.5-flash", "gpt-4o", "deepseek-chat"])

            # Deduplicate models to try
            seen_models = set()
            ordered_models = []
            for m in models_to_try:
                if m not in seen_models:
                    seen_models.add(m)
                    ordered_models.append(m)

            # 2. Match model attempts to valid keys
            candidates = []
            for model_attempt in ordered_models:
                # Normal keys for this model attempt
                model_keys = [
                    k for k in keys_pool 
                    if k.get("valid", True) and (model_attempt.lower() in k.get("model", "").lower())
                ]
                
                # Proxy Premium keys can support any premium model ID
                premium_list = ["claude-3-5-sonnet", "claude-3-5-haiku", "gpt-4o", "o1-mini", "deepseek-r1"]
                if model_attempt.lower() in premium_list:
                    proxy_keys = [
                        k for k in keys_pool 
                        if k.get("valid", True) and ("pekpik" in k.get("base_url", "") or "pawan" in k.get("base_url", "") or "pekpik" in k.get("group", "").lower())
                    ]
                    model_keys.extend(proxy_keys)

                # Prioritize: clean (non-rate-limited) keys first
                model_keys = sorted(
                    model_keys,
                    key=lambda k: (k.get("rate_limited", False), k.get("failed_at", ""))
                )

                # Deduplicate keys for this attempt, limiting to at most 4 keys to fail fast
                seen_keys = set()
                count = 0
                for mk in model_keys:
                    k_val = mk["key"]
                    if k_val not in seen_keys:
                        seen_keys.add(k_val)
                        candidates.append((mk, model_attempt))
                        count += 1
                        if count >= 4:
                            break

            # Deduplicate candidates across all attempts while preserving order
            final_candidates = []
            seen_cand = set()
            for mk, m_name in candidates:
                cand_id = (mk["key"], m_name)
                if cand_id not in seen_cand:
                    seen_cand.add(cand_id)
                    final_candidates.append((mk, m_name))

            # 3. Safe fallback if candidates is empty
            if not final_candidates:
                any_valid = [k for k in keys_pool if k.get("valid", True)]
                for k in any_valid:
                    final_candidates.append((k, k.get("model", "gpt-3.5-turbo")))

            if not final_candidates:
                console.print("[red][ERROR] Proxy: No valid keys found in pool.[/red]")
                return False

            # 4. Try each candidate (key + model configuration)
            for item, model_name in final_candidates:
                key = item["key"]
                base_url = item.get("working_base_url") or item.get("base_url") or DEFAULT_API_BASE
                
                payload = original_payload.copy()
                payload["model"] = model_name

                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                for h in ["Accept", "X-Stainless-Lang", "User-Agent"]:
                    if h in self.headers:
                        headers[h] = self.headers[h]

                url = f"{base_url.rstrip('/')}/chat/completions"
                is_stream = payload.get("stream", False)

                try:
                    console.print(f"[yellow]Proxy: Forwarding to {base_url} (model: {model_name})...[/yellow]")
                    resp = requests.post(url, json=payload, headers=headers, stream=is_stream, timeout=15)

                    if resp.status_code == 200:
                        # ── Graceful degradation: inspect non-stream body for error payloads ──
                        # Some providers return 200 OK with a JSON error body (e.g. context limit)
                        if not is_stream:
                            try:
                                body_json = resp.json()
                                err_obj = body_json.get("error") or {}
                                err_code = str(err_obj.get("code", "") or err_obj.get("type", ""))
                                TOKEN_LIMIT_CODES = (
                                    "context_length_exceeded",
                                    "max_tokens_exceeded",
                                    "token_limit",
                                    "invalid_request_error",
                                )
                                if err_obj and any(c in err_code.lower() for c in TOKEN_LIMIT_CODES):
                                    console.print(f"[red][WARN] Model {model_name} hit token/context limit (200 error body). Rotating model...[/red]")
                                    continue
                                # Also check finish_reason on the choices array
                                for choice in body_json.get("choices", []):
                                    if choice.get("finish_reason") == "length":
                                        console.print(f"[red][WARN] Model {model_name} finish_reason=length (token limit). Rotating model...[/red]")
                                        # Don't continue — partial response is still useful; let it through
                                        break
                            except Exception:
                                pass  # Not JSON — forward as-is

                            self.send_response(200)
                            for h, v in resp.headers.items():
                                if h.lower() not in ("content-length", "connection", "transfer-encoding", "content-encoding"):
                                    self.send_header(h, v)
                            self.end_headers()
                            self.wfile.write(resp.content)
                            return True

                        else:
                            # ── Streaming: FULL buffer — detect token limits before Aider sees them ──
                            # finish_reason="length" appears at the END of the SSE stream.
                            # We must buffer the COMPLETE response so we can inspect it entirely
                            # and rotate to the next model if needed — Aider never sees the failure.
                            console.print(f"[dim]Proxy: Buffering stream from {model_name} for quality check...[/dim]")
                            full_body = b""
                            try:
                                for chunk in resp.iter_content(chunk_size=4096):
                                    full_body += chunk
                            except Exception as stream_err:
                                console.print(f"[yellow][WARN] Stream interrupted from {model_name}: {stream_err}. Rotating...[/yellow]")
                                continue

                            # ── Inspect the complete body for any token-limit signals ──
                            token_limit_hit = False
                            try:
                                body_str = full_body.decode("utf-8", errors="ignore")

                                # Signal 1: SSE error event with known limit codes
                                TOKEN_LIMIT_STRINGS = [
                                    "context_length_exceeded",
                                    "max_tokens_exceeded",
                                    "token_limit",
                                    "content_filter",
                                    "context window",
                                    "context_window",
                                ]
                                if '"error"' in body_str and any(s in body_str for s in TOKEN_LIMIT_STRINGS):
                                    token_limit_hit = True

                                # Signal 2: finish_reason="length" in any SSE data line
                                # This is what Aider itself detects to show the token limit warning
                                if not token_limit_hit and '"finish_reason":"length"' in body_str.replace(" ", ""):
                                    token_limit_hit = True

                                # Signal 3: Aider-specific — the body is empty or trivially short
                                # (model returned nothing useful due to context overflow)
                                if not token_limit_hit and len(full_body.strip()) < 50:
                                    token_limit_hit = True

                            except Exception:
                                pass  # Can't decode — forward as-is

                            if token_limit_hit:
                                console.print(f"[red bold][WARN] Model {model_name} hit token/context limit (finish_reason=length or error in stream). Auto-rotating to next model...[/red bold]")
                                continue

                            # ── Clean response — commit and send the buffered body to Aider ──
                            self.send_response(200)
                            for h, v in resp.headers.items():
                                if h.lower() not in ("content-length", "connection", "transfer-encoding", "content-encoding"):
                                    self.send_header(h, v)
                            self.end_headers()
                            self.wfile.write(full_body)
                            self.wfile.flush()
                            return True

                    elif resp.status_code in (401, 403):
                        report_key_failure(key)
                        console.print(f"[red][WARN] Key {key[:8]}... returned status {resp.status_code} for {model_name}. Rotating...[/red]")
                        continue
                    elif resp.status_code == 429:
                        # Rate limit — mark key and immediately try next
                        report_key_failure(key)
                        console.print(f"[red][WARN] Key {key[:8]}... rate-limited (429) for {model_name}. Rotating...[/red]")
                        continue
                    elif resp.status_code in (400, 413):
                        # Context length / payload too large — model-specific, try next model
                        console.print(f"[red][WARN] Model {model_name} returned {resp.status_code} (likely context limit). Rotating model...[/red]")
                        continue
                    elif resp.status_code == 503:
                        console.print(f"[yellow][WARN] {base_url} returned 503 (overloaded). Rotating...[/yellow]")
                        continue
                    else:
                        console.print(f"[yellow][WARN] Upstream returned status {resp.status_code} on {base_url}. Rotating...[/yellow]")
                        continue

                except requests.exceptions.Timeout:
                    console.print(f"[yellow][WARN] Timeout connecting to {base_url} for {model_name}. Rotating...[/yellow]")
                    continue
                except requests.exceptions.ConnectionError as e:
                    console.print(f"[yellow][WARN] Connection error to {base_url}: {e}. Rotating...[/yellow]")
                    continue
                except Exception as e:
                    console.print(f"[yellow][WARN] Unexpected error on {base_url}: {e}. Rotating...[/yellow]")
                    continue

            return False

    LocalProxyHandler.all_keys = all_keys
    LocalProxyHandler.default_model = default_model

    for p in range(port, port + 10):
        try:
            server = ThreadedHTTPServer(('127.0.0.1', p), LocalProxyHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            return p, server
        except Exception:
            continue
    raise RuntimeError("Could not find a free port for local API proxy")

def verify_key(key: str, model: str, base_url: str = None) -> bool:
    """
    Lightweight key validation with multi-URL waterfall.
    Tries base_url first, then each PROXY_BASE_URLS entry.
    """
    urls_to_try = []
    if base_url and base_url not in PROXY_BASE_URLS:
        urls_to_try.append(base_url)
    urls_to_try.extend(PROXY_BASE_URLS)

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Ping"}],
        "max_tokens": 1
    }
    for url_base in urls_to_try[:3]:  # Max 3 attempts
        try:
            response = requests.post(f"{url_base}/chat/completions", json=payload, headers=headers, timeout=4)
            if response.status_code == 200:
                return True
            elif response.status_code in (401, 403):
                return False  # Definitively bad key
            elif response.status_code == 429:
                return True   # Rate-limited but key is real
        except Exception:
            continue
    return False

def get_any_working_key(exclude_model: str, sorted_models: list) -> dict:
    """Scan other models in parallel for any working key."""
    fallback_candidates = []
    for other_model_name, other_info in sorted_models:
        if other_model_name != exclude_model:
            fallback_candidates.append(other_info["items"][0])
            
    working_fallback_items = []
    with ThreadPoolExecutor(max_workers=min(len(fallback_candidates), 15)) as executor:
        futures = {executor.submit(verify_key, item["key"], item["model"]): item for item in fallback_candidates}
        for future in as_completed(futures):
            item = futures[future]
            try:
                is_active = future.result()
                if is_active:
                    working_fallback_items.append(item)
            except Exception:
                pass
    return working_fallback_items[0] if working_fallback_items else None

def show_dashboard(keys: list[dict]):
    """Display a summary table of models, verifying live status in parallel on startup."""
    models_summary = {}
    for item in keys:
        model = item["model"]
        if model not in models_summary:
            models_summary[model] = {
                "group": item["group"],
                "keys_count": 0,
                "expires": item["expires"],
                "rate_limit": item["rate_limit"],
                "budget": item["budget"],
                "desc": item["desc"],
                "items": []
            }
        models_summary[model]["keys_count"] += 1
        models_summary[model]["items"].append(item)

    # Inject virtual premium models supported by proxies
    proxy_keys = [k for k in keys if "pekpik" in k.get("base_url", "") or "pawan" in k.get("base_url", "") or "pekpik" in k.get("group", "").lower() or "pool" in k.get("group", "").lower()]
    if not proxy_keys and keys:
        proxy_keys = keys

    premium_models = [
        ("claude-3-5-sonnet", "Anthropic Claude 3.5 Sonnet (Premium)"),
        ("claude-3-5-haiku", "Anthropic Claude 3.5 Haiku (Premium)"),
        ("gpt-4o", "OpenAI GPT-4o (Premium)"),
        ("o1-mini", "OpenAI o1-mini reasoning model"),
        ("deepseek-r1", "DeepSeek R1 reasoning model")
    ]
    for model_id, desc in premium_models:
        if model_id not in models_summary:
            vm_items = []
            for pk in proxy_keys:
                item_copy = pk.copy()
                item_copy["model"] = model_id
                item_copy["original_model"] = pk.get("original_model", pk["model"])
                vm_items.append(item_copy)
            
            models_summary[model_id] = {
                "group": "Proxy Premium",
                "keys_count": len(vm_items),
                "expires": "",
                "rate_limit": "",
                "budget": "",
                "desc": desc,
                "items": vm_items
            }

    sorted_models = sorted(models_summary.items(), key=lambda x: x[0])
    
    # Live verify one key from each model in parallel
    console.print("[yellow]Checking live status of all models in parallel...[/yellow]")
    live_statuses = {}
    with ThreadPoolExecutor(max_workers=min(len(sorted_models), 20)) as executor:
        futures = {executor.submit(verify_key, info["items"][0]["key"], info["items"][0].get("original_model", model_name)): model_name for model_name, info in sorted_models}
        for future in as_completed(futures):
            model_name = futures[future]
            try:
                live_statuses[model_name] = future.result()
            except Exception:
                live_statuses[model_name] = False

    table = Table(title="[bold cyan]Free LLM API Keys - Live Status Dashboard[/bold cyan]", show_header=True, header_style="bold magenta")
    table.add_column("ID", style="dim", width=4)
    table.add_column("Model Name", style="bold green")
    table.add_column("Live Status", style="bold")
    table.add_column("Provider / Group", style="blue")
    table.add_column("Keys", style="yellow", justify="center")
    table.add_column("Rate Limit", style="cyan")
    table.add_column("Budget", style="magenta")
    table.add_column("Description", style="white")

    for idx, (model_name, info) in enumerate(sorted_models, 1):
        is_active = live_statuses.get(model_name, False)
        status_text = "[green]● ACTIVE[/green]" if is_active else "[red]○ OFFLINE[/red]"
        table.add_row(
            str(idx),
            model_name,
            status_text,
            info["group"],
            str(info["keys_count"]),
            info["rate_limit"],
            info["budget"],
            info["desc"]
        )

    console.print(table)
    return sorted_models

def run_chat_session(proxy_port: int, model: str, initial_file: str = None):
    """Start an interactive CLI chat session, sending all requests through the local proxy."""
    console.print(Panel.fit(
        f"[bold green]Starting Chat Session[/bold green]\n"
        f"Model: [cyan]{model}[/cyan]\n"
        f"Local API Proxy: [cyan]http://127.0.0.1:{proxy_port}/v1[/cyan] (Auto-Rotated Pool)\n"
        f"Type [yellow]/help[/yellow] for list of commands, [yellow]/exit[/yellow] to quit.",
        border_style="green"
    ))

    session = None
    try:
        from prompt_toolkit import PromptSession
        from prompt_toolkit.history import FileHistory
        session = PromptSession(history=FileHistory(HISTORY_FILE))
    except Exception:
        pass

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Handle pre-loaded file
    if initial_file:
        if os.path.exists(initial_file):
            try:
                with open(initial_file, "r", encoding="utf-8") as f:
                    content = f.read()
                messages.append({
                    "role": "user",
                    "content": f"Here is the content of the file `{initial_file}`:\n\n```\n{content}\n```"
                })
                console.print(f"[green][OK] Pre-loaded {initial_file} ({len(content)} characters) into context.[/green]\n")
            except Exception as e:
                console.print(f"[red][ERROR] Error pre-loading file {initial_file}: {e}[/red]\n")
        else:
            console.print(f"[red][ERROR] Pre-load file not found: {initial_file}[/red]\n")

    while True:
        try:
            if session:
                user_input = session.prompt("eushop-chat> ").strip()
            else:
                user_input = input("eushop-chat> ").strip()
                
            if not user_input:
                continue

            if user_input.lower() in ["/exit", "/quit"]:
                console.print("[yellow]Exiting chat session. Goodbye![/yellow]")
                break

            if user_input.lower() == "/help":
                console.print(Markdown(
                    "### Available Commands:\n"
                    "- `/help`: Show this help menu\n"
                    "- `/read <filepath>`: Read a file from the workspace and include its contents in the chat context\n"
                    "- `/clear`: Clear conversation history (retains system prompt)\n"
                    "- `/exit` or `/quit`: Quit the chat session\n"
                ))
                continue

            if user_input.lower() == "/clear":
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                console.print("[green][OK] Chat history cleared.[/green]")
                continue

            if user_input.startswith("/read "):
                filepath = user_input.replace("/read ", "").strip()
                if os.path.exists(filepath):
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            content = f.read()
                        messages.append({
                            "role": "user",
                            "content": f"Here is the content of the file `{filepath}`:\n\n```\n{content}\n```"
                        })
                        console.print(f"[green][OK] Loaded {filepath} ({len(content)} characters) into context.[/green]")
                    except Exception as e:
                        console.print(f"[red][ERROR] Error reading file: {e}[/red]")
                else:
                    console.print(f"[red][ERROR] File not found: {filepath}[/red]")
                continue

            # Standard user message
            messages.append({"role": "user", "content": user_input})
            
            # Clean messages (filter out empty inputs)
            api_messages = [m for m in messages if m.get("content") and m["content"].strip()]
            
            headers = {
                "Authorization": "Bearer local-key-rotation-pool-key",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model,
                "messages": api_messages
            }
            
            console.print(f"[bold yellow]Thinking ({model})...[/bold yellow]")
            response = None
            try:
                response = requests.post(
                    f"http://127.0.0.1:{proxy_port}/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=120
                )
            except Exception as e:
                console.print(f"[red][ERROR] Proxy communication failed: {e}[/red]")
                messages.pop()
                continue

            if response and response.status_code == 200:
                try:
                    result = response.json()
                    assistant_msg = result["choices"][0]["message"].get("content") or ""
                    messages.append({"role": "assistant", "content": assistant_msg})
                    
                    console.print("\n[bold green]AI Assistant:[/bold green]")
                    console.print(Markdown(clean_text(assistant_msg)))
                    console.print("")
                except Exception as e:
                    console.print(f"[red][ERROR] Failed to parse proxy response: {e}[/red]")
                    messages.pop()
            else:
                err_text = response.text if response else "Proxy timeout"
                console.print(f"[red][ERROR] Request failed: {err_text}[/red]")
                messages.pop()

        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted. Type /exit to quit.[/yellow]")
        except Exception as e:
            console.print(f"[red][ERROR] An error occurred: {e}[/red]")

def run_aider_session(proxy_port: int, model: str, initial_file: str = None):
    """Launch Aider configured to route all API calls through the local proxy server."""
    env = os.environ.copy()
    env["OPENAI_API_BASE"] = f"http://127.0.0.1:{proxy_port}/v1"
    env["OPENAI_API_KEY"] = "local-key-rotation-pool-key"

    model_name = f"openai/{model}"
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    aider_path = os.path.join(project_root, ".venv", "Scripts", "aider.exe")

    if not os.path.exists(aider_path):
        aider_path = "aider"

    cmd = [aider_path, "--model", model_name,
           # ── Speed / UX / Autonomy flags ────────────────────────────────────
           "--no-pretty",               # Skip rich terminal formatting (faster rendering)
           "--no-show-model-warnings",  # Proxy handles token limits — suppress Aider's own warnings
           "--map-tokens", "1024",      # Smaller repo-map = faster context building per request
           "--no-git-commit-verify",    # Skip slow pre-commit hooks; git commits still work
           "--yes-always",              # Turbo Mode: auto-accept all shell executions & prompts
           ]

    if initial_file:
        if os.path.exists(initial_file):
            cmd.append(initial_file)
            console.print(f"[green][OK] Configured Aider to auto-add file: {initial_file}[/green]")
        else:
            console.print(f"[yellow][WARN] File to auto-add not found: {initial_file}[/yellow]")

    console.print(Panel.fit(
        f"[bold green]Launching Aider Code-Editing Session[/bold green]\n"
        f"Model: [cyan]{model_name}[/cyan]\n"
        f"Local API Proxy Base: [cyan]http://127.0.0.1:{proxy_port}/v1[/cyan] (Auto-Rotated Pool)\n\n"
        f"Aider will open in your terminal. Use it to chat and edit files directly.\n"
        f"Type /exit inside Aider to quit.",
        border_style="green"
    ))

    try:
        subprocess.run(cmd, env=env, shell=True)
    except Exception as e:
        console.print(f"[red][ERROR] Failed to run Aider: {e}[/red]")

def main():
    parser = argparse.ArgumentParser(description="Terminal AI Chat Agent for EUshop")
    parser.add_argument("--test-scrape", action="store_true", help="Test scraping and parsing keys, then exit")
    parser.add_argument("-m", "--model", type=str, help="Directly specify the model ID or name")
    parser.add_argument("-o", "--mode", choices=["1", "2"], help="Directly specify the mode (1: Chat, 2: Aider)")
    parser.add_argument("-f", "--file", type=str, help="Pre-load a file into the chat/Aider context")
    args = parser.parse_args()

    console.print("[bold cyan]==============================================[/bold cyan]")
    console.print("[bold cyan]       EUshop Terminal AI Chat Agent        [/bold cyan]")
    console.print("[bold cyan]==============================================[/bold cyan]")

    # 1. Try key pool first (hot cache → validated_keys.json → remote repo)
    # Then fall back to original README scrape if pool is empty
    console.print("[yellow]Loading API key pool...[/yellow]")

    # Check for ACTIVE_API_KEY env var (set by key_daemon.py)
    env_key = os.environ.get("ACTIVE_API_KEY", "")
    env_model = os.environ.get("ACTIVE_API_MODEL", "")
    env_base = os.environ.get("ACTIVE_API_BASE_URL", DEFAULT_API_BASE)

    pool_keys = load_key_pool()

    if not pool_keys:
        # Fallback: README scrape (original path)
        console.print("[yellow]Key pool empty — falling back to README scrape...[/yellow]")
        readme = fetch_readme_remote()
        if readme:
            refresh_local_readme(readme)
        else:
            console.print("[yellow]Using local README cache...[/yellow]")
            readme = fetch_readme_local()

        if not readme:
            console.print("[red][ERROR] Critical error: Could not load any key source.[/red]")
            sys.exit(1)

        keys = parse_keys_from_readme(readme)
        if not keys:
            console.print("[red][ERROR] Critical error: No keys parsed from README.md.[/red]")
            sys.exit(1)
        console.print(f"[green][OK] Parsed {len(keys)} keys from README fallback.[/green]\n")
    else:
        keys = pool_keys
        # Prepend the env-var key if set and not already in pool
        if env_key and not any(k["key"] == env_key for k in keys):
            keys.insert(0, {
                "key": env_key,
                "model": env_model or "gpt-4o",
                "group": "env:ACTIVE_API_KEY",
                "status": "Active",
                "budget": "",
                "rate_limit": "",
                "expires": "",
                "desc": "From .env.local (daemon-managed)",
                "base_url": env_base,
            })
        console.print(f"[green][OK] Pool loaded: {len(keys)} keys available.[/green]\n")

    if args.test_scrape:
        console.print(f"[green]Scrape test passed. Found groups:[/green]")
        groups = set(k["group"] for k in keys)
        for g in groups:
            console.print(f" - {g}")
        sys.exit(0)

    # 3. Show models dashboard with parallel live status verification
    sorted_models = show_dashboard(keys)

    # 4. Model selection
    selected_model_name = None
    selected_model_info = None

    if args.model:
        selection = args.model.strip()
        try:
            idx = int(selection) - 1
            if 0 <= idx < len(sorted_models):
                selected_model_name, selected_model_info = sorted_models[idx]
        except ValueError:
            for model_name, info in sorted_models:
                if model_name.lower() == selection.lower():
                    selected_model_name = model_name
                    selected_model_info = info
                    break
        if not selected_model_name:
            console.print(f"[red][ERROR] Specified model '{selection}' not found in available keys.[/red]")
            sys.exit(1)
        console.print(f"[green][OK] Selected model '{selected_model_name}' via CLI argument.[/green]")
    else:
        selection = Prompt.ask("\nSelect a model ID or name to use", default="1")
        try:
            idx = int(selection) - 1
            if 0 <= idx < len(sorted_models):
                selected_model_name, selected_model_info = sorted_models[idx]
        except ValueError:
            for model_name, info in sorted_models:
                if model_name.lower() == selection.lower().strip():
                    selected_model_name = model_name
                    selected_model_info = info
                    break

    if not selected_model_name:
        console.print("[red][ERROR] Invalid model selection. Exiting.[/red]")
        sys.exit(1)

    # 5. Start the local API proxy server
    console.print(f"\n[yellow]Starting local API proxy server on background thread...[/yellow]")
    try:
        proxy_port, server = start_local_proxy_server(keys, selected_model_name)
        console.print(f"[green][OK] Local key-rotation proxy server is active on http://127.0.0.1:{proxy_port}/v1[/green]")
    except Exception as e:
        console.print(f"[red][ERROR] Could not start proxy server: {e}[/red]")
        sys.exit(1)

    # 6. Mode selection
    mode = None
    if args.mode:
        mode = args.mode
        mode_desc = "Interactive CLI Chat" if mode == "1" else "Aider Code-Editor"
        console.print(f"[green][OK] Selected mode '{mode_desc}' via CLI argument.[/green]")
    else:
        console.print("\n[bold]Select Agent Mode:[/bold]")
        console.print("1. [bold green]Interactive CLI Chat[/bold green] (chit-chat, codebase questions, file readings)")
        console.print("2. [bold blue]Aider Code-Editor[/bold blue] (agentic file editing, auto-git commits, full project upgrades)")
        mode = Prompt.ask("Select mode", choices=["1", "2"], default="1")

    # 7. Run session
    if mode == "1":
        run_chat_session(proxy_port, selected_model_name, args.file)
    elif mode == "2":
        run_aider_session(proxy_port, selected_model_name, args.file)

if __name__ == "__main__":
    main()
