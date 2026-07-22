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
<<<<<<< HEAD
REPO_DIR = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main"
=======
REPO_DIR = "D:\\CODING\\eushop\\free-claude-code-main"
>>>>>>> pull-1

def clean_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'[^\x00-\x7F]+', '?', text).strip()

<<<<<<< HEAD
import json

def load_custom_keys() -> list[dict]:
    custom_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "custom_keys.json")
    if os.path.exists(custom_path):
        try:
            with open(custom_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            keys = []
            for item in data:
                if isinstance(item, dict) and "key" in item:
                    keys.append({
                        "key": item["key"],
                        "model": item.get("model", "gemini-2.5-flash"),
                        "base_url": item.get("base_url", PEKPIK_BASE),
                        "group": item.get("group", "Custom User Key"),
                        "custom": True
                    })
            return keys
        except Exception:
            pass
    return []

def parse_keys() -> list[dict]:
    custom_keys = load_custom_keys()
    
    pool_keys = []
    hot_cache_path = "D:\\CODING\\eushop\\.api_keys_pool.json"
    if os.path.exists(hot_cache_path):
        try:
            with open(hot_cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for k in data.get("keys", []):
                pool_keys.append({
                    "key": k["key"],
                    "model": k.get("model", "gemini-2.5-flash"),
                    "group": k.get("group", "Pool"),
                    "base_url": k.get("working_base_url", PEKPIK_BASE)
                })
        except Exception:
            pass

    readme_keys = []
    if os.path.exists(README_PATH):
        with open(README_PATH, "r", encoding="utf-8") as f:
            content = f.read()

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
                    readme_keys.append({
                        "key": key,
                        "model": model,
                        "group": current_group
                    })

    # Deduplicate keeping custom keys first, then pool keys, then readme keys
    seen = set()
    final_keys = []
    
    for k in custom_keys:
        key_pair = (k["key"], k["model"])
        if key_pair not in seen:
            seen.add(key_pair)
            final_keys.append(k)
            
    for k in pool_keys:
        key_pair = (k["key"], k["model"])
        if key_pair not in seen:
            seen.add(key_pair)
            final_keys.append(k)
            
    for k in readme_keys:
        key_pair = (k["key"], k["model"])
        if key_pair not in seen:
            seen.add(key_pair)
            final_keys.append(k)
            
    return final_keys

def verify_key(key: str, model: str, base_url: str = None) -> tuple[bool, str]:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    url_base = base_url or PEKPIK_BASE
    url = f"{url_base.rstrip('/')}/chat/completions"
=======
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
>>>>>>> pull-1
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
<<<<<<< HEAD
        response = requests.post(url, json=payload, headers=headers, timeout=5, verify=False)
=======
        response = requests.post(url, json=payload, headers=headers, timeout=5)
>>>>>>> pull-1
        if response.status_code == 200:
            return True, "200 OK"
        else:
            return False, f"HTTP {response.status_code}: {response.text[:100]}"
    except Exception as e:
        return False, f"Exception: {e}"

<<<<<<< HEAD

=======
>>>>>>> pull-1
def pull_latest_code():
    print("[INFO] Discarding local edits and pulling latest code from Alishahryar1/free-claude-code...")
    try:
        # Discard local modifications to allow clean pull without conflicts
        files_to_checkout = [
<<<<<<< HEAD
            "src/free_claude_code/config/settings.py",
            "src/free_claude_code/config/provider_catalog.py",
            "src/free_claude_code/core/anthropic/tokens.py"
=======
            "free-claude-code-main/config/settings.py",
            "free-claude-code-main/config/provider_catalog.py",
            "free-claude-code-main/core/anthropic/tokens.py"
>>>>>>> pull-1
        ]
        subprocess.run(["git", "-C", REPO_DIR, "checkout", "--"] + files_to_checkout, capture_output=True)
        
        # Pull latest changes
        result = subprocess.run(["git", "-C", REPO_DIR, "pull"], capture_output=True, text=True)
        print(f"[INFO] Git pull output: {result.stdout.strip() or 'Already up to date.'}")
    except Exception as e:
        print(f"[WARN] Git pull failed: {e}")

<<<<<<< HEAD
def apply_local_patches(selected_base_url: str = PEKPIK_BASE):
    print(f"[INFO] Re-applying custom compatibility and Pekpik gateway routing patches (base: {selected_base_url})...")
    
    # 1. Patch config/settings.py
    settings_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\src\\free_claude_code\\config\\settings.py"
=======
def apply_local_patches():
    print("[INFO] Re-applying custom compatibility and Pekpik gateway routing patches...")
    
    # 1. Patch config/settings.py
    settings_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\config\\settings.py"
>>>>>>> pull-1
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
<<<<<<< HEAD
    tokens_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\src\\free_claude_code\\core\\anthropic\\tokens.py"
=======
    tokens_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\core\\anthropic\\tokens.py"
>>>>>>> pull-1
    if os.path.exists(tokens_path):
        with open(tokens_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "except TypeError, ValueError:" in content:
            content = content.replace("except TypeError, ValueError:", "except (TypeError, ValueError):")
            with open(tokens_path, "w", encoding="utf-8") as f:
                f.write(content)
            print("[PATCH] Applied exception parenthesis fix to tokens.py")

    # 3. Patch config/provider_catalog.py
<<<<<<< HEAD
    catalog_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\src\\free_claude_code\\config\\provider_catalog.py"
    if os.path.exists(catalog_path):
        # We need to make sure we overwrite any previous base URL overrides
        with open(catalog_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Read the clean state by resetting the base URLs if they are already modified
        import re as _re
        content = _re.sub(r'DEEPSEEK_DEFAULT_BASE = "[^"]+"', 'DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com"', content)
        content = _re.sub(r'OPENROUTER_DEFAULT_BASE = "[^"]+"', 'OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1"', content)
        content = _re.sub(r'GEMINI_DEFAULT_BASE = "[^"]+"', 'GEMINI_DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/"', content)
        content = _re.sub(r'GROQ_DEFAULT_BASE = "[^"]+"', 'GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1"', content)
        
        replacements = {
            'DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com"': f'DEEPSEEK_DEFAULT_BASE = "{selected_base_url}"',
            'OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1"': f'OPENROUTER_DEFAULT_BASE = "{selected_base_url}"',
            'GEMINI_DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/"': f'GEMINI_DEFAULT_BASE = "{selected_base_url}"',
            'GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1"': f'GROQ_DEFAULT_BASE = "{selected_base_url}"'
=======
    catalog_path = "D:\\CODING\\eushop\\free-claude-code-main\\free-claude-code-main\\config\\provider_catalog.py"
    if os.path.exists(catalog_path):
        with open(catalog_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        replacements = {
            'DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com"': 'DEEPSEEK_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1"': 'OPENROUTER_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'GEMINI_DEFAULT_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/"': 'GEMINI_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"',
            'GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1"': 'GROQ_DEFAULT_BASE = "https://aiapiv2.pekpik.com/v1"'
>>>>>>> pull-1
        }
        modified = False
        for orig, rep in replacements.items():
            if orig in content:
                content = content.replace(orig, rep)
                modified = True
        if modified:
            with open(catalog_path, "w", encoding="utf-8") as f:
                f.write(content)
<<<<<<< HEAD
            print(f"[PATCH] Applied provider catalog Pekpik overrides targeting {selected_base_url}")
=======
            print("[PATCH] Applied provider catalog Pekpik overrides")
>>>>>>> pull-1

def main():
    print("==============================================")
    print("   Free Claude Code (FCC) Key Synchronizer    ")
    print("==============================================")

    # 1. Pull latest proxy updates
    pull_latest_code()

<<<<<<< HEAD
    # 2. Parse keys
=======
    # 2. Re-apply patches
    apply_local_patches()

    # 3. Parse keys
>>>>>>> pull-1
    keys = parse_keys()
    if not keys:
        print("[ERROR] No keys parsed.")
        sys.exit(1)

    print(f"[INFO] Parsed {len(keys)} keys from cache. Verifying active keys in parallel...")

    # Group by model
    model_keys = {}
    for item in keys:
<<<<<<< HEAD
        model_keys.setdefault(item["model"], []).append(item)
=======
        model_keys.setdefault(item["model"], []).append(item["key"])
>>>>>>> pull-1

    # Test the first key of each model in parallel
    active_models = {}
    with ThreadPoolExecutor(max_workers=20) as executor:
<<<<<<< HEAD
        futures = {executor.submit(verify_key, item_list[0]["key"], model_name, item_list[0].get("base_url")): (model_name, item_list[0]) 
                   for model_name, item_list in model_keys.items()}
        for future in as_completed(futures):
            model_name, item = futures[future]
            try:
                is_active, detail = future.result()
                if is_active:
                    active_models[model_name] = item
                    print(f" - [ACTIVE] Model: {model_name} | Key: {item['key'][:8]}...")
=======
        futures = {executor.submit(verify_key, keys_list[0], model_name): (model_name, keys_list[0]) 
                   for model_name, keys_list in model_keys.items()}
        for future in as_completed(futures):
            model_name, key = futures[future]
            try:
                is_active, detail = future.result()
                if is_active:
                    active_models[model_name] = key
                    print(f" - [ACTIVE] Model: {model_name} | Key: {key[:8]}...")
>>>>>>> pull-1
            except Exception:
                pass

    if not active_models:
<<<<<<< HEAD
        print("[WARNING] No active keys found for any model in the verification. Using custom/placeholder keys to generate config...")
        for k in keys:
            if k["model"] not in active_models:
                active_models[k["model"]] = k
=======
        print("[ERROR] No active keys found for any model. Sync aborted.")
        sys.exit(1)
>>>>>>> pull-1

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

<<<<<<< HEAD
    selected_key_item = active_models[selected_model]
    selected_key = selected_key_item["key"]
    selected_base_url = selected_key_item.get("base_url", PEKPIK_BASE)
    
    print(f"\n[OK] Selected best active model: '{selected_model}'")
    print(f"[OK] Using key: '{selected_key[:8]}...{selected_key[-8:]}'")
    print(f"[OK] Base URL: '{selected_base_url}'")

    # 3. Re-apply patches with the selected base URL
    apply_local_patches(selected_base_url)

    # Generate FCC .env configuration (explicitly disabling voice notes to prevent NIM API key errors)
    gemini_item = active_models.get('gemini-2.5-flash', {})
    gemini_key = gemini_item.get('key', '') if isinstance(gemini_item, dict) else gemini_item
    
    smart_item = active_models.get('smart-chat', {})
    smart_key = smart_item.get('key', '') if isinstance(smart_item, dict) else smart_item

=======
    selected_key = active_models[selected_model]
    print(f"\n[OK] Selected best active model: '{selected_model}'")
    print(f"[OK] Using key: '{selected_key[:8]}...{selected_key[-8:]}'")

    # Generate FCC .env configuration (explicitly disabling voice notes to prevent NIM API key errors)
>>>>>>> pull-1
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
<<<<<<< HEAD
GEMINI_API_KEY="{gemini_key}"
GROQ_API_KEY="{smart_key}"
=======
GEMINI_API_KEY="{active_models.get('gemini-2.5-flash', '')}"
GROQ_API_KEY="{active_models.get('smart-chat', '')}"
>>>>>>> pull-1
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
