# FinSight AI - Project Documentation

> Real-Time Portfolio Risk Intelligence Platform
> Author: skdey-00
> Tech Stack: React, Vite, FastAPI, Python, yfinance, Groq AI

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [How It Works](#how-it-works)
5. [API Endpoints](#api-endpoints)
6. [File Structure](#file-structure)
7. [Recent Fixes & Improvements](#recent-fixes--improvements)
8. [Known Limitations](#known-limitations)
9. [Future Enhancements](#future-enhancements)

---

## Project Overview

**FinSight AI** is a comprehensive portfolio risk intelligence platform that provides real-time market data, AI-powered insights, and sophisticated risk analysis tools for investors.

### Key Capabilities
- Real-time stock price updates (every 2 minutes)
- Comprehensive risk metrics (VaR, Sharpe Ratio, Beta, Volatility, Max Drawdown)
- AI-powered explanations using Groq AI (Llama 3)
- Stock autocomplete with company name verification
- Interactive charts and visualizations
- Market anomaly detection
- Scenario simulation for stress testing
- Alert system for risk thresholds

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Portfolio Builder** | Add stock/crypto holdings with shares and buy price. Auto-calculates current value, gains/losses, and portfolio allocation. |
| **Live Pricing** | Real-time stock prices from Yahoo Finance with automatic refresh every 2 minutes |
| **Stock Autocomplete** | Search-as-you-type with 60+ popular stocks. Displays full company names for verification |
| **Risk Analysis** | Calculate VaR (95%/99%), Sharpe Ratio, Beta vs S&P 500, Volatility, Max Drawdown, Correlation Matrix |
| **AI Explanations** | Get plain English explanations of complex financial metrics |
| **AI Chat Assistant** | Chat interface for asking portfolio questions |
| **Scenario Simulator** | Test portfolio against market scenarios: crash, rate hike, bull market, bear market |
| **Anomaly Detection** | Z-score based detection of unusual price movements |
| **Alert System** | Configure risk thresholds and get notified when breached |
| **Interactive Charts** | Line charts, bar charts, pie charts, risk heatmaps |

### User Interface

- **Dashboard** - Overview of market indices, portfolio metrics, AI insights, performance charts
- **Portfolio Analyzer** - Input holdings with live price updates
- **Risk Analysis** - Comprehensive risk metrics with explanations
- **Anomaly Detection** - View and manage detected anomalies
- **Scenario Simulator** - Run stress tests on your portfolio
- **Alerts** - Configure risk thresholds and view alert history

---

## Architecture

### System Architecture Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   React Frontend │ ◄──► │  FastAPI      │ ◄──► │ Yahoo Finance│
│   (Vite + Tailwind)│     │  Backend      │     │   (yfinance) │
└─────────────────┘     └──────┬───────┘     └─────────────┘
                              │
                       ┌──────▼────────┐
                       │   Groq AI API   │
                       │  (Llama 3)      │
                       └─────────────────┘
```

### Backend (FastAPI)

**Entry Point:** `main.py`

**Routes:**
- `/api/portfolio` - Portfolio analysis and simulation
- `/api/risk` - Risk calculations (VaR, Sharpe, Beta, etc.)
- `/api/market` - Market data, stock search, prices
- `/api/ai` - AI chat and insights
- `/api/anomalies` - Anomaly detection
- `/api/alerts` - Alert management
- `/api` - Scenario simulation and AI explanations

**Services:**
- `risk_engine.py` - Core risk calculation algorithms
- `market_data.py` - Yahoo Finance wrapper
- `ai_explainer.py` - Groq AI integration
- `anomaly_detector.py` - Z-score anomaly detection
- `scenario_simulator.py` - Stress testing scenarios

### Frontend (React + Vite)

**Styling:** TailwindCSS with custom dark theme

**Key Libraries:**
- `axios` - HTTP client
- `lucide-react` - Icons
- `recharts` - Charts

**Structure:**
- `pages/` - Main application pages
- `components/` - Reusable UI components
- `contexts/` - React Context for state management
- `services/api.js` - Centralized API calls

---

## How It Works

### 1. Portfolio Building & Live Pricing

```
User enters stock → Autocomplete searches → User selects stock
                      ↓
              Company name verified
                      ↓
              Live price fetched (Yahoo Finance)
                      ↓
              Portfolio value calculated in real-time
                      ↓
              Updates every 2 minutes automatically
```

**File:** `frontend/src/components/PortfolioInput.jsx`

The `useLivePrices` hook:
1. Fetches prices for all tickers on mount
2. Sets up interval for updates every 2 minutes (120000ms)
3. Stores prices in state for immediate use
4. Shows "Live" indicator with green pulse
5. Handles errors gracefully with fallback data

### 2. Risk Calculation

```
Portfolio weights ← Calculate ← Fetch historical ← Yahoo Finance
                      ↓
                   VaR: Historical simulation (95%, 99%)
                   Sharpe: (Return - RiskFree) / Volatility
                   Beta: Covariance(portfolio, market) / Variance(market)
                   Volatility: StdDev of returns × √252
                   Max Drawdown: Max peak-to-trough decline
                   Correlation Matrix: Asset correlation coefficients
```

**File:** `backend/services/risk_engine.py`

**Caching:** Prices cached for 5 minutes to avoid rate limiting

### 3. AI Explanations

```
Risk metrics → Formatted prompt → Groq AI (Llama 3) → Structured response
```

**File:** `backend/services/ai_explainer.py`

**Prompt Structure:**
```
## RISK PROFILE EXPLANATION
[3 paragraphs explaining risk in plain English]

## BIGGEST RISK FACTOR
[single biggest risk]

## RECOMMENDATIONS
1. [First recommendation]
2. [Second recommendation]
```

### 4. Stock Autocomplete

```
User types → Search local database (60+ stocks) → Show results
           ↓
    If not found → Search backend via Yahoo Finance → Update results
           ↓
    User selects → Update input → Fetch company name → Display
```

**File:** `frontend/src/components/StockAutocomplete.jsx`

**Optimizations:**
- Debounced search (200ms delay)
- Memoized functions to prevent re-renders
- Cleanup on unmount to prevent memory leaks

---

## API Endpoints

### Portfolio Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/portfolio/analyze` | Analyze portfolio holdings |
| POST | `/api/portfolio/simulate` | Run scenario simulations |
| GET | `/api/portfolio/correlation/{id}` | Get correlation matrix |
| GET | `/api/portfolio/allocation/{id}` | Get portfolio allocation |
| GET | `/api/portfolio/returns/{id}` | Get returns distribution |

### Risk Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/risk/calculate` | Calculate all risk metrics (VaR, Sharpe, Beta, etc.) |
| POST | `/api/risk/risk-contribution` | Calculate risk contribution per asset |
| GET | `/api/risk/metrics/{id}` | Get comprehensive risk metrics |
| GET | `/api/risk/var/{id}` | Calculate Value at Risk |
| GET | `/api/risk/sharpe/{id}` | Calculate Sharpe ratio |
| GET | `/api/risk/beta/{id}` | Calculate beta vs benchmark |
| GET | `/api/risk/volatility/{id}` | Calculate volatility |
| GET | `/api/risk/heatmap/{id}` | Generate risk heatmap data |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/explain` | Explain risk metrics in plain English |
| POST | `/api/ai/chat` | Chat with AI assistant |
| GET | `/api/ai/insights/{id}` | Get AI-generated insights |
| GET | `/api/ai/recommendations/{id}` | Get portfolio recommendations |

### Market Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/prices` | Get current prices for tickers (lightweight) |
| GET | `/api/market/search?q={query}` | Search for stocks by symbol/name |
| GET | `/api/market/company-info?ticker={symbol}` | Get company name, sector, exchange |
| GET | `/api/market-data` | Get full market data (historical, volatility) |
| GET | `/api/market/overview` | Market indices overview (S&P 500, etc.) |

### Anomaly Detection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/anomalies/detect/{id}?lookback_days={n}` | Detect anomalies in portfolio |
| GET | `/api/anomalies/concentration/{id}` | Check concentration risk |
| GET | `/api/anomalies/market-events?days={n}` | Get recent market events |
| POST | `/api/anomalies/watchlist` | Add ticker to watchlist |

---

## File Structure

```
FinSight-AI/
│
├── backend/                           # FastAPI Python Backend
│   ├── main.py                        # Application entry point, CORS, routes
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                           # Environment variables (GROQ_API_KEY)
│   │
│   ├── routes/                        # API Route Definitions
│   │   ├── __init__.py
│   │   ├── ai_routes.py               # AI chat & explanations
│   │   ├── alert_routes.py            # Alert management
│   │   ├── anomaly_routes.py         # Anomaly detection
│   │   ├── explain_routes.py          # AI risk explainer
│   │   ├── market_routes.py           # Market data, search, company info
│   │   ├── portfolio_routes.py       # Portfolio analysis
│   │   ├── risk_routes.py            # Risk calculations (with caching)
│   │   └── simulation_routes.py      # Scenario simulation
│   │
│   └── services/                      # Business Logic
│       ├── __init__.py
│       ├── ai_explainer.py           # Groq AI integration
│       ├── ai_service.py             # AI service with fallbacks
│       ├── alert_service.py          # Alert management
│       ├── anomaly_detector.py      # Z-score anomaly detection
│       ├── market_data.py            # Yahoo Finance wrapper
│       ├── market_service.py         # Market data service
│       ├── portfolio_service.py     # Portfolio analysis logic
│       ├── risk_engine.py            # Core risk calculations
│       ├── risk_service.py           # Risk service
│       └── scenario_simulator.py    # Stress test scenarios
│
└── frontend/                          # React + Vite Frontend
    ├── index.html                     # HTML entry point
    ├── package.json                    # NPM dependencies
    ├── vite.config.js                 # Vite build config
    ├── tailwind.config.js              # TailwindCSS config
    │
    └── src/
        ├── main.jsx                     # React entry point
        ├── index.css                    # Global styles
        ├── App.jsx                      # Router + page routes
        │
        ├── pages/                       # Main Application Pages
        │   ├── LandingPage.jsx           # Landing page with hero section
        │   ├── Login.jsx                  # Login page (mock auth)
        │   ├── Dashboard.jsx             # Main dashboard
        │   ├── PortfolioAnalyzer.jsx    # Portfolio builder
        │   ├── RiskAnalysis.jsx          # Risk metrics display
        │   ├── AnomalyDetection.jsx     # Anomaly detection view
        │   ├── ScenarioSimulator.jsx    # Scenario testing
        │   └── Alerts.jsx                # Alert settings
        │
        ├── components/                  # Reusable Components
        │   ├── Layout.jsx                 # Main layout wrapper
        │   ├── AIChat.jsx                # AI chat interface
        │   ├── AIInsights.jsx            # AI risk explanations
        │   ├── AlertBanner.jsx           # Alert notifications
        │   ├── AlertSettings.jsx         # Alert configuration UI
        │   ├── MetricCard.jsx            # Metric display cards
        │   ├── PieChart.jsx             # Portfolio allocation pie chart
        │   ├── BarChart.jsx              # Returns distribution bar chart
        │   ├── LineChart.jsx             # Performance line chart
        │   ├── Heatmap.jsx               # Risk heatmap visualization
        │   ├── RiskBadge.jsx             # Risk level badge
        │   ├── PortfolioInput.jsx       # Portfolio builder (main feature)
        │   ├── StockAutocomplete.jsx     # Stock search with company names
        │   ├── Tooltip.jsx               # Educational tooltips for metrics
        │   ├── ScenarioSimulator.jsx     # Scenario testing interface
        │   └── HelpGuide.jsx             # Help documentation
        │
        ├── contexts/                    # React Context
        │   └── AuthContext.jsx            # Authentication context (mock)
        │
        └── services/
            └── api.js                    # Centralized API calls (axios)
```

---

## Recent Fixes & Improvements

### Fixed Issues

1. **Template Literal Bug** (`AIInsights.jsx:165`)
   - **Issue:** Single quotes instead of backticks prevented API URL interpolation
   - **Fix:** Changed to backticks for proper template literal

2. **Environment Variables Not Loading** (`main.py`)
   - **Issue:** Backend didn't load `.env` file, GROQ_API_KEY was undefined
   - **Fix:** Added `from dotenv import load_dotenv` and `load_dotenv()`

3. **yfinance Outdated**
   - **Issue:** Version 0.2.36 couldn't fetch data from Yahoo Finance
   - **Fix:** Upgraded to v1.3.0

4. **Diversity Count Duplication** (`PortfolioInput.jsx`)
   - **Issue:** Displayed "3 3 stocks" instead of "3 stocks"
   - **Fix:** Simplified conditional logic

5. **StockAutocomplete Glitching**
   - **Issue:** Component caused re-render loops
   - **Fix:** Added `useCallback`, `useMemo`, proper cleanup with `isMountedRef`

6. **Company Names Not Showing**
   - **Issue:** Company names disappeared after UI changes
   - **Fix:** Fixed state synchronization between props and internal state

7. **Yahoo Finance Rate Limiting**
   - **Issue:** API blocking requests (429 errors)
   - **Fix:**
     - Added 5-minute caching for price data
     - Implemented simulated risk metrics as fallback
     - Better error messages for rate limits
     - Reduced update frequency from 30s to 2 minutes

8. **Analyze Portfolio Failing**
   - **Issue:** Risk calculation failed due to rate limiting
   - **Fix:** Added fallback to simulated data when API is rate-limited

### Performance Optimizations

1. **Debounced Search** - Stock search waits 200ms before API call
2. **Memoized Dropdown Position** - Calculated only on focus, not every render
3. **Proper React Keys** - Using `stock.symbol` instead of array index
4. **Cleanup on Unmount** - Prevents memory leaks

---

## Known Limitations

### Technical Limitations

1. **Yahoo Finance Rate Limiting**
   - Free API has request limits
   - Currently: 5-minute cache on price data
   - Fallback: Simulated risk metrics when rate limited

2. **No Data Persistence**
   - Portfolios reset on page refresh
   - No database for storing user portfolios
   - User settings not saved between sessions

3. **Mock Authentication**
   - Login doesn't actually authenticate
   - No real user accounts
   - No password encryption/validation

4. **Sample Data in Charts**
   - Some dashboard charts show hardcoded data
   - Should pull from actual portfolio

### API Limitations

1. **yfinance**
   - Rate limited (especially with multiple tickers)
   - Sometimes delayed data
   - No cryptocurrency support in some regions

2. **Groq AI**
   - Free tier has rate limits
   - Service can be slow at times

---

## Future Enhancements

### Phase 1 - Data Persistence (High Priority)

| Feature | Description | Priority |
|---------|-------------|----------|
| **PostgreSQL Database** | Store user portfolios, settings, history | High |
| **User Authentication** | Real login via Clerk/Auth0 | High |
| **Portfolio Save/Load** | Save and retrieve saved portfolios | High |
| **Settings Persistence** | Remember alert thresholds, preferences | High |

### Phase 2 - Enhanced Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **WebSocket Updates** | Real-time price push instead of polling | Medium |
| **Email Notifications** | Send alerts via email when thresholds breached | Medium |
| **Backtesting Engine** | Test historical portfolio performance | Medium |
| **Portfolio Comparison** | Compare multiple portfolios side-by-side | Medium |
| **Export to CSV/PDF** | Download portfolio reports | Medium |

### Phase 3 - Advanced Analytics

| Feature | Description | Priority |
|---------|-------------|----------|
| **Portfolio Optimization** | AI suggests optimal allocations | Low |
| **Tax Implications** | Calculate capital gains, dividend tax | Low |
| **Goal Tracking** | Set savings/income goals, track progress | Low |
| **Multi-Currency Support** | International markets, currency conversion | Low |
| **News Integration** | Stock news feed per holding | Low |
| **Social Features** | Share portfolios, follow other users | Low |
| **ETF/Mutual Fund Support** | More asset types | Low |

---

## Risk Metrics Explained

### Value at Risk (VaR)
- **What it is:** Maximum potential loss with 95% confidence
- **Example:** "2% daily VaR" means there's a 5% chance of losing >2% in a day
- **Used for:** Setting worst-case expectations

### Sharpe Ratio
- **What it is:** Risk-adjusted return measure (Return - RiskFree) / Volatility
- **Scale:** Above 1 = Good, Above 2 = Excellent
- **Used for:** Comparing portfolio efficiency

### Beta
- **What it is:** Sensitivity to market movements
- **Scale:** 1.0 = matches market, >1 = more volatile, <1 = less volatile
- **Used for:** Understanding market risk exposure

### Volatility
- **What it is:** Standard deviation of returns (annualized)
- **Scale:** 15-20% = typical for stocks
- **Used for:** Understanding price fluctuation

### Max Drawdown
- **What it is:** Largest peak-to-valley decline
- **Used for:** Understanding worst historical loss

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP:** Axios

### Backend
- **Framework:** FastAPI
- **Python:** 3.11
- **Data:** yfinance (Yahoo Finance)
- **AI:** Groq API (Llama 3 70B)
- **Calculations:** NumPy, SciPy

---

## Deployment

### Current Setup
- **Frontend:** Vercel (ready for deployment)
- **Backend:** Railway (Docker support)
- **Environment Variables Required:**
  - `GROQ_API_KEY` - For AI explanations

### Environment Variables (.env)
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BACKEND_PORT=8000
BACKEND_HOST=localhost
FRONTEND_URL=http://localhost:5173
```

---

## Summary

FinSight AI is a comprehensive portfolio risk intelligence platform that combines real-time market data, sophisticated risk calculations, and AI-powered explanations. The application is well-architected with separate frontend and backend, proper API design, and thoughtful user experience.

The project successfully demonstrates:
- Live data integration with Yahoo Finance
- Financial risk calculations (VaR, Sharpe, Beta, Volatility, Drawdown)
- AI-powered explanations via Groq AI
- Interactive data visualizations
- Clean, modern UI with TailwindCSS

Current limitations (no persistence, mock auth, rate limits) are appropriate for a prototype/MVP and can be addressed in future iterations as the product scales.

---

**Project Status:** Active Development
**Last Updated:** May 2, 2026
**Version:** 1.0.0
