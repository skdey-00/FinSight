"""
Risk Models - Pydantic models for risk analytics
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ValueAtRisk(BaseModel):
    daily_95: float = Field(..., description="Daily VaR at 95% confidence")
    daily_99: float = Field(..., description="Daily VaR at 99% confidence")
    annual_95: float = Field(..., description="Annual VaR at 95% confidence")


class VolatilityMetrics(BaseModel):
    daily: float = Field(..., description="Daily volatility percentage")
    annual: float = Field(..., description="Annual volatility percentage")


class RiskMetrics(BaseModel):
    var: ValueAtRisk
    sharpe_ratio: float
    sortino_ratio: float
    beta: float
    volatility: VolatilityMetrics
    max_drawdown: float
    risk_score: int = Field(..., ge=1, le=10, description="Overall risk score from 1-10")
    risk_level: str = Field(..., description="Risk level: Low, Moderate, High, Very High")


class CorrelationMatrix(BaseModel):
    symbols: List[str]
    matrix: List[List[float]]


class HeatmapData(BaseModel):
    holdings: List[str]
    risk_types: List[str]
    data: List[dict]


class ReturnsDistribution(BaseModel):
    period: str
    bins: List[str]
    frequencies: List[int]
    statistics: dict
