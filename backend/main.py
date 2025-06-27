import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging
from time import time
from dotenv import load_dotenv

from .config import GROQ_ENDPOINT, HEADERS, SYSTEM_PROMPT, MODELS
from .utils import estimate_tokens, estimate_emissions

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
else:
    logger.warning("Static frontend directory not found; /static route will not be mounted.")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.post("/compare/{model_key}")
async def compare_model(model_key: str, request: Request):
    body = await request.json()
    prompt = body.get("prompt")

    if not prompt or model_key not in MODELS:
        return JSONResponse(status_code=400, content={"error": "Invalid prompt or model."})

    payload = {
        "model": MODELS[model_key],
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        start_time = time()
        async with httpx.AsyncClient() as client:
            res = await client.post(GROQ_ENDPOINT, headers=HEADERS, json=payload)
        latency = round((time() - start_time) * 1000)
        data = res.json()

        if "error" in data:
            return {"error": data["error"]["message"]}

        content = data["choices"][0]["message"]["content"].strip()
        usage = data.get("usage", {})
        prompt_tokens = usage.get("prompt_tokens") or 0
        completion_tokens = usage.get("completion_tokens") or 0
        total_tokens = usage.get("total_tokens") or estimate_tokens(content)
        emissions = estimate_emissions(total_tokens)

        logger.info(f"[{model_key.upper()}] Input: {prompt_tokens} | Output: {completion_tokens} | Total: {total_tokens} tokens")

        return {
            "response": content,
            "tokens": total_tokens,
            "emissions": emissions,
            "latency": latency
        }

    except Exception as e:
        logger.error(f"Error during model call: {e}")
        return {"error": "Internal server error."}
