import json
import requests
import urllib3
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

pool_path = Path("d:/CODING/eushop/.api_keys_pool.json")
if not pool_path.exists():
    print("Pool file does not exist.")
    exit(1)

with open(pool_path, "r", encoding="utf-8") as f:
    pool = json.load(f)

keys = pool.get("keys", [])
print(f"Checking {len(keys)} keys from pool...\n")

for i, k in enumerate(keys):
    key = k.get("key")
    model = k.get("model")
    base_url = k.get("working_base_url") or k.get("base_url") or "https://aiapiv2.pekpik.com/v1"
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    # Try chat completions first to check if key is working
    print(f"Key #{i+1}: {key[:15]}... ({model}) via {base_url}")
    
    # Try to get subscription / balance
    url = f"{base_url.rstrip('/')}/dashboard/billing/subscription"
    try:
        r = requests.get(url, headers=headers, timeout=5, verify=False)
        print(f"  Billing Subscription status: {r.status_code}")
        if r.status_code == 200:
            sub = r.json()
            total = sub.get("hard_limit_usd", 0)
            print(f"  Total Credits (hard limit): ${total}")
        else:
            print(f"  Billing Subscription response: {r.text[:200]}")
    except Exception as e:
        print(f"  Billing Subscription error: {e}")
        
    url_usage = f"{base_url.rstrip('/')}/dashboard/billing/usage?start_date=2026-01-01&end_date=2026-12-31"
    try:
        r = requests.get(url_usage, headers=headers, timeout=5, verify=False)
        print(f"  Billing Usage status: {r.status_code}")
        if r.status_code == 200:
            usage = r.json()
            used = usage.get("total_usage", 0) / 100 # cents to dollars
            print(f"  Used Credits: ${used}")
        else:
            print(f"  Billing Usage response: {r.text[:200]}")
    except Exception as e:
        print(f"  Billing Usage error: {e}")
        
    print("-" * 50)
