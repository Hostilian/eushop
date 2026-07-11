import requests
import urllib3
import json

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

key = "sk-b917ec3d00a24ebebce7533915c2a10d"

endpoints = [
    ("Pekpik", "https://aiapiv2.pekpik.com/v1"),
    ("SiliconFlow", "https://api.siliconflow.cn/v1"),
    ("DeepSeek", "https://api.deepseek.com/v1"),
    ("OpenRouter", "https://openrouter.ai/api/v1"),
    ("Groq", "https://api.groq.com/openai/v1"),
    ("Mistral", "https://api.mistral.ai/v1"),
    ("TogetherAI", "https://api.together.xyz/v1"),
    ("Novita", "https://api.novita.ai/v1"),
    ("DeepInfra", "https://api.deepinfra.com/v1/openai"),
    ("OpenAI", "https://api.openai.com/v1"),
    ("Pawan", "https://api.pawan.krd/v1"),
    ("Api2d", "https://openai.api2d.net/v1"),
]

for name, base_url in endpoints:
    payload = {
        "model": "gemini-2.5-flash",
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 5
    }
    # Adapt model names for specific providers
    if name == "SiliconFlow" or name == "OpenRouter" or name == "TogetherAI":
        payload["model"] = "google/gemini-2.5-flash"
    elif name == "DeepSeek":
        payload["model"] = "deepseek-chat"
    elif name == "Groq":
        payload["model"] = "llama-3.1-8b-instant"
    elif name == "Mistral":
        payload["model"] = "mistral-tiny"

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    # Try chat completions
    try:
        r = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=5, verify=False)
        print(f"[{name}] {base_url} -> Status: {r.status_code}, Response: {r.text[:140]}")
    except Exception as e:
        print(f"[{name}] {base_url} -> Error: {e}")
