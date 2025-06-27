# Prompare

**Prompare** is a web-based tool for comparing responses from multiple large language models (LLMs) and estimating their carbon emissions. It enables users to input a prompt, view outputs from various models side by side, and analyze metrics such as token usage, latency, and estimated CO₂ emissions.

## Features

- Compare prompt responses from:
  - LLaMA 3 Instant
  - LLaMA 3 Versatile
  - Gemma 2
- View detailed stats including token count, latency, and emissions
- Export individual model responses to text files
- Local prompt history with one-click re-run
- Light/Dark mode toggle
- Responsive and accessible UI

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express)
- **LLM API**: Groq API
- **Styling**: CSS Variables, Google Fonts
- **Utilities**: Axios, dotenv, CORS

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prompare.git
cd prompare
````

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Add your Groq API key

Create a `.env` file in the `backend/` directory:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the server

```bash
node index.js
```

The app will be available at `http://localhost:3000`.

## Folder Structure

```
prompare/
├── backend/
│   ├── index.js
│   ├── config.js
│   ├── utils.js
│   ├── .env
│   └── .gitignore
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
```
