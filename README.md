# 🛕 Sancharam AI — Smart Travel & Safety Guide for Tamil Nadu
> **Empowering solo travelers, tourists, and locals with real-time safety analytics, AI trip itineraries, voice guidance, and cryptographically verified community tips.**

---

## 📌 Overview

**Sancharam AI** is an intelligent, data-driven travel companion designed specifically for exploring Tamil Nadu. Combining real-time police crime statistics, road safety blackspots, AI itinerary planning, and Tamil/English voice interaction, Sancharam provides personalized trip recommendations while keeping safety at the forefront. Whether navigating night transit in Chennai, discovering hidden heritage spots in Thanjavur, or seeking emergency assistance, Sancharam AI equips travelers with actionable insights for a seamless journey.

---

## ✨ Features

- 🛡️ **Safety Map & Risk Score Engine**: Maps police crime zones and accident blackspots with real-time hour-of-day risk calculations (0–100 score).
- 🛣️ **Route Safety Corridor Analyzer**: Geocodes origins and destinations, fetches OSRM driving geometry, interpolates 8 waypoints, and calculates an overall route safety score.
- 🚨 **Guardian Shield & Emergency SOS**: Features a live GPS watcher, dynamic SVG risk score ring, 1-tap police dispatch (`tel:100`), and WhatsApp live location sharing.
- 🗓️ **AI Itinerary Planner & Festival Guide**: Generates personalized trip schedules based on budget, travel style, and special interests while detecting overlapping Tamil Nadu festival dates.
- 🌿 **Uncharted Places & Hidden Gems**: Interactive Leaflet map and category filter displaying 20 lesser-known heritage spots, waterfalls, and villages with insider tips.
- 🔗 **Travel Tribes & Hash-Chain Verification**: Community tip sharing platform backed by a cryptographic SHA-256 hash-chain to verify tip integrity.
- 🗣️ **Multilingual Tamil Voice AI Chatbot**: Interactive AI travel guide supporting Web Speech API voice input (`ta-IN` & `en-IN`), Tamil place name recognition, and text-to-speech audio.
- 💸 **Travel Budget & Expense Tracker**: Multi-currency converter, expense logger with local storage persistence, category share breakdown, and gamified achievement badges.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Zustand, React Router v7, Leaflet / React-Leaflet, Vanilla CSS Design System
- **Backend**: Python, Flask, Flask-SQLAlchemy (SQLite), Flask-CORS, Flask-SocketIO, Pandas, Requests
- **APIs & Data Services**: OpenAI API, OpenStreetMap Nominatim Geocoding, OSRM Routing Engine, Firebase / Web Speech API

---

## 📁 Project Structure

```text
Sancharam_AI/
├── backend/
│   ├── app.py                      # Flask REST API, SQLite models, route analyzer & chat endpoints
│   ├── sancharam.db                # SQLite database storing Hash-Chain community tips
│   └── data/
│       ├── chennai_police_crime_zones_2023.csv     # Police crime zone dataset
│       └── tnsta_accident_blackspots_2023.csv      # Road safety accident blackspots dataset
├── public/
│   ├── assets/                     # Images, icons, and static assets
│   └── data/
│       ├── hidden_gems.json        # 20 lesser-known Tamil Nadu hidden spots
│       └── festivals.json          # 15 major Tamil Nadu cultural festivals
├── src/
│   ├── components/
│   │   ├── CurrencyWidget.jsx      # Multi-currency FX converter component
│   │   ├── TamilChatbot.jsx        # Multilingual Voice & SpeechSynthesis AI Assistant
│   │   └── RouteAnalyzerModal.jsx  # Interactive OSRM route safety analyzer
│   ├── pages/
│   │   ├── Home.jsx                # Landing page & feature showcase
│   │   ├── Features.jsx            # Core modules sitemap
│   │   ├── SafetyPage.jsx          # Interactive Leaflet safety map & risk statistics
│   │   ├── ItineraryPage.jsx       # AI trip planner & festival dates matcher
│   │   ├── UnchartedPage.jsx       # Hidden gems map & category filter grid
│   │   ├── GuardianPage.jsx        # Guardian Shield GPS tracker & Emergency SOS
│   │   ├── TribesPage.jsx          # Travel Tribes community tips & SHA-256 verifier
│   │   └── BudgetTrackerPage.jsx   # Expense tracker, daily budget metrics & travel badges
│   ├── services/
│   │   └── api.js                  # Axios/Fetch API client functions
│   ├── store/
│   │   └── useAppStore.js          # Global Zustand state manager
│   ├── App.jsx                     # React Router v7 routes
│   ├── index.css                   # Global CSS styling system & tokens
│   └── main.jsx                    # React entry point
└── package.json
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to run Sancharam AI locally on your system.

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.9 or higher) & **pip**

### 1. Clone the Repository
```bash
git clone https://github.com/jeyaprasad/Sancharam_AI.git
cd Sancharam_AI
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Set Environment Variables (Optional for OpenAI)
Create an environment variable for the OpenAI API key if you wish to use live GPT completions for the chatbot:
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your_openai_api_key_here"

# Linux / macOS
export OPENAI_API_KEY="your_openai_api_key_here"
```
*(Note: If `OPENAI_API_KEY` is omitted, Sancharam AI automatically uses its built-in intelligent domain travel engine fallback.)*

### 5. Start the Flask Backend Server
```bash
# Running inside backend/ directory
python app.py
```
The Flask backend will launch at `http://localhost:5000`.

### 6. Start the React Frontend Application
Open a second terminal window in the root directory:
```bash
npm run dev
```
The React Vite development server will launch at `http://localhost:5173`.

---

## 📊 Datasets & Data-Driven Architecture

Sancharam AI is built on authoritative, real-world datasets to ensure its safety scoring and recommendations are empirically grounded. Safety calculations ingest the **2023 Chennai Police Crime Zone Audit (`chennai_police_crime_zones_2023.csv`)** and the **TNSTA Road Safety Blackspots Audit (`tnsta_accident_blackspots_2023.csv`)**, mapping localized crime density, night risk factors, and traffic collision frequencies. By pairing empirical police records with spatial Haversine distance equations, OSRM road geometry, and temporal hour-of-day multipliers, Sancharam AI provides actionable, objective safety guidance for travelers across Tamil Nadu.

---

<p center="true">
  <b>© 2026 Sancharam AI · Built for the city that never sits still 🛕</b>
</p>
