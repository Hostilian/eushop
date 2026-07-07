#!/usr/bin/env python3
import os
import re
import sys
import requests
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

PEKPIK_BASE = "https://aiapiv2.pekpik.com/v1"
README_PATH = "D:\\CODING\\eushop\\free-llm-api-keys-main\\README.md"
FCC_ENV_PATH = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\.env"
REPO_DIR = "D:\\CODING\\eushop\\free-claude-code-main"

def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'[^\x00-\x7F]+', '?', text).strip()

def parse_keys() -> list[dict]:
    if not os.path.exists(README_PATH):
        print(f"[ERROR] Local README cache not found at {README_PATH}")
        return []
    
    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    keys = []
    current_group = "Unknown"
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("### "):
            current_group = line.replace("### ", "").split("`")[0].strip()
        elif line.startswith("|") and "sk-" in line:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 8:
                key = parts[1].replace("`", "").strip()
                model = parts[2].replace("`", "").strip()
                keys.append({
                    "key": key,
                    "model": model,
                    "group": current_group
                })
    return keys

def verify_key(key: str, model: str) -> tuple[bool, str]:
    url = f"{PEKPIK_BASE}/chat/completions"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Ping"}],
        "max_tokens": 1
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            return True, "200 OK"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:100]}"
    except Exception as e:
        return False, f"Exception: {e}"

def pull_latest_code():
    print("[INFO] Discarding local edits and pulling latest code from Alishahryar1/free-claude-code...")
    try:
        # Discard local modifications to allow clean pull without conflicts
        files_to_checkout = [
            "free-claude-code-main/config/settings.py",
            "free-claude-code-main/config/provider_catalog.py",
            "free-claude-code-main/core/anthropic/tokens.py"
        ]
        subprocess.run(["git", "-C", REPO_DIR, "checkout", "--"] + files_to_checkout, capture_output=True)
        
        # Pull latest changes
        result = subprocess.run(["git", "-C", REPO_DIR, "pull"], capture_output=True, text=True)
        print(f"[INFO] Git pull output: {result.stdout.strip() or 'Already up to date.'}")
    except Exception as e:
        print(f"[WARN] Git pull failed: {e}")

def apply_local_patches():
    print("[INFO] Re-applying custom compatibility and Pekpik gateway routing patches...")
    
    # 1. Patch config/settings.py
    settings_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\config\\settings.py"
    if os.path.exists(settings_path):
        with open(settings_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "from __future__ import annotations" not in content:
            lines = content.splitlines(keepends=True)
            lines.insert(2, "from __future__ import annotations\n\n")
            with open(settings_path, "w", encoding="utf-8") as f:
                f.writelines(lines)
            print("[PATCH] Applied __future__ annotations to settings.py")

    # 2. Patch core/anthropic/tokens.py
    tokens_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\core\\anthropic\\tokens.py"
    if os.path.exists(tokens_path):
        with open(tokens_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "except TypeError, ValueError:" in content:
            content = content.replace("except TypeError, ValueError:", "except (TypeError, ValueError):")
            with open(tokens_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("[PATCH] Applied exception parenthesis fix to tokens.py")

    # 3. Patch config/provider_catalog.py
    catalog_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\config\\provider_catalog.py"
    if os.path.exists(catalog_path):
        with open(catalog_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        replacements = {
            'DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com"': 'DEEPSEEK_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1"': 'OPENROUTER_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'GEMINI_DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/"': 'GEMINI_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1"': 'GROQ_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"'
        }
        modified = False
        for orig, rep in replacements.items():
            if orig in content:
                content = content.replace(orig, rep)
                modified = True
        if modified:
            with open(catalog_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("[PATCH] Applied provider catalog Pekpik overrides")

def main():
    print("==============================================")
    print("   Free Claude Code (FCC) Key Synchronizer    ")
    print("==============================================")

    # 1. Pull latest proxy updates
    pull_latest_code()

    # 2. Re-apply patches
    apply_local_patches()

    # 3. Parse keys
    keys = parse_keys()
    if not keys:
        print("[ERROR] No keys parsed.")
        sys.exit(1)

    print(f"[INFO] Parsed {len(keys)} keys from cache. Verifying active keys in parallel...")

    # Group by model
    model_keys = {}
    for item in keys:
        model_keys.setdefault(item["model"], []).append(item["key"])

    # Test the first key of each model in parallel
    active_models = {}
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(verify_key, keys_list[0], model_name): (model_name, keys_list[0]) 
                   for model_name, keys_list in model_keys.items()}
        for future in as_completed(futures):
            model_name, key = futures[future]
            try:
                is_active, detail = future.result()
                if is_active:
                    active_models[model_name] = key
                    print(f" - [ACTIVE] Model: {model_name} | Key: {key[:8]}...")
            except Exception:
                pass

    if not active_models:
        print("[ERROR] No active keys found for any model. Sync aborted.")
        sys.exit(1)

    # Select the best model for Claude Code
    priority_list = [
        "kimi-k2.5",
        "moonshotai/kimi-k2.7-code",
        "deepseek-chat",
        "gemini-2.5-flash",
        "smart-chat"
    ]
    
    selected_model = None
    for p_model in priority_list:
        if p_model in active_models:
            selected_model = p_model
            break

    if not selected_model:
        selected_model = list(active_models.keys())[0]

    selected_key = active_models[selected_model]
    print(f"\n[OK] Selected best active model: '{selected_model}'")
    print(f"[OK] Using key: '{selected_key[:8]}...{selected_key[-8:]}'")

    # Generate FCC .env configuration (explicitly disabling voice notes to prevent NIM API key errors)
    env_content = f"""# =========================================================================
# Free Claude Code (FCC) Configuration File
# Automatically updated by sync_fcc.py
# =========================================================================

# Main routing model (using deepseek provider namespace routed to Pekpik)
MODEL="deepseek/{selected_model}"
MODEL_OPUS="deepseek/{selected_model}"
MODEL_SONNET="deepseek/{selected_model}"
MODEL_HAIKU="deepseek/{selected_model}"

# Upstream DeepSeek provider credentials (routed to Pekpik base)
DEEPSEEK_API_KEY="{selected_key}"

# Optional alternative credentials
GEMINI_API_KEY="{active_models.get('gemini-2.5-flash', '')}"
GROQ_API_KEY="{active_models.get('smart-chat', '')}"
OPENROUTER_API_KEY="{selected_key}"

# Local Server Settings
HOST="127.0.0.1"
PORT=8082
ANTHROPIC_AUTH_TOKEN="freecc"
FCC_OPEN_BROWSER=false

# Agent Settings
ENABLE_MODEL_THINKING=true
ENABLE_WEB_SERVER_TOOLS=false
LOG_RAW_API_PAYLOADS=false
LOG_RAW_SSE_EVENTS=false

# Voice transcription settings (disabled to bypass NVIDIA NIM API key requirement)
VOICE_NOTE_ENABLED=false
WHISPER_DEVICE="cpu"
"""

    # Write to FCC directory
    try:
        os.makedirs(os.path.dirname(FCC_ENV_PATH), exist_ok=True)
        with open(FCC_ENV_PATH, "w", encoding="utf-8") as f:
            f.write(env_content)
        print(f"[OK] Successfully wrote config to {FCC_ENV_PATH}")
    except Exception as e:
        print(f"[ERROR] Failed to write config: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
