"""
Scenario Simulation Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from services.scenario_simulator import scenario_simulator

router = APIRouter()


class SimulationRequest(BaseModel):
    """
    Request model for scenario simulation.

    Example:
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000,
        "scenarios": ["market_crash", "rate_hike", "bull_run"]
    }
    """
    portfolio: Dict[str, float] = Field(
        ...,
        description="Portfolio holdings as {ticker: weight_percent} or {ticker: shares}"
    )
    portfolio_value: float = Field(
        ...,
        gt=0,
        description="Total current value of the portfolio"
    )
    scenarios: Optional[List[str]] = Field(
        None,
        description="List of scenarios to run (defaults to all if not provided)"
    )


class CustomScenarioRequest(BaseModel):
    """
    Request model for custom scenario simulation.

    Example:
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000,
        "custom_changes": {"AAPL": -15, "TSLA": 25, "GOOGL": 5, "default": 0}
    }
    """
    portfolio: Dict[str, float]
    portfolio_value: float = Field(..., gt=0)
    custom_changes: Dict[str, float] = Field(
        ...,
        description="Custom % changes per ticker. Use 'default' for unspecified tickers."
    )


@router.post("/simulate")
async def run_simulation(request: SimulationRequest):
    """
    Run predefined scenario simulations on a portfolio.

    Available scenarios:
    - market_crash: All holdings drop (tech -35%, crypto -50%, others -30%)
    - rate_hike: Interest rate hike (bonds -15%, tech -20%, financials +5%)
    - bull_run: All holdings gain (tech +30%, crypto +50%, others +25%)
    - recession: Economic downturn (tech -25%, crypto -40%, financials -35%)
    - tech_bubble: Tech sector correction (tech -40%, crypto -45%)
    - inflation_surge: Rising inflation (bonds -20%, tech -15%, energy +20%)

    Example request:
    ```json
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000,
        "scenarios": ["market_crash", "bull_run"]
    }
    ```
    """
    try:
        # If no scenarios specified, run all default ones
        if request.scenarios is None:
            scenarios = ["market_crash", "rate_hike", "bull_run"]
        else:
            scenarios = request.scenarios

        result = scenario_simulator.simulate_scenarios(
            portfolio=request.portfolio,
            portfolio_value=request.portfolio_value,
            scenarios=scenarios
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@router.post("/simulate/custom")
async def run_custom_simulation(request: CustomScenarioRequest):
    """
    Run a custom scenario with user-defined percentage changes.

    Specify percentage change for each ticker. Use 'default' key for
    tickers not explicitly listed.

    Example request:
    ```json
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000,
        "custom_changes": {
            "AAPL": -15,
            "TSLA": 25,
            "GOOGL": 5,
            "default": 0
        }
    }
    ```
    """
    try:
        result = scenario_simulator.simulate_single_scenario(
            portfolio=request.portfolio,
            portfolio_value=request.portfolio_value,
            scenario="custom",
            custom_changes=request.custom_changes
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom simulation error: {str(e)}")


@router.post("/simulate/compare")
async def compare_scenarios(request: SimulationRequest):
    """
    Run all predefined scenarios and provide a comparison.

    Returns scenarios ranked from worst to best outcome,
    along with best/worst case analysis.

    Example request:
    ```json
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000
    }
    ```
    """
    try:
        result = scenario_simulator.compare_scenarios(
            portfolio=request.portfolio,
            portfolio_value=request.portfolio_value
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")


@router.post("/simulate/monte-carlo")
async def run_monte_carlo(
    request: SimulationRequest,
    num_simulations: int = 1000,
    mean_return: float = 0.0005,
    std_dev: float = 0.02
):
    """
    Run Monte Carlo simulation for portfolio value projection.

    Simulates 1000+ random market paths to estimate:
    - Mean and median final values
    - Probability of loss
    - Value at Risk (95%)

    Example request:
    ```json
    {
        "portfolio": {"AAPL": 40, "TSLA": 30, "GOOGL": 30},
        "portfolio_value": 100000
    }
    ```

    Query params:
    - num_simulations: Number of simulation runs (default: 1000)
    - mean_return: Expected daily return (default: 0.0005)
    - std_dev: Daily volatility (default: 0.02)
    """
    try:
        result = scenario_simulator.monte_carlo_simulation(
            portfolio=request.portfolio,
            portfolio_value=request.portfolio_value,
            num_simulations=num_simulations,
            mean_return=mean_return,
            std_dev=std_dev
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monte Carlo error: {str(e)}")
