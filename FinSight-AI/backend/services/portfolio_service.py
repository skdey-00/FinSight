"""
Portfolio Service - Portfolio Analyzer
"""
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import random


class PortfolioService:
    def __init__(self):
        self.sample_portfolios = {
            "demo": {
                "holdings": [
                    {"symbol": "AAPL", "shares": 50, "avg_cost": 175.50},
                    {"symbol": "MSFT", "shares": 25, "avg_cost": 380.00},
                    {"symbol": "GOOGL", "shares": 30, "avg_cost": 145.20},
                    {"symbol": "NVDA", "shares": 40, "avg_cost": 520.00},
                    {"symbol": "TSLA", "shares": 100, "avg_cost": 235.00},
                ]
            }
        }

    async def analyze_portfolio(self, holdings: List[Dict], benchmark: str = "SPY") -> Dict:
        """Analyze portfolio and return comprehensive metrics"""
        total_value = 0
        analyzed_holdings = []

        # Current prices (in production, fetch from API)
        prices = {
            "AAPL": 188.87, "MSFT": 402.56, "GOOGL": 153.71,
            "NVDA": 594.91, "TSLA": 218.89, "SPY": 478.52,
            "BTC": 43250.00, "ETH": 2280.00
        }

        for holding in holdings:
            symbol = holding.get("symbol")
            shares = holding.get("shares")
            avg_cost = holding.get("avg_cost")
            current_price = prices.get(symbol, 150.0)

            value = shares * current_price
            cost = shares * avg_cost
            gain_loss = value - cost
            gain_loss_percent = (gain_loss / cost) * 100 if cost > 0 else 0

            analyzed_holdings.append({
                "symbol": symbol,
                "shares": shares,
                "avg_cost": avg_cost,
                "current_price": current_price,
                "value": round(value, 2),
                "weight": 0,  # Will calculate
                "gain_loss": round(gain_loss, 2),
                "gain_loss_percent": round(gain_loss_percent, 2)
            })
            total_value += value

        # Calculate weights
        for holding in analyzed_holdings:
            holding["weight"] = round((holding["value"] / total_value) * 100, 2)

        return {
            "total_value": round(total_value, 2),
            "total_gain_loss": round(sum(h["gain_loss"] for h in analyzed_holdings), 2),
            "holdings": analyzed_holdings,
            "benchmark": benchmark,
            "analyzed_at": datetime.now().isoformat()
        }

    async def simulate_scenario(self, holdings: List[Dict], scenario: str, severity: float) -> Dict:
        """Run what-if scenarios on the portfolio"""
        scenarios = {
            "crash": {"description": "Market Crash", "impact": -severity},
            "rate_hike": {"description": "Interest Rate Hike", "impact": -severity * 0.5},
            "bull": {"description": "Bull Market", "impact": severity},
            "bear": {"description": "Bear Market", "impact": -severity * 0.7}
        }

        scenario_info = scenarios.get(scenario, scenarios["crash"])

        total_value = sum(h.get("shares", 0) * 150 for h in holdings)
        impacted_value = total_value * (1 + scenario_info["impact"])

        return {
            "scenario": scenario,
            "description": scenario_info["description"],
            "severity": severity,
            "current_value": round(total_value, 2),
            "projected_value": round(impacted_value, 2),
            "change": round(impacted_value - total_value, 2),
            "change_percent": round(scenario_info["impact"] * 100, 2),
            "holding_impacts": [
                {
                    "symbol": h["symbol"],
                    "current_value": h["shares"] * 150,
                    "projected_value": h["shares"] * 150 * (1 + scenario_info["impact"]),
                    "change_percent": round(scenario_info["impact"] * 100, 2)
                }
                for h in holdings
            ]
        }

    async def get_correlation_matrix(self, portfolio_id: str) -> List[List[float]]:
        """Generate correlation matrix for portfolio holdings"""
        # Sample correlation matrix (in production, calculate from returns)
        return {
            "symbols": ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"],
            "matrix": [
                [1.00, 0.75, 0.68, 0.72, 0.52],
                [0.75, 1.00, 0.62, 0.78, 0.48],
                [0.68, 0.62, 1.00, 0.65, 0.45],
                [0.72, 0.78, 0.65, 1.00, 0.58],
                [0.52, 0.48, 0.45, 0.58, 1.00]
            ]
        }

    async def get_allocation(self, portfolio_id: str) -> Dict:
        """Get portfolio allocation breakdown"""
        return {
            "by_asset": [
                {"name": "Stocks", "value": 85000, "percent": 68},
                {"name": "Crypto", "value": 25000, "percent": 20},
                {"name": "Bonds", "value": 15000, "percent": 12}
            ],
            "by_sector": [
                {"name": "Technology", "value": 65000, "percent": 52},
                {"name": "Healthcare", "value": 19000, "percent": 15.2},
                {"name": "Finance", "value": 16000, "percent": 12.8},
                {"name": "Energy", "value": 8100, "percent": 6.5},
                {"name": "Other", "value": 16900, "percent": 13.5}
            ],
            "by_region": [
                {"name": "US", "value": 95000, "percent": 76},
                {"name": "Europe", "value": 18000, "percent": 14.4},
                {"name": "Asia", "value": 12000, "percent": 9.6}
            ]
        }

    async def get_returns_distribution(self, portfolio_id: str, period: str) -> Dict:
        """Get returns distribution for visualization"""
        # Generate sample returns distribution data
        bins = ["<-5%", "-5% to -2%", "-2% to 0%", "0% to 2%", "2% to 5%", ">5%"]
        frequencies = [8, 15, 22, 28, 18, 9]

        return {
            "period": period,
            "bins": bins,
            "frequencies": frequencies,
            "statistics": {
                "mean": 0.45,
                "median": 0.32,
                "std_dev": 2.15,
                "skewness": -0.32,
                "kurtosis": 2.85
            }
        }
