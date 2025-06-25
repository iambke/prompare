const form = document.getElementById("prompt-form");
const input = document.getElementById("prompt-input");
const modelKeys = ["instant", "versatile", "gemma"];
const historyList = document.getElementById("history-list");

let history = JSON.parse(localStorage.getItem("prompare-history") || "[]");
renderHistory();

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) return;

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Comparing...";

  modelKeys.forEach((key) => {
    document.getElementById(`${key}-response`).textContent = "Loading...";
    document.getElementById(`${key}-stats`).textContent = "";
    document.getElementById(`${key}-card`).classList.remove("error");
  });

  try {
    const results = await Promise.all(
      modelKeys.map((key) => fetchModel(prompt, key))
    );

    modelKeys.forEach((key, i) => {
      updateCard(key, results[i]);
    });

    addToHistory(prompt);
    document.querySelector(".results").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Server error:", err);
    modelKeys.forEach((key) => {
      document.getElementById(`${key}-response`).textContent = "Error contacting server.";
      document.getElementById(`${key}-card`).classList.add("error");
    });
  } finally {
    button.disabled = false;
    button.textContent = "Compare";
  }
});

async function fetchModel(prompt, modelKey) {
  const res = await fetch(`http://localhost:3000/compare/${modelKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data;
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).length * 1.33); // same estimate as backend
}

function updateCard(key, result) {
  const responseEl = document.getElementById(`${key}-response`);
  const statsEl = document.getElementById(`${key}-stats`);
  const cardEl = document.getElementById(`${key}-card`);

  if (!result || result.error || typeof result.response !== "string") {
    responseEl.textContent = result?.error || "Error generating response.";
    cardEl.classList.add("error");
    statsEl.textContent = "";
    return;
  }

  responseEl.innerHTML = result.response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  statsEl.textContent = `${result.tokens} tokens • ${result.emissions.toFixed(4)} g CO₂ • ${result.latency || "N/A"}ms`;
}

document.querySelectorAll(".export-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.model;
    const response = document.getElementById(`${key}-response`).textContent;
    const stats = document.getElementById(`${key}-stats`).textContent;
    const blob = new Blob([`${response}\n\n${stats}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${key}-response.txt`;
    a.click();
  });
});

function addToHistory(prompt) {
  history.unshift(prompt);
  if (history.length > 10) history.pop();
  localStorage.setItem("prompare-history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    li.addEventListener("click", () => {
      input.value = p;
      form.dispatchEvent(new Event("submit"));
    });
    historyList.appendChild(li);
  });
}
