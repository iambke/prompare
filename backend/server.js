import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";
import rateLimit from "express-rate-limit";
import MODELS from "./models.js";
import { estimateTokens } from "./utils/tokenizer.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 20 }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${GROQ_API_KEY}`,
};

const SYSTEM_PROMPT = "You are a helpful assistant. Respond clearly and concisely.";

app.post("/compare/:model", async (req, res) => {
  const modelKey = req.params.model;
  const prompt = req.body.prompt;

  if (!prompt || prompt.length > 1000 || !MODELS[modelKey]) {
    return res.status(400).json({ error: "Invalid prompt or model." });
  }

  try {
    const body = {
      model: MODELS[modelKey],
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    };

    const start = performance.now();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const end = performance.now();

    const latency = Math.round(end - start);
    const data = await response.json();
    console.log("API Response Usage:", data.usage);

    if (data.error) return res.json({ error: data.error.message });

    const content = data.choices?.[0]?.message?.content?.trim() || "";
    const tokens = data.usage?.total_tokens || estimateTokens(content);
    const emissions = tokens * 0.0002;

    res.json({ response: content, tokens, emissions, latency });
  } catch (err) {
    console.error(`❌ ${modelKey} error:`, err.message);
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
