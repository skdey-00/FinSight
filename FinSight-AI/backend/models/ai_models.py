"""
AI Models - Pydantic models for AI insights
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class RiskExplanation(BaseModel):
    metric: str
    value: float | str
    explanation: str
    plain_english: str
    concern_level: str = Field(..., description="Concern level: low, medium, high")


class OverallAssessment(BaseModel):
    overall_level: str
    summary: str
    recommendations: List[str]


class AIExplanationResponse(BaseModel):
    explanations: List[RiskExplanation]
    overall_assessment: OverallAssessment


class AIInsight(BaseModel):
    type: str = Field(..., description="Type: opportunity, positive, warning, danger")
    title: str
    description: str
    priority: str = Field(..., description="Priority: low, medium, high")
    actionable: bool


class Recommendation(BaseModel):
    category: str
    recommendation: str
    reason: str
    impact: str
    effort: str


class ChatRequest(BaseModel):
    portfolio_id: str
    question: str


class ChatResponse(BaseModel):
    success: bool
    question: str
    response: str
