require("dotenv").config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY not set in .env");
}

module.exports = {
  GROQ_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
  HEADERS: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
  },
  SYSTEM_PROMPT: "You are a helpful assistant. Respond clearly and concisely.",
  MODELS: {
    instant: "llama-3.1-8b-instant",
    versatile: "llama-3.3-70b-versatile",
    gemma: "gemma2-9b-it"
  }
};
