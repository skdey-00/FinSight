"""
Scenario Simulator - Simulate market scenarios on portfolios

Pre-defined scenarios:
- Market crash: All holdings drop by 30%
- Rate hike: Bonds drop 15%, tech drops 20%, others drop 10%
- Bull run: All holdings gain 25%

Also supports custom scenarios with per-ticker percentage changes.
"""
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime


class ScenarioSimulator:
    # Sector classifications for targeted scenarios
    SECTOR_MAPPING = {
        # Technology
        "AAPL": "technology", "MSFT": "technology", "GOOGL": "technology",
        "GOOG": "technology", "NVDA": "technology", "META": "technology",
        "TSLA": "technology", "AMD": "technology", "CRM": "technology",
        "ADBE": "technology", "INTC": "technology", "CSCO": "technology",
        "ORCL": "technology", "AVGO": "technology", "QCOM": "technology",

        # Financials / Bonds
        "JPM": "financial", "BAC": "financial", "WFC": "financial",
        "GS": "financial", "MS": "financial", "BLK": "financial",
        "SCHW": "financial", "C": "financial",
        "TLT": "bond", "IEF": "bond", "SHY": "bond", "AGG": "bond",
        "BND": "bond", "LQD": "bond",

        # Healthcare
        "JNJ": "healthcare", "UNH": "healthcare", "PFE": "healthcare",
        "ABBV": "healthcare", "MRK": "healthcare", "TMO": "healthcare",
        "ABT": "healthcare", "LLY": "healthcare", "DHR": "healthcare",

        # Energy
        "XOM": "energy", "CVX": "energy", "COP": "energy",
        "SLB": "energy", "EOG": "energy", "PXD": "energy",

        # Consumer
        "AMZN": "consumer", "TSLA": "consumer", "HD": "consumer",
        "MCD": "consumer", "NKE": "consumer", "SBUX": "consumer",
        "LOW": "consumer", "TJX": "consumer",

        # Crypto
        "BTC": "crypto", "ETH": "crypto", "SOL": "crypto"
    }

    def __init__(self):
        """Initialize the Scenario Simulator."""
        pass

    def simulate_scenarios(
        self,
        portfolio: Dict[str, float],
        portfolio_value: float,
        scenarios: Optional[List[str]] = None
    ) -> Dict:
        """
        Simulate multiple scenarios on a portfolio.

        Args:
            portfolio: Dict of {ticker: shares} or {ticker: weight}
            portfolio_value: Total current value of the portfolio
            scenarios: List of scenario names to run (default: all)

        Returns:
            Dict with results for each scenario
        """
        if scenarios is None:
            scenarios = ["market_crash", "rate_hike", "bull_run"]

        results = {
            "simulated_at": datetime.now().isoformat(),
            "portfolio_value_before": portfolio_value,
            "scenarios": []
        }

        for scenario in scenarios:
            result = self.simulate_single_scenario(
                portfolio, portfolio_value, scenario
            )
            results["scenarios"].append(result)

        return results

    def simulate_single_scenario(
        self,
        portfolio: Dict[str, float],
        portfolio_value: float,
        scenario: str,
        custom_changes: Optional[Dict[str, float]] = None
    ) -> Dict:
        """
        Simulate a single scenario on a portfolio.

        Args:
            portfolio: Dict of {ticker: shares} or {ticker: weight}
            portfolio_value: Total current value of the portfolio
            scenario: Scenario name or 'custom'
            custom_changes: For custom scenario, {ticker: percent_change}

        Returns:
            Dict with scenario results
        """
        # Get scenario configuration
        scenario_config = self._get_scenario_config(scenario, custom_changes)

        # Calculate scenario impact
        holdings_impact = []
        total_value_after = 0

        for ticker, amount in portfolio.items():
            # Determine the sector/category for this ticker
            sector = self.SECTOR_MAPPING.get(ticker.upper(), "other")

            # Get the percent change for this holding
            if scenario == "custom" and custom_changes:
                percent_change = custom_changes.get(ticker, custom_changes.get("default", 0))
            else:
                percent_change = scenario_config.get("sector_changes", {}).get(
                    sector, scenario_config.get("default_change", 0)
                )

            # Calculate the value of this holding (assuming proportional to weight/shares)
            # If portfolio has weights, calculate value; otherwise assume equal weight
            if all(0 <= v <= 1 for v in portfolio.values()):
                # These are weights
                holding_value = portfolio_value * amount
            else:
                # These are shares - approximate by weight
                total_shares = sum(portfolio.values())
                holding_value = portfolio_value * (amount / total_shares)

            # Calculate value after scenario
            multiplier = 1 + (percent_change / 100)
            value_after = holding_value * multiplier
            total_value_after += value_after

            holdings_impact.append({
                "ticker": ticker,
                "sector": sector,
                "value_before": round(holding_value, 2),
                "value_after": round(value_after, 2),
                "percent_change": round(percent_change, 2),
                "change_amount": round(value_after - holding_value, 2)
            })

        # Calculate overall portfolio change
        total_change = total_value_after - portfolio_value
        total_change_percent = (total_change / portfolio_value) * 100 if portfolio_value > 0 else 0

        return {
            "scenario": scenario,
            "scenario_name": scenario_config.get("name", scenario),
            "description": scenario_config.get("description", ""),
            "portfolio_value_before": round(portfolio_value, 2),
            "portfolio_value_after": round(total_value_after, 2),
            "total_change": round(total_change, 2),
            "total_change_percent": round(total_change_percent, 2),
            "holdings_impact": holdings_impact,
            "severity": self._classify_severity(total_change_percent)
        }

    def _get_scenario_config(self, scenario: str, custom_changes: Dict = None) -> Dict:
        """Get configuration for a scenario."""
        scenarios = {
            "market_crash": {
                "name": "Market Crash",
                "description": "Broad market decline affecting all sectors",
                "default_change": -30,
                "sector_changes": {
                    "technology": -35,
                    "crypto": -50,
                    "energy": -25,
                    "financial": -20,
                    "healthcare": -15,
                    "consumer": -20,
                    "other": -30
                }
            },
            "rate_hike": {
                "name": "Interest Rate Hike",
                "description": "Federal Reserve raises interest rates significantly",
                "default_change": -10,
                "sector_changes": {
                    "bond": -15,
                    "technology": -20,
                    "crypto": -25,
                    "financial": 5,
                    "energy": -5,
                    "healthcare": -8,
                    "consumer": -12,
                    "other": -10
                }
            },
            "bull_run": {
                "name": "Bull Market Rally",
                "description": "Strong positive market sentiment across all sectors",
                "default_change": 25,
                "sector_changes": {
                    "technology": 30,
                    "crypto": 50,
                    "energy": 20,
                    "financial": 15,
                    "healthcare": 18,
                    "consumer": 22,
                    "other": 25
                }
            },
            "recession": {
                "name": "Economic Recession",
                "description": "Economic downturn with reduced consumer spending",
                "default_change": -20,
                "sector_changes": {
                    "technology": -25,
                    "crypto": -40,
                    "energy": -30,
                    "financial": -35,
                    "healthcare": -5,
                    "consumer": -15,
                    "bond": 5,
                    "other": -20
                }
            },
            "tech_bubble": {
                "name": "Tech Bubble Burst",
                "description": "Technology sector correction after extended rally",
                "default_change": -10,
                "sector_changes": {
                    "technology": -40,
                    "crypto": -45,
                    "financial": -5,
                    "healthcare": -5,
                    "consumer": -8,
                    "energy": -10,
                    "other": -10
                }
            },
            "inflation_surge": {
                "name": "Inflation Surge",
                "description": "Rising inflation impacts purchasing power",
                "default_change": -8,
                "sector_changes": {
                    "technology": -15,
                    "bond": -20,
                    "crypto": 10,
                    "energy": 20,
                    "financial": -5,
                    "healthcare": -3,
                    "consumer": -10,
                    "other": -8
                }
            }
        }

        if scenario == "custom" and custom_changes:
            return {
                "name": "Custom Scenario",
                "description": "User-defined scenario with custom percentage changes",
                "sector_changes": custom_changes
            }

        return scenarios.get(scenario, scenarios["market_crash"])

    def _classify_severity(self, change_percent: float) -> str:
        """Classify the severity of a scenario outcome."""
        if change_percent < -30:
            return "severe_loss"
        elif change_percent < -15:
            return "significant_loss"
        elif change_percent < -5:
            return "moderate_loss"
        elif change_percent < 5:
            return "minimal_change"
        elif change_percent < 15:
            return "moderate_gain"
        elif change_percent < 30:
            return "significant_gain"
        else:
            return "exceptional_gain"

    def compare_scenarios(
        self,
        portfolio: Dict[str, float],
        portfolio_value: float
    ) -> Dict:
        """
        Run all predefined scenarios and provide comparison.

        Args:
            portfolio: Dict of {ticker: shares} or {ticker: weight}
            portfolio_value: Total current value of the portfolio

        Returns:
            Dict with comparison of all scenarios
        """
        all_scenarios = [
            "market_crash",
            "rate_hike",
            "bull_run",
            "recession",
            "tech_bubble",
            "inflation_surge"
        ]

        results = self.simulate_scenarios(portfolio, portfolio_value, all_scenarios)

        # Create summary comparison
        comparison = {
            "simulated_at": results["simulated_at"],
            "portfolio_value_before": portfolio_value,
            "scenario_comparison": []
        }

        for scenario in results["scenarios"]:
            comparison["scenario_comparison"].append({
                "scenario": scenario["scenario_name"],
                "value_after": scenario["portfolio_value_after"],
                "change_percent": scenario["total_change_percent"],
                "severity": scenario["severity"]
            })

        # Sort by value after (worst to best)
        comparison["scenario_comparison"].sort(key=lambda x: x["value_after"])

        # Best and worst case
        if comparison["scenario_comparison"]:
            comparison["worst_case"] = comparison["scenario_comparison"][0]
            comparison["best_case"] = comparison["scenario_comparison"][-1]

        return comparison

    def monte_carlo_simulation(
        self,
        portfolio: Dict[str, float],
        portfolio_value: float,
        num_simulations: int = 1000,
        mean_return: float = 0.0005,
        std_dev: float = 0.02
    ) -> Dict:
        """
        Run Monte Carlo simulation for portfolio value projection.

        Args:
            portfolio: Dict of {ticker: shares} or {ticker: weight}
            portfolio_value: Total current value of the portfolio
            num_simulations: Number of simulation runs
            mean_return: Daily mean return
            std_dev: Daily standard deviation

        Returns:
            Dict with simulation results
        """
        np.random.seed(42)

        # Simulate daily returns for trading days (252 days = 1 year)
        trading_days = 252

        # Generate random returns
        simulated_returns = np.random.normal(
            mean_return,
            std_dev,
            (num_simulations, trading_days)
        )

        # Calculate cumulative returns
        cumulative_returns = np.prod(1 + simulated_returns, axis=1)

        # Calculate final portfolio values
        final_values = portfolio_value * cumulative_returns

        # Calculate statistics
        mean_final = np.mean(final_values)
        median_final = np.median(final_values)
        std_final = np.std(final_values)
        percentiles = {
            "p5": np.percentile(final_values, 5),
            "p25": np.percentile(final_values, 25),
            "p75": np.percentile(final_values, 75),
            "p95": np.percentile(final_values, 95)
        }

        # Calculate probability of loss
        probability_loss = (final_values < portfolio_value).sum() / num_simulations

        # Value at Risk (5%)
        var_95 = portfolio_value - percentiles["p5"]

        return {
            "simulated_at": datetime.now().isoformat(),
            "portfolio_value_start": portfolio_value,
            "num_simulations": num_simulations,
            "time_horizon_days": trading_days,
            "results": {
                "mean_final_value": round(float(mean_final), 2),
                "median_final_value": round(float(median_final), 2),
                "standard_deviation": round(float(std_final), 2),
                "percentiles": {k: round(float(v), 2) for k, v in percentiles.items()},
                "probability_of_loss": round(float(probability_loss * 100), 2),
                "value_at_risk_95": round(float(var_95), 2)
            }
        }


# Singleton instance
scenario_simulator = ScenarioSimulator()
