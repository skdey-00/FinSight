"""
Risk Service - Risk Analytics
"""
import numpy as np
from typing import Dict
from scipy import stats


class RiskService:
    def __init__(self):
        pass

    async def calculate_risk_metrics(self, portfolio_id: str) -> Dict:
        """Calculate comprehensive risk metrics"""
        # Sample portfolio returns (in production, fetch historical data)
        returns = np.random.normal(0.001, 0.02, 252)  # Daily returns for a year

        # Calculate metrics
        volatility = np.std(returns) * np.sqrt(252)  # Annualized volatility
        annual_return = np.mean(returns) * 252
        risk_free_rate = 0.02
        sharpe_ratio = (annual_return - risk_free_rate) / volatility

        # Calculate VaR (95% confidence)
        var_95 = np.percentile(returns, 5)

        # Calculate beta (simplified)
        beta = 1.15

        # Max drawdown
        cumulative = np.cumprod(1 + returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = np.min(drawdown)

        return {
            "var": {
                "daily_95": round(var_95 * 100, 2),
                "daily_99": round(np.percentile(returns, 1) * 100, 2),
                "annual_95": round(var_95 * np.sqrt(252) * 100, 2)
            },
            "sharpe_ratio": round(sharpe_ratio, 2),
            "sortino_ratio": round((annual_return - risk_free_rate) / (np.std(returns[returns < 0]) * np.sqrt(252)), 2),
            "beta": round(beta, 2),
            "volatility": {
                "daily": round(np.std(returns) * 100, 2),
                "annual": round(volatility * 100, 2)
            },
            "max_drawdown": round(max_drawdown * 100, 2),
            "risk_score": self._calculate_risk_score(volatility, max_drawdown),
            "risk_level": self._get_risk_level(volatility)
        }

    def _calculate_risk_score(self, volatility: float, max_drawdown: float) -> int:
        """Calculate overall risk score (1-10)"""
        score = (volatility * 2) + (abs(max_drawdown) * 5)
        return min(max(int(score), 1), 10)

    def _get_risk_level(self, volatility: float) -> str:
        """Get risk level category"""
        if volatility < 0.15:
            return "Low"
        elif volatility < 0.25:
            return "Moderate"
        elif volatility < 0.35:
            return "High"
        else:
            return "Very High"

    async def calculate_var(self, portfolio_id: str, confidence: float, horizon: int) -> Dict:
        """Calculate Value at Risk"""
        # Historical simulation method
        returns = np.random.normal(0.001, 0.02, 252)
        var = np.percentile(returns, (1 - confidence) * 100)

        # Scale for time horizon using square root of time
        var_horizon = var * np.sqrt(horizon)

        return {
            "confidence": confidence,
            "horizon_days": horizon,
            "var_percent": round(var_horizon * 100, 2),
            "var_amount": round(100000 * var_horizon, 2),  # Assuming $100k portfolio
            "method": "Historical Simulation"
        }

    async def calculate_sharpe(self, portfolio_id: str, risk_free_rate: float) -> float:
        """Calculate Sharpe ratio"""
        returns = np.random.normal(0.001, 0.02, 252)
        excess_returns = returns - (risk_free_rate / 252)
        sharpe = np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)
        return round(sharpe, 2)

    async def calculate_beta(self, portfolio_id: str, benchmark: str) -> Dict:
        """Calculate beta relative to benchmark"""
        # Simplified beta calculation
        portfolio_returns = np.random.normal(0.001, 0.02, 252)
        benchmark_returns = np.random.normal(0.0008, 0.015, 252)

        covariance = np.cov(portfolio_returns, benchmark_returns)[0][1]
        benchmark_variance = np.var(benchmark_returns)
        beta = covariance / benchmark_variance

        return {
            "beta": round(beta, 2),
            "benchmark": benchmark,
            "interpretation": self._interpret_beta(beta)
        }

    def _interpret_beta(self, beta: float) -> str:
        if beta < 0.8:
            return "Lower volatility than market"
        elif beta < 1.2:
            return "Similar volatility to market"
        else:
            return "Higher volatility than market"

    async def calculate_volatility(self, portfolio_id: str, period: str) -> Dict:
        """Calculate portfolio volatility"""
        returns = np.random.normal(0.001, 0.02, 252)
        daily_vol = np.std(returns)
        annual_vol = daily_vol * np.sqrt(252)

        return {
            "period": period,
            "daily_volatility": round(daily_vol * 100, 2),
            "annual_volatility": round(annual_vol * 100, 2),
            "volatility_rank": "Medium"
        }

    async def generate_heatmap(self, portfolio_id: str) -> Dict:
        """Generate risk heatmap data"""
        holdings = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]

        heatmap_data = []
        for symbol in holdings:
            for risk_type in ["market", "concentration", "volatility", "liquidity"]:
                heatmap_data.append({
                    "symbol": symbol,
                    "risk_type": risk_type,
                    "severity": random.choice(["low", "medium", "high", "critical"]),
                    "score": random.randint(1, 10)
                })

        return {
            "holdings": holdings,
            "risk_types": ["market", "concentration", "volatility", "liquidity"],
            "data": heatmap_data
        }
