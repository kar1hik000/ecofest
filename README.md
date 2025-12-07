# 🌿 Festival Waste Prediction & Clearance Assistant

AI-powered web application to predict festival waste hotspots, provide eco-friendly suggestions to shopkeepers, and generate action plans for municipalities.

## 🚀 Quick Start

### 1. Set up Google AI Studio API Key

Create a `.env` file in the `backend` folder:
```bash
cd backend
echo GOOGLE_API_KEY=your_api_key_here > .env
```

### 2. Start Backend (Flask)

```bash
cd backend
C:/ProgramData/miniconda3/python.exe app.py
```
Backend runs on: http://localhost:5000

### 3. Start Frontend (React)

```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## 📊 Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview stats, critical hotspots, high-waste shops |
| **Shop Analyzer** | Individual shop waste analysis with AI eco-suggestions |
| **Hotspot Map** | Municipality-level waste predictions with resource planning |
| **AI Suggestions** | Gemini-powered eco-friendly alternatives and marketing messages |

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Vanilla CSS (Glassmorphism)
- **Backend**: Python Flask, Pandas
- **AI**: Google Gemini API (free tier)
- **Data**: 4 CSV datasets (100K+ records)

## 📁 Project Structure

```
├── backend/
│   ├── app.py              # Flask API server
│   ├── data_loader.py      # Dataset loading
│   ├── waste_calculator.py # Waste scoring
│   ├── hotspot_analyzer.py # Municipal analysis
│   └── gemini_suggester.py # AI integration
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Dashboard.jsx
│           ├── ShopAnalyzer.jsx
│           └── HotspotMap.jsx
└── dataset/                # CSV data files
```

## 🎯 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/shops` | List all shops |
| `GET /api/shops/<id>` | Shop waste analysis |
| `GET /api/shops/<id>/suggestions` | AI eco-suggestions |
| `GET /api/hotspots/<festival>` | Festival hotspots |
| `GET /api/dashboard/stats` | Dashboard statistics |

## 🌍 Built for OpenAI Hackathon

Addressing UN SDG 11 (Sustainable Cities) & SDG 12 (Responsible Consumption)
