<div align="center">

  # ![FinSight AI](https://img.shields.io/badge/FinSight-AI-blue?style=for-the-badge)

  ### Real-Time Portfolio Risk Intelligence Platform

  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

  An AI-powered financial analytics SaaS that detects portfolio risk, predicts market anomalies, and explains decisions in plain language.

  [Features](#-features) &nbsp;•&nbsp; [Quick Start](#-quick-start) &nbsp;•&nbsp; [Architecture](#-architecture) &nbsp;•&nbsp; [API Docs](#-api-endpoints)

</div>

---

## ✨ Features

| Feature | Description |
|:--------|:------------|
| **Portfolio Analyzer** | Input holdings, get real-time risk metrics |
| **Risk Metrics** | VaR, Sharpe ratio, beta, volatility, max drawdown |
| **AI Explainer** | Plain English explanations via Claude API |
| **Anomaly Detection** | Z-score based unusual movement detection |
| **Scenario Simulator** | Test portfolios against market scenarios |
| **Alert System** | Set thresholds, get notified when exceeded |
| **Dashboard** | Real-time charts and metrics visualization |
| **Market Data** | Live data via Yahoo Finance integration |

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **Docker** (optional)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/skdey-00/FinSight.git
cd FinSight

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### Run Locally

```bash
# Terminal 1 - Backend (http://localhost:8000)
cd backend
cp ../.env.example .env
python main.py

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### Docker (Recommended)

```bash
docker-compose up --build
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  Landing • Dashboard • Portfolio • Risk • Alerts            │
│  TailwindCSS • Recharts • Lucide Icons                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌─────────┬─────────┬─────────┬─────────┬──────────────┐    │
│  │Portfolio│  Risk   │   AI    │ Anomaly │  Market      │    │
│  │ Routes  │ Routes  │ Routes  │ Routes  │   Routes     │    │
│  └────┬────┴────┬────┴────┬────┴────┬────┴──────┬───────┘    │
│       │         │         │         │            │            │
│  ┌────▼────┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐  ┌───▼──────┐    │
│  │Portfolio│  Risk   │   AI    │Anomaly │  Market     │    │
│  │ Service │ Engine  │Explainer│Detector│  Data       │    │
│  └─────────┘ └────┬───┘ └────┬───┘ └───┬────┘  └───┬──────┘    │
│                      │         │         │          │         │
└──────────────────────▼─────────▼─────────▼──────────▼────────┘
                       │         │         │          │
        ┌──────────────▼─────────▼─────────▼──────────▼────────┐
        │              DATA & EXTERNAL SERVICES                 │
        │  Yahoo Finance • Anthropic Claude • Railway • Vercel  │
        └───────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

| Category | Method | Endpoint | Description |
|----------|:-------|:---------|:------------|
| **Portfolio** | POST | `/api/portfolio/analyze` | Analyze portfolio holdings |
| | POST | `/api/portfolio/simulate` | Run scenario simulations |
| | GET | `/api/portfolio/correlation/{id}` | Get correlation matrix |
| **Risk** | POST | `/api/risk/calculate` | Calculate all risk metrics |
| | GET | `/api/risk/var/{id}` | Calculate Value at Risk |
| | GET | `/api/risk/heatmap/{id}` | Get risk heatmap |
| **AI** | POST | `/api/explain` | Explain metrics in plain English |
| | POST | `/api/ai/chat` | Chat with AI assistant |
| **Anomalies** | GET | `/api/anomalies/detect` | Detect unusual movements |
| | GET | `/api/anomalies?tickers=AAPL,TSLA` | Quick anomaly check |
| **Market** | GET | `/api/market-data?tickers=AAPL,TSLA` | Fetch market data |
| | GET | `/api/market/overview` | Market indices overview |
| **Alerts** | POST | `/api/alerts/settings` | Save alert settings |
| | GET | `/api/alerts/check` | Check thresholds |

---

## ⚙️ Environment Variables

```bash
# Backend
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_key_here

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **NumPy/SciPy** - Statistical calculations
- **yfinance** - Market data integration
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

---

## 🚀 Deployment

### Railway (Backend)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel
```

---

## 📝 License

MIT License - feel free to use for learning and development.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/skdey-00">skdey-00</a></sub>
</div>
