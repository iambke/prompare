import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY is not set in the environment.")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GROQ_API_KEY}"
}

SYSTEM_PROMPT = "You are a helpful assistant. Respond clearly and concisely."

MODELS = {
    "instant": "llama-3.1-8b-instant",
    "versatile": "llama-3.3-70b-versatile",
    "gemma": "gemma2-9b-it"
}
