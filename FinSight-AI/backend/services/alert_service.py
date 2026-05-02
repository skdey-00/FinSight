"""
Alert Service - Alert System
"""
from typing import Dict, List
from datetime import datetime
import uuid


class AlertService:
    def __init__(self):
        # In production, store in database
        self.alert_rules = {}
        self.alert_history = []

    async def set_threshold(self, portfolio_id: str, metric: str, threshold: float, condition: str) -> Dict:
        """Set risk threshold for alerting"""
        rule_id = str(uuid.uuid4())

        rule = {
            "rule_id": rule_id,
            "portfolio_id": portfolio_id,
            "metric": metric,
            "threshold": threshold,
            "condition": condition,
            "created_at": datetime.now().isoformat(),
            "enabled": True
        }

        self.alert_rules[rule_id] = rule

        return rule

    async def get_thresholds(self, portfolio_id: str) -> List[Dict]:
        """Get all alert thresholds for a portfolio"""
        return [
            rule for rule in self.alert_rules.values()
            if rule["portfolio_id"] == portfolio_id and rule["enabled"]
        ]

    async def create_rule(self, rule_data: Dict) -> Dict:
        """Create a custom alert rule"""
        rule_id = str(uuid.uuid4())

        rule = {
            "rule_id": rule_id,
            "name": rule_data.get("name"),
            "portfolio_id": rule_data.get("portfolio_id"),
            "conditions": rule_data.get("conditions", []),
            "notification_channels": rule_data.get("notification_channels", []),
            "created_at": datetime.now().isoformat(),
            "enabled": True,
            "trigger_count": 0
        }

        self.alert_rules[rule_id] = rule

        return rule

    async def get_rules(self, portfolio_id: str) -> List[Dict]:
        """Get all alert rules for a portfolio"""
        return [
            rule for rule in self.alert_rules.values()
            if rule["portfolio_id"] == portfolio_id
        ]

    async def get_history(self, portfolio_id: str, limit: int = 50) -> List[Dict]:
        """Get alert history for a portfolio"""
        # Sample alert history
        history = [
            {
                "alert_id": str(uuid.uuid4()),
                "rule_id": str(uuid.uuid4()),
                "timestamp": "2025-01-15T10:30:00Z",
                "type": "var_threshold",
                "severity": "warning",
                "message": "Daily VaR exceeded 3% threshold (actual: 3.2%)",
                "resolved": True
            },
            {
                "alert_id": str(uuid.uuid4()),
                "rule_id": str(uuid.uuid4()),
                "timestamp": "2025-01-14T14:45:00Z",
                "type": "volatility_spike",
                "severity": "info",
                "message": "Portfolio volatility increased to 22% (baseline: 18%)",
                "resolved": True
            },
            {
                "alert_id": str(uuid.uuid4()),
                "rule_id": str(uuid.uuid4()),
                "timestamp": "2025-01-13T09:15:00Z",
                "type": "concentration_risk",
                "severity": "warning",
                "message": "Technology allocation exceeded 50% threshold (actual: 52%)",
                "resolved": False
            },
            {
                "alert_id": str(uuid.uuid4()),
                "rule_id": str(uuid.uuid4()),
                "timestamp": "2025-01-12T16:00:00Z",
                "type": "drawdown_alert",
                "severity": "critical",
                "message": "Portfolio drawdown exceeded 10% threshold (actual: 10.5%)",
                "resolved": True
            }
        ]

        return history[:limit]

    async def test_alert(self, rule_id: str) -> Dict:
        """Send a test alert"""
        if rule_id not in self.alert_rules:
            return {"success": False, "message": "Rule not found"}

        rule = self.alert_rules[rule_id]

        return {
            "success": True,
            "rule_id": rule_id,
            "test_alert": {
                "alert_id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "message": f"TEST ALERT: Rule '{rule.get('name', 'Unnamed')}' triggered",
                "channels": rule.get("notification_channels", []),
                "status": "sent"
            }
        }

    async def delete_rule(self, rule_id: str) -> bool:
        """Delete an alert rule"""
        if rule_id in self.alert_rules:
            del self.alert_rules[rule_id]
            return True
        return False
