"""
Anomaly Detection Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict
from pydantic import BaseModel
from services.anomaly_service import AnomalyService
from services.anomaly_detector import anomaly_detector

router = APIRouter()
anomaly_service = AnomalyService()


@router.get("/detect")
async def detect_anomalies(
    tickers: str = Query(..., description="Comma-separated list of stock tickers (e.g., AAPL,TSLA,GOOGL)"),
    weights: Optional[str] = Query(None, description="Optional comma-separated weights (e.g., 40,30,30)"),
    lookback_days: int = Query(60, description="Days to look back for anomaly detection")
):
    """
    Detect anomalies using Z-score analysis on 60-day price history.

    Flags:
    - Returns beyond 2 standard deviations (Z-score > 2)
    - Volume spikes (> 2.5 std devs)
    - Price gaps (> 2 std devs)
    - Concentration risk (>50% in single ticker)

    Example: /api/anomalies/detect?tickers=AAPL,TSLA,GOOGL&weights=40,30,30

    Response includes plain-English descriptions for each anomaly.
    """
    try:
        # Parse tickers
        ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]

        if not ticker_list:
            raise HTTPException(status_code=400, detail="At least one ticker is required")

        # Parse weights if provided
        portfolio_weights = None
        if weights:
            weight_list = [float(w.strip()) for w in weights.split(",") if w.strip()]
            if len(weight_list) == len(ticker_list):
                portfolio_weights = {ticker: weight_list[i] for i, ticker in enumerate(ticker_list)}

        # Detect anomalies
        result = await anomaly_detector.detect_anomalies(
            tickers=ticker_list,
            portfolio_weights=portfolio_weights,
            lookback_days=lookback_days
        )

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")


@router.get("/summary")
async def get_anomaly_summary(
    tickers: str = Query(..., description="Comma-separated list of stock tickers"),
    weights: Optional[str] = Query(None, description="Optional comma-separated weights")
):
    """
    Get a quick summary of anomalies for a portfolio.

    Returns counts by severity and whether attention is needed.

    Example: /api/anomalies/summary?tickers=AAPL,TSLA
    """
    try:
        ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]

        portfolio_weights = None
        if weights:
            weight_list = [float(w.strip()) for w in weights.split(",") if w.strip()]
            if len(weight_list) == len(ticker_list):
                portfolio_weights = {ticker: weight_list[i] for i, ticker in enumerate(ticker_list)}

        result = await anomaly_detector.get_anomaly_summary(
            tickers=ticker_list,
            portfolio_weights=portfolio_weights
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")


@router.get("/detect/{portfolio_id}")
async def detect_anomalies(
    portfolio_id: str,
    lookback_days: int = Query(30, description="Days to look back")
):
    """
    Detect anomalies in portfolio and market data
    """
    try:
        anomalies = await anomaly_service.detect_anomalies(portfolio_id, lookback_days)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "lookback_days": lookback_days,
            "anomalies": anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/concentration/{portfolio_id}")
async def check_concentration_risk(portfolio_id: str):
    """
    Check for concentration risk in the portfolio
    """
    try:
        concentration = await anomaly_service.check_concentration_risk(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "concentration_risk": concentration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market-events")
async def get_recent_market_events(
    days: int = Query(7, description="Days to look back")
):
    """
    Get recent unusual market events
    """
    try:
        events = await anomaly_service.get_market_events(days)
        return {
            "success": True,
            "days": days,
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/watchlist")
async def add_to_watchlist(portfolio_id: str, symbols: list[str]):
    """
    Add symbols to anomaly detection watchlist
    """
    try:
        result = await anomaly_service.add_to_watchlist(portfolio_id, symbols)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "watchlist": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/drift/{portfolio_id}")
async def detect_drift(portfolio_id: str):
    """
    Detect portfolio drift from target allocation
    """
    try:
        drift = await anomaly_service.detect_drift(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "drift": drift
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
