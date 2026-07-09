import requests
import json

key = "sk-b917ec3d00a24ebebce7533915c2a10d"
base_url = "https://aiapiv2.pekpik.com/v1"

payload = {
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "ping"}],
    "max_tokens": 5
}
headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

try:
    print("Testing Pekpik with gemini-2.5-flash...")
    r = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=10)
    print("Status:", r.status_code)
    print("Response:", r.text)
except Exception as e:
    print("Error:", e)
