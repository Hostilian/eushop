#!/usr/bin/env python3
"""Refreshes the local API keys README cache by fetching the latest keys from GitHub."""
import os
import sys
import urllib.request

# Reconfigure stdout to UTF-8
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

GITHUB_README_URL = "https://raw.githubusercontent.com/alistaitsacle/free-llm-api-keys/main/README.md"
LOCAL_README_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "free-llm-api-keys-main", "README.md")

def main():
    print("Fetching latest API keys from GitHub...")
    try:
        req = urllib.request.Request(
            GITHUB_README_URL,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode("utf-8")
        
        # Verify that it looks like a valid keys file (contains sk-)
        if "sk-" not in content:
            print("Error: Fetched content does not appear to contain valid API keys.")
            sys.exit(1)
            
        # Write to local cache
        os.makedirs(os.path.dirname(LOCAL_README_PATH), exist_ok=True)
        with open(LOCAL_README_PATH, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Successfully refreshed local keys cache at: {LOCAL_README_PATH}")
        
        # Trigger FCC keys synchronization
        try:
            print("Triggering Free Claude Code keys synchronization...")
            sys.path.append(os.path.dirname(os.path.abspath(__file__)))
            import sync_fcc
            sync_fcc.main()
        except Exception as se:
            print(f"Warning: Failed to sync Free Claude Code keys: {se}")
            
        sys.exit(0)
    except Exception as e:
        print(f"Error refreshing keys: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
