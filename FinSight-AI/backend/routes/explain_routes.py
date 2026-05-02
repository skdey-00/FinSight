"""
AI Explainer Routes - POST /api/explain endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Optional
from services.ai_explainer import ai_explainer

router = AIExplainerRouter = APIRouter()


class ExplainRequest(BaseModel):
    """
    Request model for AI risk explanation.

    Example:
    {
        "risk_metrics": {
            "value_at_risk": {...},
            "sharpe_ratio": {...},
            "beta": {...},
            "max_drawdown": {...}
        },
        "portfolio_info": {
            "tickers": ["AAPL", "TSLA", "GOOGL"],
            "weights": {"AAPL": 0.4, "TSLA": 0.3, "GOOGL": 0.3},
            "value": 100000
        }
    }
    """
    risk_metrics: Dict = Field(
        ...,
        description="Risk metrics dict from the risk engine"
    )
    portfolio_info: Optional[Dict] = Field(
        None,
        description="Optional portfolio details (tickers, weights, value)"
    )


@router.post("/explain")
async def explain_risk(request: ExplainRequest):
    """
    Explain portfolio risk metrics in plain English using Anthropic Claude.

    This endpoint takes risk metrics from the risk engine and returns:
    - A 3-paragraph explanation for non-expert investors
    - The single biggest risk factor
    - 2 specific actionable recommendations

    The AI (Claude Sonnet 4) analyzes the metrics and provides human-readable
    insights that anyone can understand.

    Example request:
    ```json
    {
        "risk_metrics": {
            "value_at_risk": {
                "95%": {"daily_percent": -2.34, "annual_percent": -37.14}
            },
            "sharpe_ratio": {
                "sharpe_ratio": 1.24,
                "annual_return_percent": 18.5,
                "annual_volatility_percent": 14.8
            },
            "beta": {"beta": 1.15},
            "max_drawdown": {"max_drawdown_percent": -12.5},
            "portfolio_statistics": {
                "total_return_percent": 15.2,
                "win_rate_percent": 52.5
            }
        },
        "portfolio_info": {
            "tickers": ["AAPL", "TSLA", "GOOGL"],
            "weights": {"AAPL": 0.4, "TSLA": 0.3, "GOOGL": 0.3},
            "value": 100000
        }
    }
    ```

    Response:
    ```json
    {
        "explained_at": "2025-01-15T10:30:00",
        "explanation": "Your portfolio has a moderate risk profile...",
        "biggest_risk_factor": "High concentration in technology stocks...",
        "recommendations": [
            "Consider diversifying into other sectors...",
            "Set up alerts for when any position exceeds 25%..."
        ]
    }
    ```
    """
    try:
        result = await ai_explainer.explain_portfolio_risk(
            risk_metrics=request.risk_metrics,
            portfolio_info=request.portfolio_info
        )

        if "error" in result and result.get("error"):
            # Return the response but flag the error
            return {
                "success": False,
                "data": result
            }

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")


@router.post("/explain/anomaly")
async def explain_anomaly(
    anomaly: Dict,
    context: Optional[Dict] = None
):
    """
    Explain a detected anomaly in plain English.

    Example request:
    ```json
    {
        "symbol": "AAPL",
        "type": "volatility_spike",
        "severity": "high",
        "description": "Volatility exceeded 2 standard deviations",
        "value": 4.5,
        "threshold": 2.0
    }
    ```
    """
    try:
        result = await ai_explainer.explain_anomaly(anomaly, context)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly explanation error: {str(e)}")


@router.post("/chat")
async def chat_with_ai(
    message: str,
    context: Optional[Dict] = None
):
    """
    Chat with AI about portfolio questions.

    Example request:
    ```json
    {
        "message": "What's my biggest risk?",
        "context": {"portfolio_value": 100000, "top_holdings": ["AAPL", "TSLA"]}
    }
    ```
    """
    try:
        result = await ai_explainer.chat(message, context)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
