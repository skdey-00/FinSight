"""
FinSight AI - Real-Time Portfolio Risk Intelligence Platform
Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from routes import (
    portfolio_routes,
    risk_routes,
    ai_routes,
    anomaly_routes,
    alert_routes,
    market_routes,
    simulation_routes,
    explain_routes
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("FinSight AI starting up...")
    yield
    # Shutdown
    print("FinSight AI shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="FinSight AI",
    description="Real-Time Portfolio Risk Intelligence Platform - AI-powered financial analytics SaaS",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio_routes.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(risk_routes.router, prefix="/api/risk", tags=["Risk Analytics"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["AI Insights"])
app.include_router(anomaly_routes.router, prefix="/api/anomalies", tags=["Anomaly Detection"])
app.include_router(alert_routes.router, prefix="/api/alerts", tags=["Alert System"])
app.include_router(market_routes.router, prefix="/api/market", tags=["Market Data"])
app.include_router(simulation_routes.router, prefix="/api", tags=["Scenario Simulation"])
app.include_router(explain_routes.router, prefix="/api", tags=["AI Explainer"])


@app.get("/")
async def root():
    return {
        "name": "FinSight AI",
        "version": "1.0.0",
        "description": "Real-Time Portfolio Risk Intelligence Platform",
        "endpoints": {
            "docs": "/docs",
            "api": "/api",
            "health": "/health"
        }
    }


@app.get("/api/anomalies")
async def quick_detect_anomalies(
    tickers: str,
    weights: Optional[str] = None,
    lookback_days: int = 60
):
    """
    Quick endpoint for anomaly detection.

    Example: /api/anomalies?tickers=AAPL,TSLA,GOOGL
    """
    from services.anomaly_detector import anomaly_detector

    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]

    portfolio_weights = None
    if weights:
        weight_list = [float(w.strip()) for w in weights.split(",") if w.strip()]
        if len(weight_list) == len(ticker_list):
            portfolio_weights = {ticker: weight_list[i] for i, ticker in enumerate(ticker_list)}

    result = await anomaly_detector.detect_anomalies(
        tickers=ticker_list,
        portfolio_weights=portfolio_weights,
        lookback_days=lookback_days
    )

    return {
        "success": True,
        "data": result
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "FinSight AI Backend",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=True
    )
