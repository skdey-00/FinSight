"""
Alert System Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from services.alert_service import AlertService

router = APIRouter()
alert_service = AlertService()


class AlertThreshold(BaseModel):
    portfolio_id: str
    metric: str  # "var", "volatility", "concentration", "drawdown"
    threshold: float
    condition: str  # "above", "below"
    enabled: bool = True


class AlertRuleCreate(BaseModel):
    name: str
    portfolio_id: str
    conditions: List[dict]
    notification_channels: List[str]  # "email", "sms", "webhook"


class AlertSettings(BaseModel):
    """User alert settings for threshold management"""
    varThreshold: Dict[str, Any] = Field(default_factory=dict)
    volatilityThreshold: Dict[str, Any] = Field(default_factory=dict)
    drawdownThreshold: Dict[str, Any] = Field(default_factory=dict)
    concentrationThreshold: Dict[str, Any] = Field(default_factory=dict)
    emailNotifications: bool = True
    pushNotifications: bool = False


# Simple in-memory storage for alert settings (in production, use database)
_alert_settings_store = {}


@router.post("/settings")
async def save_alert_settings(settings: AlertSettings):
    """
    Save user alert settings (thresholds and notification preferences).

    Accepts complete alert configuration and stores it for the user session.
    In a production app, this would be tied to user authentication.
    """
    try:
        # Store settings (in production, would use user_id from auth)
        import uuid
        from datetime import datetime

        settings_id = str(uuid.uuid4())
        settings_data = {
            "id": settings_id,
            "settings": settings.dict(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        _alert_settings_store[settings_id] = settings_data

        return {
            "success": True,
            "settings_id": settings_id,
            "message": "Alert settings saved successfully",
            "data": settings_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")


@router.get("/settings")
async def get_alert_settings():
    """
    Get current alert settings.

    Returns the default or previously saved alert settings.
    """
    try:
        # Return default settings if none saved
        default_settings = {
            "varThreshold": {"enabled": True, "value": 3.0, "condition": "above"},
            "volatilityThreshold": {"enabled": True, "value": 25.0, "condition": "above"},
            "drawdownThreshold": {"enabled": True, "value": 15.0, "condition": "above"},
            "concentrationThreshold": {"enabled": True, "value": 50.0, "condition": "above"},
            "emailNotifications": True,
            "pushNotifications": False
        }

        # Check if there are saved settings (would use user_id in production)
        if _alert_settings_store:
            first_key = list(_alert_settings_store.keys())[0]
            return {
                "success": True,
                "settings": _alert_settings_store[first_key]["settings"]
            }

        return {
            "success": True,
            "settings": default_settings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get settings: {str(e)}")


@router.post("/check")
async def check_alert_thresholds(metrics: Dict):
    """
    Check if current metrics exceed any alert thresholds.

    Returns a list of triggered alerts that should be displayed to the user.
    """
    try:
        # Get current settings (in production, would get for specific user)
        settings_result = await get_alert_settings()
        settings = settings_result["settings"]

        triggered = []

        # Check VaR threshold
        if settings.get("varThreshold", {}).get("enabled"):
            var_value = abs(metrics.get("value_at_risk", {}).get("daily_percent", 0))
            var_threshold = settings["varThreshold"].get("value", 3.0)
            if var_value > var_threshold:
                triggered.append({
                    "type": "var",
                    "message": f"Daily VaR ({var_value:.2f}%) exceeds threshold ({var_threshold}%)",
                    "severity": "critical"
                })

        # Check volatility threshold
        if settings.get("volatilityThreshold", {}).get("enabled"):
            vol_value = metrics.get("volatility_percent", 0)
            vol_threshold = settings["volatilityThreshold"].get("value", 25.0)
            if vol_value > vol_threshold:
                triggered.append({
                    "type": "volatility",
                    "message": f"Volatility ({vol_value:.2f}%) exceeds threshold ({vol_threshold}%)",
                    "severity": "warning"
                })

        # Check drawdown threshold
        if settings.get("drawdownThreshold", {}).get("enabled"):
            dd_value = abs(metrics.get("max_drawdown_percent", 0))
            dd_threshold = settings["drawdownThreshold"].get("value", 15.0)
            if dd_value > dd_threshold:
                triggered.append({
                    "type": "drawdown",
                    "message": f"Max drawdown ({dd_value:.2f}%) exceeds threshold ({dd_threshold}%)",
                    "severity": "critical"
                })

        return {
            "success": True,
            "has_alerts": len(triggered) > 0,
            "triggered": triggered
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check thresholds: {str(e)}")


@router.post("/thresholds")
async def set_threshold(threshold: AlertThreshold):
    """
    Set risk threshold for alerting
    """
    try:
        result = await alert_service.set_threshold(
            threshold.portfolio_id,
            threshold.metric,
            threshold.threshold,
            threshold.condition
        )
        return {
            "success": True,
            "threshold": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/thresholds/{portfolio_id}")
async def get_thresholds(portfolio_id: str):
    """
    Get all alert thresholds for a portfolio
    """
    try:
        thresholds = await alert_service.get_thresholds(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "thresholds": thresholds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rules")
async def create_alert_rule(rule: AlertRuleCreate):
    """
    Create a custom alert rule
    """
    try:
        result = await alert_service.create_rule(rule.dict())
        return {
            "success": True,
            "rule": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rules/{portfolio_id}")
async def get_alert_rules(portfolio_id: str):
    """
    Get all alert rules for a portfolio
    """
    try:
        rules = await alert_service.get_rules(portfolio_id)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "rules": rules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{portfolio_id}")
async def get_alert_history(
    portfolio_id: str,
    limit: int = 50
):
    """
    Get alert history for a portfolio
    """
    try:
        history = await alert_service.get_history(portfolio_id, limit)
        return {
            "success": True,
            "portfolio_id": portfolio_id,
            "alerts": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test/{rule_id}")
async def test_alert(rule_id: str):
    """
    Send a test alert
    """
    try:
        result = await alert_service.test_alert(rule_id)
        return {
            "success": True,
            "test_result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/rules/{rule_id}")
async def delete_alert_rule(rule_id: str):
    """
    Delete an alert rule
    """
    try:
        await alert_service.delete_rule(rule_id)
        return {
            "success": True,
            "message": f"Alert rule {rule_id} deleted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
