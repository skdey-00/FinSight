"""
Alert Models - Pydantic models for alert system
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AlertThreshold(BaseModel):
    rule_id: str
    portfolio_id: str
    metric: str
    threshold: float
    condition: str
    created_at: str
    enabled: bool


class AlertCondition(BaseModel):
    metric: str
    operator: str
    value: float


class AlertRule(BaseModel):
    rule_id: str
    name: str
    portfolio_id: str
    conditions: List[AlertCondition]
    notification_channels: List[str]
    created_at: str
    enabled: bool
    trigger_count: int


class AlertEvent(BaseModel):
    alert_id: str
    rule_id: str
    timestamp: str
    type: str
    severity: str
    message: str
    resolved: bool


class AnomalyData(BaseModel):
    date: str
    symbol: str
    type: str
    severity: str
    description: str
    value: float
    threshold: float


class ConcentrationRisk(BaseModel):
    category: str
    value: float
    percent: float
    status: str
