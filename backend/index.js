const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

const { GROQ_ENDPOINT, HEADERS, SYSTEM_PROMPT, MODELS } = require("./config");
const { estimateTokens, estimateEmissions } = require("./utils");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json());
app.use("/static", express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.post("/compare/:modelKey", async (req, res) => {
  const modelKey = req.params.modelKey;
  const { prompt } = req.body;

  if (!prompt || !MODELS[modelKey]) {
    return res.status(400).json({ error: "Invalid prompt or model." });
  }

  const payload = {
    model: MODELS[modelKey],
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
  };

  try {
    const start = Date.now();
    const response = await axios.post(GROQ_ENDPOINT, payload, { headers: HEADERS });
    const latency = Date.now() - start;
    const data = response.data;

    if (data.error) {
      return res.json({ error: data.error.message });
    }

    const content = data.choices[0].message.content.trim();
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || estimateTokens(content);
    const emissions = estimateEmissions(totalTokens);

    console.log(`[${modelKey.toUpperCase()}] Prompt: ${promptTokens} | Completion: ${completionTokens} | Total: ${totalTokens}`);

    return res.json({
      response: content,
      tokens: totalTokens,
      emissions,
      latency
    });

  } catch (err) {
    console.error("Model error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
