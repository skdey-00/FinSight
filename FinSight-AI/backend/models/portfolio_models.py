"""
Portfolio Models - Pydantic models for portfolio data
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class HoldingInput(BaseModel):
    symbol: str = Field(..., description="Stock/crypto symbol")
    shares: float = Field(..., gt=0, description="Number of shares")
    avg_cost: float = Field(..., gt=0, description="Average cost per share")


class PortfolioInput(BaseModel):
    name: str = Field(..., description="Portfolio name")
    holdings: List[HoldingInput] = Field(..., min_items=1, description="List of holdings")
    benchmark: str = Field(default="SPY", description="Benchmark symbol")


class HoldingAnalysis(BaseModel):
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    value: float
    weight: float
    gain_loss: float
    gain_loss_percent: float


class PortfolioAnalysis(BaseModel):
    total_value: float
    total_gain_loss: float
    holdings: List[HoldingAnalysis]
    benchmark: str
    analyzed_at: str


class ScenarioInput(BaseModel):
    scenario: str = Field(..., description="Scenario type: crash, rate_hike, bull, bear")
    severity: float = Field(default=0.2, ge=0, le=1, description="Severity as decimal (0.2 = 20%)")


class ScenarioResult(BaseModel):
    scenario: str
    description: str
    severity: float
    current_value: float
    projected_value: float
    change: float
    change_percent: float
    holding_impacts: List[dict]
