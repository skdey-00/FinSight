"""
AI Insights Routes - AI Risk Explainer
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


class RiskQueryRequest(BaseModel):
    portfolio_id: str
    question: str


class ExplainerRequest(BaseModel):
    portfolio_id: str
    metrics: dict


@router.post("/explain")
async def explain_risk(request: ExplainerRequest):
    """
    Convert risk metrics into plain English explanations
    """
    try:
        explanation = await ai_service.explain_risk_metrics(
            request.portfolio_id,
            request.metrics
        )
        return {
            "success": True,
            "portfolio_id": request.portfolio_id,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat_with_ai(request: RiskQueryRequest):
    """
    Chat with AI about portfolio risks and insights
    """
    try:
        response = await ai_service.chat(request.portfolio_id, request.question)
        return {
            "success": True,
            "question": request.question,
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights/{portfolio_id}")
async def get_ai_insights(portfolio_id: str):
    """
    Get AI-generated insights for the portfolio
    """
    try:
        insights = await ai_service.generate_insights(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{portfolio_id}")
async def get_recommendations(portfolio_id: str):
    """
    Get AI-powered recommendations to reduce risk
    """
    try:
        recommendations = await ai_service.get_recommendations(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize")
async def summarize_portfolio(portfolio_id: str):
    """
    Generate a plain English summary of the portfolio's risk profile
    """
    try:
        summary = await ai_service.summarize_portfolio(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
