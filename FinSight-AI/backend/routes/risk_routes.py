"""
Risk Analytics Routes
"""
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from typing import Dict, Optional
from services.risk_service import RiskService
from services.risk_engine import risk_engine
import time

router = APIRouter()
risk_service = RiskService()

# Simple cache for price data to avoid repeated yfinance calls
_price_cache = {}
_cache_timestamps = {}
CACHE_DURATION = 300  # 5 minutes


class PortfolioRiskRequest(BaseModel):
    """
    Request model for portfolio risk calculation.

    Example:
    {
        "weights": {"AAPL": 0.4, "TSLA": 0.3, "GOOGL": 0.3},
        "benchmark": "SPY",
        "period": "1y"
    }
    """
    weights: Dict[str, float]  # Ticker -> weight (e.g., 0.4 for 40%)
    benchmark: Optional[str] = "SPY"
    period: Optional[str] = "1y"


@router.post("/calculate")
async def calculate_portfolio_risk(request: PortfolioRiskRequest):
    """
    Calculate comprehensive portfolio risk metrics using the Risk Engine.

    Requires price data to be fetched first via market data endpoint.

    Metrics calculated:
    - Value at Risk (VaR) at 95% and 99% confidence
    - Sharpe Ratio (2% risk-free rate assumed)
    - Portfolio Beta vs benchmark
    - Maximum Drawdown
    - Correlation Matrix

    Example:
        POST /api/risk/calculate
        {
            "weights": {"AAPL": 0.4, "TSLA": 0.3, "GOOGL": 0.3},
            "benchmark": "SPY",
            "period": "1y"
        }
    """
    try:
        # Import yfinance to fetch price data
        import yfinance as yf

        tickers = list(request.weights.keys())

        # Fetch historical price data for all tickers with caching
        price_data = {}
        for ticker in tickers:
            cache_key = f"{ticker}_{request.period}"
            current_time = time.time()

            # Check cache first
            if cache_key in _price_cache:
                cache_time = _cache_timestamps.get(cache_key, 0)
                if current_time - cache_time < CACHE_DURATION:
                    price_data[ticker] = _price_cache[cache_key]
                    continue

            # Fetch new data
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period=request.period)
                if not hist.empty:
                    price_data[ticker] = hist
                    # Cache the result
                    _price_cache[cache_key] = hist
                    _cache_timestamps[cache_key] = current_time
                else:
                    raise ValueError(f"No data returned for {ticker}")
            except Exception as e:
                error_msg = str(e).lower()
                if "rate" in error_msg or "too many requests" in error_msg:
                    raise HTTPException(
                        status_code=429,
                        detail="Yahoo Finance is rate limiting requests. Please wait a few minutes before analyzing again. This is a limitation of the free Yahoo Finance API."
                    )
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not fetch data for {ticker}: {str(e)}"
                )

        # Fetch benchmark data if provided
        benchmark_data = None
        if request.benchmark:
            try:
                benchmark = yf.Ticker(request.benchmark)
                benchmark_data = benchmark.history(period=request.period)
            except Exception as e:
                # Continue without benchmark if fetch fails
                pass

        # Calculate all risk metrics
        result = risk_engine.calculate_portfolio_risk(
            portfolio_weights=request.weights,
            price_data=price_data,
            benchmark_data=benchmark_data
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation error: {str(e)}")


@router.post("/risk-contribution")
async def calculate_risk_contribution(request: PortfolioRiskRequest):
    """
    Calculate risk contribution of each asset to the portfolio.

    Returns:
    - Marginal VaR contribution
    - Component VaR
    - Percentage contribution to total portfolio risk
    """
    try:
        import yfinance as yf

        tickers = list(request.weights.keys())

        # Fetch historical price data
        price_data = {}
        for ticker in tickers:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=request.period)
            if not hist.empty:
                price_data[ticker] = hist
            else:
                raise HTTPException(status_code=400, detail=f"No data for {ticker}")

        # Calculate risk contribution
        result = risk_engine.calculate_risk_contribution(
            portfolio_weights=request.weights,
            price_data=price_data
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk contribution error: {str(e)}")


@router.get("/metrics/{portfolio_id}")
async def get_risk_metrics(portfolio_id: str):
    """
    Get comprehensive risk metrics: VaR, Sharpe ratio, beta, volatility
    """
    try:
        metrics = await risk_service.calculate_risk_metrics(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/var/{portfolio_id}")
async def calculate_var(
    portfolio_id: str,
    confidence: float = Query(0.95, description="Confidence level (0.95 = 95%)"),
    horizon: int = Query(1, description="Time horizon in days")
):
    """
    Calculate Value at Risk (VaR) for the portfolio
    """
    try:
        var_result = await risk_service.calculate_var(portfolio_id, confidence, horizon)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "var": var_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sharpe/{portfolio_id}")
async def calculate_sharpe(
    portfolio_id: str,
    risk_free_rate: float = Query(0.02, description="Risk-free rate")
):
    """
    Calculate Sharpe ratio for the portfolio
    """
    try:
        sharpe = await risk_service.calculate_sharpe(portfolio_id, risk_free_rate)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "sharpe_ratio": sharpe
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/beta/{portfolio_id}")
async def calculate_beta(
    portfolio_id: str,
    benchmark: str = Query("SPY", description="Benchmark symbol")
):
    """
    Calculate beta for the portfolio
    """
    try:
        beta = await risk_service.calculate_beta(portfolio_id, benchmark)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "benchmark": benchmark,
            "beta": beta
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/volatility/{portfolio_id}")
async def calculate_volatility(
    portfolio_id: str,
    period: str = Query("1y", description="Time period")
):
    """
    Calculate portfolio volatility
    """
    try:
        volatility = await risk_service.calculate_volatility(portfolio_id, period)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "volatility": volatility
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap/{portfolio_id}")
async def get_risk_heatmap(portfolio_id: str):
    """
    Generate risk heatmap data for the portfolio
    """
    try:
        heatmap = await risk_service.generate_heatmap(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "heatmap": heatmap
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
