import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

key = "sk-b917ec3d00a24ebebce7533915c2a10d"
base_url = "https://aiapiv2.pekpik.com/v1"

headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

endpoints = [
    f"{base_url}/dashboard/billing/subscription",
    f"{base_url}/dashboard/billing/usage",
    f"{base_url}/dashboard/billing/credit_grants",
    f"{base_url}/user/balance",
    f"{base_url}/user/info",
    f"{base_url}/key/info",
    f"{base_url}/balance",
    f"{base_url.replace('/v1', '')}/dashboard/billing/credit_grants",
    f"{base_url.replace('/v1', '')}/api/balance",
]

print("Starting checks for Pekpik key balance/credits...\n")

for url in endpoints:
    try:
        r = requests.get(url, headers=headers, timeout=5, verify=False)
        print(f"URL: {url}")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:300]}")
        print("-" * 50)
    except Exception as e:
        print(f"URL: {url} failed with error: {e}")
        print("-" * 50)
