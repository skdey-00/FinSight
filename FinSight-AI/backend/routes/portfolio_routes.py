"""
Portfolio Routes - Portfolio Analyzer
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from services.portfolio_service import PortfolioService

router = APIRouter()
portfolio_service = PortfolioService()


class PortfolioInput(BaseModel):
    name: str
    holdings: List[dict]
    benchmark: Optional[str] = "SPY"


class ScenarioInput(BaseModel):
    scenario: str  # "crash", "rate_hike", "bull", "bear"
    severity: float = 0.2  # 20% change


@router.post("/analyze")
async def analyze_portfolio(portfolio: PortfolioInput):
    """
    Analyze portfolio and return comprehensive risk metrics
    """
    try:
        result = await portfolio_service.analyze_portfolio(portfolio.holdings, portfolio.benchmark)
        return {
            "success": True,
            "portfolio_name": portfolio.name,
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate")
async def run_simulation(portfolio: PortfolioInput, scenario: ScenarioInput):
    """
    Run what-if scenarios on the portfolio
    """
    try:
        result = await portfolio_service.simulate_scenario(
            portfolio.holdings,
            scenario.scenario,
            scenario.severity
        )
        return {
            "success": True,
            "scenario": scenario.scenario,
            "severity": scenario.severity,
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/correlation/{portfolio_id}")
async def get_correlation_matrix(portfolio_id: str):
    """
    Get correlation matrix for portfolio holdings
    """
    try:
        matrix = await portfolio_service.get_correlation_matrix(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "correlation_matrix": matrix
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/allocation/{portfolio_id}")
async def get_allocation(portfolio_id: str):
    """
    Get portfolio allocation breakdown
    """
    try:
        allocation = await portfolio_service.get_allocation(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "allocation": allocation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/returns/{portfolio_id}")
async def get_returns_distribution(portfolio_id: str, period: str = Query("1y", description="Time period")):
    """
    Get returns distribution for the portfolio
    """
    try:
        returns = await portfolio_service.get_returns_distribution(portfolio_id, period)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "period": period,
            "returns": returns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
