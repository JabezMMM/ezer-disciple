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
ezer-reflection-tool/
│
├── index.html              # Main HTML structure
├── css/
│   └── style.css           # All UI styles
├── js/
│   └── script.js           # Core logic (questions, chart, slider handling)
└── README.md               # Project documentation

---

## 📱 Tech Stack

- HTML5  
- CSS3 (Flexbox, Media Queries)  
- Vanilla JavaScript (ES6+)  
- Chart.js for radar visualization  

---

## 🚀 Getting Started

1. Clone or download the repository.  
2. Open `index.html` in any modern browser.  
3. Interact with the sliders to assess yourself.  
4. The radar chart updates in real-time based on your responses.  

---

## 🛠 Planned Enhancements

- Save/export responses (localStorage or PDF)  
- Add scoring logic and recommendations  
- Introduce group reflection mode  
- Theming / dark mode toggle  
- Mobile UX refinements  

---

## 🤝 Contributing

Pull requests are welcome if aligned with the vision of spiritual growth and simplicity. Please open an issue first to discuss potential changes.

---

## 🙏 Purpose

This tool is intended to serve as a gentle mirror for personal discipleship, helping individuals reflect on Christlike maturity and areas for growth, grounded in Scripture and community.

---

© 2025 Ezer Disciples. All rights reserved.

to run locally;
@JabezMMM ➜ /workspaces/ezer-disciple (dev) $ pkill -f "server.py\|http.server" || true; cd /workspaces/ezer-disciple && python3 -m http.server 3001

cd /workspaces/ezer-disciple;export PORT=8000;python3 server.py;