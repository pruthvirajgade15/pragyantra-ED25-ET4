import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def test_models():
    models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]
    
    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Say hello in one sentence"}]}]
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            try:
                res = await client.post(url, headers={"Content-Type": "application/json"}, json=payload)
                print(f"{model}: {res.status_code}", end=" ")
                if res.status_code == 200:
                    data = res.json()
                    reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"-> {reply[:80]}")
                else:
                    err = res.json().get("error", {}).get("message", "")[:100]
                    print(f"-> {err}")
            except Exception as e:
                print(f"-> Exception: {e}")
            await asyncio.sleep(2)

asyncio.run(test_models())