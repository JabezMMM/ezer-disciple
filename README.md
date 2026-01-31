# Ezer Disciples: Self-Reflection Tool

A web-based self-assessment tool designed to facilitate personal spiritual reflection through a series of questions and a visual radar chart. This tool is part of the Ezer Disciples initiative to encourage growth in biblical virtues and practical obedience.

---

## 🔍 Overview

The tool presents a curated set of reflective questions related to spiritual maturity, allowing users to rate themselves on a scale of 0–5. A real-time radar chart visualizes the user’s self-assessment across key biblical dimensions.

---

## 🎯 Features

- Responsive Radar Chart using Chart.js  
- Dynamic Question Generation from a JSON-like structure  
- Score Descriptions for clarity on each rating  
- Responsive Layout:  
  - Desktop: Chart fixed on the left, scrollable questions on the right  
  - Mobile: Chart fixed on top, scrollable questions below  
- Clean Code Architecture:  
  - Externalized CSS and JavaScript  
  - Semantic HTML structure  

---

## 📂 Project Structure
ezer-text/
│
├── frontend/                         # Firebase Hosting (STATIC ONLY)
│   ├── index.html
│   ├── script.js                     # Calls backend /generate
│   └── style.css
│
├── backend/                          # Flask API (Deploy to Render)
│   ├── app.py                        # Flask entrypoint
│   ├── routes/
│   │   └── generate.py               # /generate endpoint
│   ├── services/
│   │   └── ai_provider.py            # Groq API logic (swappable later)
│   ├── requirements.txt
│   └── Procfile                      # Render startup config
│
├── firebase.json                     # Firebase Hosting config
├── .firebaserc
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