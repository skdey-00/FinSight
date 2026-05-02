"""
Anomaly Service - Anomaly Detection
"""
from typing import Dict, List
from datetime import datetime, timedelta
import random


class AnomalyService:
    def __init__(self):
        self.detected_anomalies = []

    async def detect_anomalies(self, portfolio_id: str, lookback_days: int) -> Dict:
        """Detect anomalies in portfolio and market data"""
        anomalies = []

        # Generate sample anomalies based on lookback period
        num_anomalies = min(lookback_days // 5, 10)  # Roughly 1 anomaly per 5 days

        for i in range(num_anomalies):
            days_ago = random.randint(1, lookback_days)
            date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

            anomaly_types = [
                {"type": "price_spike", "severity": "medium", "description": "Unusual price movement detected"},
                {"type": "volume_surge", "severity": "low", "description": "Trading volume 300% above average"},
                {"type": "volatility_breakout", "severity": "high", "description": "Volatility exceeded 2 standard deviations"},
                {"type": "correlation_breakdown", "severity": "medium", "description": "Correlation with benchmark shifted significantly"}
            ]

            anomaly = random.choice(anomaly_types)
            anomalies.append({
                "date": date,
                "symbol": random.choice(["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]),
                "type": anomaly["type"],
                "severity": anomaly["severity"],
                "description": anomaly["description"],
                "value": round(random.uniform(-10, 10), 2),
                "threshold": round(random.uniform(2, 5), 2)
            })

        # Sort by date (newest first)
        anomalies.sort(key=lambda x: x["date"], reverse=True)

        return {
            "total_anomalies": len(anomalies),
            "critical_anomalies": len([a for a in anomalies if a["severity"] == "high"]),
            "anomalies": anomalies,
            "lookback_period_days": lookback_days
        }

    async def check_concentration_risk(self, portfolio_id: str) -> Dict:
        """Check for concentration risk in the portfolio"""
        # Sample concentration analysis
        concentrations = [
            {"category": "Technology", "value": 65000, "percent": 52, "status": "elevated"},
            {"category": "Single Stock (NVDA)", "value": 23796, "percent": 19, "status": "normal"},
            {"category": "US Market", "value": 95000, "percent": 76, "status": "normal"},
            {"category": "Large Cap", "value": 98000, "percent": 78, "status": "normal"}
        ]

        has_risk = any(c["status"] == "elevated" for c in concentrations)

        return {
            "has_concentration_risk": has_risk,
            "overall_status": "elevated" if has_risk else "normal",
            "concentrations": concentrations,
            "recommendations": [
                "Consider reducing technology allocation to under 40%",
                "Limit any single stock to under 15% of portfolio"
            ] if has_risk else ["Portfolio concentration levels are within normal ranges"]
        }

    async def get_market_events(self, days: int) -> List[Dict]:
        """Get recent unusual market events"""
        events = []

        # Sample market events
        sample_events = [
            {"date": "2025-01-14", "event": "Fed rate decision", "impact": "high", "description": "Federal Reserve held rates steady, signaled potential cuts in 2025"},
            {"date": "2025-01-12", "event": "Tech sector volatility", "impact": "medium", "description": "Technology stocks experienced elevated volatility following earnings"},
            {"date": "2025-01-10", "event": "Oil price spike", "impact": "medium", "description": "Crude prices surged 5% on supply concerns"},
            {"date": "2025-01-08", "event": "Bank earnings surprise", "impact": "low", "description": "Major banks beat earnings expectations"},
            {"date": "2025-01-05", "event": "VIX spike", "impact": "high", "description": "Volatility index jumped to 18, highest in 2 months"}
        ]

        # Filter events within the specified days
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        for event in sample_events:
            if event["date"] >= cutoff_date:
                events.append(event)

        return events

    async def add_to_watchlist(self, portfolio_id: str, symbols: List[str]) -> Dict:
        """Add symbols to anomaly detection watchlist"""
        # In production, store in database
        return {
            "portfolio_id": portfolio_id,
            "watchlist": symbols,
            "added_at": datetime.now().isoformat(),
            "status": "monitoring"
        }

    async def detect_drift(self, portfolio_id: str) -> Dict:
        """Detect portfolio drift from target allocation"""
        # Sample drift analysis
        target_allocation = {
            "Technology": 40,
            "Healthcare": 20,
            "Finance": 15,
            "Energy": 10,
            "Other": 15
        }

        actual_allocation = {
            "Technology": 52,
            "Healthcare": 15.2,
            "Finance": 12.8,
            "Energy": 6.5,
            "Other": 13.5
        }

        drift_items = []
        total_drift = 0

        for sector in target_allocation:
            target = target_allocation[sector]
            actual = actual_allocation[sector]
            drift = abs(actual - target)
            total_drift += drift

            drift_items.append({
                "sector": sector,
                "target_percent": target,
                "actual_percent": actual,
                "drift": round(drift, 2),
                "status": "significant" if drift > 5 else "minor"
            })

        needs_rebalancing = total_drift > 20

        return {
            "needs_rebalancing": needs_rebalancing,
            "total_drift": round(total_drift, 2),
            "drift_by_sector": drift_items,
            "recommendation": "Consider rebalancing your portfolio to align with target allocations" if needs_rebalancing else "Portfolio allocations are within acceptable ranges"
        }
