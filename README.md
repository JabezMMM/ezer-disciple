# Ezer Text: Text Helper

A scripture-based AI assistant designed to provide biblical guidance and comfort. This tool uses Retrieval-Augmented Generation (RAG) to ensure responses are grounded in a curated database of scripture, leveraging the speed and intelligence of Groq's Llama 3.1 model.

---

## 🔍 Overview

Ezer Text acts as a digital companion for spiritual reflection. By analyzing user queries and matching them with relevant biblical verses, it provides concise, scripture-only responses to help users find peace, wisdom, and encouragement in their daily lives.

---

## 🎯 Features

- **Scripture-Grounded Responses**: Uses RAG to ensure every answer is cited and based on a curated knowledge base.
- **Privacy-First**: Simple, clean interface with no tracking or complex data collection.
- **Blazing Fast**: Powered by Groq Llama 3.1-8b-instant for near-instant responses.
- **Firebase Native**: Fully integrated with Firebase Hosting and Cloud Functions for a seamless, serverless experience.
- **Biblical Context**: Specifically tuned to replace common terms with original context (e.g., YHWH) for deeper study.

---

## 📂 Project Structure
ezer-text/
│
├── frontend/                         # Firebase Hosting (STATIC ONLY)
│   ├── index.html
│   ├── script.js                     # Calls backend /generate
│   └── style.css
│
├── functions/                    # Firebase Cloud Functions (Python backend)
│   ├── main.py                   # Entry point for HTTPS function
│   ├── requirements.txt          # Python dependencies
│   ├── services/
│   │   └── ai_service.py         # Handles calls to LLM provider (Groq etc.)
│   └── utils/
│       └── prompt_builder.py     # Builds scripture-only prompt safely
│
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase hosting + functions config
├── .firebaserc                   # Firebase project alias
├── .gitignore
└── README.md

---

## 📱 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js (Hosted on Firebase)
- **Backend**: Python, Flask, Requests (Hosted on Render/Railway)
- **Integration**: Proxy to Hugging Face Spaces for AI generation

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip
- Firebase CLI (`npm install -g firebase-tools`)

### local Development

1. **Backend**:
   ```bash
   pip3 install -r backend/requirements.txt
   python3 backend/server.py
   ```
2. **Frontend**:
   Open `frontend/index.html` in your browser.

---

## ☁️ Deployment

### Firebase Hosting (Frontend)
Target Project: `ezer-text` (via `eliyezer-site`)

1. Login to Firebase:
   ```bash
   firebase login
   ```
2. Deploy the `frontend/` folder:
   ```bash
   firebase use --add eliyezer-site  # Alias as ezer-text if configured in .firebaserc
   firebase deploy --only hosting
   ```

### Backend Deployment
Deploy the `backend/` folder to a Python-compatible host (Render, Railway, Heroku). Update `frontend/script.js` with the production URL.

---

## ✅ Todo / Roadmap

- [x] **CI/CD Pipeline**: Add conditional logic to deploy only the `frontend/` folder to Firebase on merge.
- [ ] **Backend Hosting**: Finalize backend deployment strategy.
- [ ] **E2E Tests**: Update tests for separated architecture.