"""
Risk Engine - Portfolio risk calculations using numpy and scipy

Calculates:
- Value at Risk (VaR) via historical simulation
- Sharpe Ratio
- Portfolio Beta vs SPY
- Max Drawdown
- Correlation Matrix
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Optional, Union
from datetime import datetime


class RiskEngine:
    def __init__(self, risk_free_rate: float = 0.02):
        """
        Initialize the Risk Engine.

        Args:
            risk_free_rate: Annual risk-free rate (default 2%)
        """
        self.risk_free_rate = risk_free_rate

    def calculate_portfolio_risk(
        self,
        portfolio_weights: Dict[str, float],
        price_data: Dict[str, pd.DataFrame],
        benchmark_data: Optional[pd.DataFrame] = None
    ) -> Dict:
        """
        Calculate all portfolio risk metrics.

        Args:
            portfolio_weights: Dict of {ticker: weight} e.g., {"AAPL": 0.4, "TSLA": 0.3, "GOOGL": 0.3}
            price_data: Dict of {ticker: DataFrame} with 'Close' prices
            benchmark_data: Optional DataFrame with benchmark (SPY) 'Close' prices

        Returns:
            Dict containing all risk metrics
        """
        # Validate inputs
        if not portfolio_weights:
            return {"error": "Portfolio weights cannot be empty"}

        if not price_data:
            return {"error": "Price data cannot be empty"}

        # Normalize weights to sum to 1
        total_weight = sum(portfolio_weights.values())
        if abs(total_weight - 1.0) > 0.01:
            normalized_weights = {k: v / total_weight for k, v in portfolio_weights.items()}
        else:
            normalized_weights = portfolio_weights

        # Get common date range
        tickers = list(portfolio_weights.keys())
        aligned_data = self._align_price_data(price_data, tickers)

        if aligned_data is None or aligned_data.empty:
            return {"error": "Could not align price data for the given tickers"}

        # Calculate returns for each asset
        returns_data = self._calculate_returns(aligned_data)

        # Calculate portfolio returns
        weights_array = np.array([normalized_weights[t] for t in tickers])
        portfolio_returns = returns_data.dot(weights_array)

        # Calculate all metrics
        var_metrics = self._calculate_var(portfolio_returns)
        sharpe_ratio = self._calculate_sharpe(portfolio_returns)
        max_drawdown = self._calculate_max_drawdown(aligned_data, weights_array)
        correlation_matrix = self._calculate_correlation_matrix(returns_data, tickers)

        # Calculate beta if benchmark data provided
        beta_metrics = {}
        if benchmark_data is not None and not benchmark_data.empty:
            beta_metrics = self._calculate_beta(portfolio_returns, benchmark_data)

        # Portfolio statistics
        portfolio_stats = self._calculate_portfolio_statistics(portfolio_returns, aligned_data, weights_array)

        return {
            "calculated_at": datetime.now().isoformat(),
            "portfolio_weights": normalized_weights,
            "data_points": len(portfolio_returns),
            "period": {
                "start_date": aligned_data.index[0].strftime("%Y-%m-%d"),
                "end_date": aligned_data.index[-1].strftime("%Y-%m-%d")
            },
            "value_at_risk": var_metrics,
            "sharpe_ratio": sharpe_ratio,
            "beta": beta_metrics,
            "max_drawdown": max_drawdown,
            "correlation_matrix": correlation_matrix,
            "portfolio_statistics": portfolio_stats
        }

    def _align_price_data(self, price_data: Dict[str, pd.DataFrame], tickers: List[str]) -> Optional[pd.DataFrame]:
        """Align price data to common date range and create a DataFrame."""
        try:
            # Extract close prices for each ticker
            close_series = {}

            for ticker in tickers:
                if ticker not in price_data:
                    return None

                df = price_data[ticker]

                # Handle different DataFrame structures
                if isinstance(df, pd.DataFrame):
                    if 'Close' in df.columns:
                        close_prices = df['Close']
                    elif 'close' in df.columns:
                        close_prices = df['close']
                    elif len(df.columns) == 1:
                        close_prices = df.iloc[:, 0]
                    else:
                        # Assume first column is close price
                        close_prices = df.iloc[:, 0]
                else:
                    close_prices = pd.Series(df)

                close_series[ticker] = close_prices.dropna()

            # Create DataFrame and forward-fill missing values
            aligned = pd.DataFrame(close_series)

            # Drop any rows with NaN values
            aligned = aligned.dropna()

            return aligned

        except Exception as e:
            print(f"Error aligning price data: {e}")
            return None

    def _calculate_returns(self, price_data: pd.DataFrame) -> pd.DataFrame:
        """Calculate daily returns for all assets."""
        return price_data.pct_change().dropna()

    def _calculate_var(self, portfolio_returns: pd.Series, confidence_levels: List[float] = None) -> Dict:
        """
        Calculate Value at Risk using historical simulation.

        Args:
            portfolio_returns: Series of portfolio daily returns
            confidence_levels: List of confidence levels (default [0.95, 0.99])

        Returns:
            Dict with VaR metrics at different time horizons
        """
        if confidence_levels is None:
            confidence_levels = [0.95, 0.99]

        returns_array = portfolio_returns.dropna().values

        var_results = {}

        for confidence in confidence_levels:
            # Historical simulation VaR
            var_daily = np.percentile(returns_array, (1 - confidence) * 100)

            # Scale to different time horizons using square root of time
            var_weekly = var_daily * np.sqrt(5)
            var_monthly = var_daily * np.sqrt(21)
            var_annual = var_daily * np.sqrt(252)

            # Convert to percentages
            var_results[f"{int(confidence * 100)}%"] = {
                "daily_percent": round(float(var_daily), 4),
                "weekly_percent": round(float(var_weekly), 4),
                "monthly_percent": round(float(var_monthly), 4),
                "annual_percent": round(float(var_annual), 4),
                "expected_shortfall_daily_percent": round(float(returns_array[returns_array <= var_daily].mean()), 4)
            }

        return var_results

    def _calculate_sharpe(self, portfolio_returns: pd.Series) -> Dict:
        """
        Calculate Sharpe Ratio (annualized).

        Args:
            portfolio_returns: Series of portfolio daily returns

        Returns:
            Dict with Sharpe ratio and related metrics
        """
        returns_array = portfolio_returns.dropna()

        # Daily statistics
        mean_daily_return = returns_array.mean()
        std_daily_return = returns_array.std()

        # Annualized statistics
        mean_annual_return = mean_daily_return * 252
        std_annual_return = std_daily_return * np.sqrt(252)

        # Sharpe Ratio
        if std_annual_return == 0:
            sharpe_ratio = 0.0
        else:
            sharpe_ratio = (mean_annual_return - self.risk_free_rate) / std_annual_return

        # Sortino Ratio (downside deviation)
        negative_returns = returns_array[returns_array < 0]
        if len(negative_returns) > 0:
            downside_deviation = negative_returns.std() * np.sqrt(252)
            sortino_ratio = (mean_annual_return - self.risk_free_rate) / downside_deviation if downside_deviation != 0 else 0.0
        else:
            sortino_ratio = 0.0

        return {
            "sharpe_ratio": round(float(sharpe_ratio), 3),
            "sortino_ratio": round(float(sortino_ratio), 3),
            "annual_return_percent": round(float(mean_annual_return * 100), 2),
            "annual_volatility_percent": round(float(std_annual_return * 100), 2),
            "risk_free_rate": round(float(self.risk_free_rate), 3)
        }

    def _calculate_beta(
        self,
        portfolio_returns: pd.Series,
        benchmark_data: pd.DataFrame
    ) -> Dict:
        """
        Calculate portfolio beta vs benchmark (SPY).

        Args:
            portfolio_returns: Series of portfolio daily returns
            benchmark_data: DataFrame with benchmark 'Close' prices

        Returns:
            Dict with beta and related metrics
        """
        try:
            # Get benchmark close prices
            if 'Close' in benchmark_data.columns:
                benchmark_prices = benchmark_data['Close']
            elif 'close' in benchmark_data.columns:
                benchmark_prices = benchmark_data['close']
            else:
                benchmark_prices = benchmark_data.iloc[:, 0]

            # Calculate benchmark returns
            benchmark_returns = benchmark_prices.pct_change().dropna()

            # Align dates
            aligned_data = pd.DataFrame({
                'portfolio': portfolio_returns,
                'benchmark': benchmark_returns
            }).dropna()

            if len(aligned_data) < 2:
                return {"error": "Insufficient data for beta calculation"}

            # Calculate beta using covariance
            covariance = aligned_data.cov().iloc[0, 1]
            benchmark_variance = aligned_data['benchmark'].var()

            if benchmark_variance == 0:
                beta = 1.0
            else:
                beta = covariance / benchmark_variance

            # Calculate alpha (annualized)
            portfolio_mean = aligned_data['portfolio'].mean() * 252
            benchmark_mean = aligned_data['benchmark'].mean() * 252
            alpha = portfolio_mean - (self.risk_free_rate + beta * (benchmark_mean - self.risk_free_rate))

            # Calculate R-squared
            correlation = aligned_data.corr().iloc[0, 1]
            r_squared = correlation ** 2

            return {
                "beta": round(float(beta), 3),
                "alpha_annual_percent": round(float(alpha * 100), 3),
                "r_squared": round(float(r_squared), 3),
                "correlation": round(float(correlation), 3),
                "interpretation": self._interpret_beta(beta)
            }

        except Exception as e:
            return {"error": f"Could not calculate beta: {str(e)}"}

    def _interpret_beta(self, beta: float) -> str:
        """Provide interpretation of beta value."""
        if beta < 0.5:
            return "Much lower volatility than market"
        elif beta < 0.8:
            return "Lower volatility than market"
        elif beta < 1.2:
            return "Similar volatility to market"
        elif beta < 1.5:
            return "Higher volatility than market"
        else:
            return "Much higher volatility than market"

    def _calculate_max_drawdown(
        self,
        price_data: pd.DataFrame,
        weights: np.ndarray
    ) -> Dict:
        """
        Calculate maximum drawdown of the portfolio.

        Args:
            price_data: DataFrame of aligned close prices
            weights: Array of portfolio weights

        Returns:
            Dict with drawdown metrics
        """
        try:
            # Calculate portfolio value over time
            portfolio_value = price_data.dot(weights)

            # Calculate running maximum
            running_max = portfolio_value.expanding().max()

            # Calculate drawdown
            drawdown = (portfolio_value - running_max) / running_max

            # Find maximum drawdown
            max_drawdown = drawdown.min()

            # Find the dates of max drawdown
            max_dd_idx = drawdown.idxmin()
            peak_idx = portfolio_value[:max_dd_idx].idxmax()

            # Calculate drawdown duration in days
            drawdown_duration = (max_dd_idx - peak_idx).days

            # Calculate recovery duration (days to get back to peak)
            recovery_data = portfolio_value[max_dd_idx:]
            recovered = recovery_data[recovery_data >= portfolio_value[peak_idx]]

            if len(recovered) > 0:
                recovery_duration = (recovered.index[0] - max_dd_idx).days
            else:
                recovery_duration = None

            return {
                "max_drawdown_percent": round(float(max_drawdown * 100), 2),
                "peak_date": peak_idx.strftime("%Y-%m-%d"),
                "trough_date": max_dd_idx.strftime("%Y-%m-%d"),
                "drawdown_duration_days": drawdown_duration,
                "recovery_duration_days": recovery_duration,
                "current_drawdown_percent": round(float(drawdown.iloc[-1] * 100), 2)
            }

        except Exception as e:
            return {"error": f"Could not calculate max drawdown: {str(e)}"}

    def _calculate_correlation_matrix(
        self,
        returns_data: pd.DataFrame,
        tickers: List[str]
    ) -> Dict:
        """
        Calculate correlation matrix between holdings.

        Args:
            returns_data: DataFrame of daily returns
            tickers: List of ticker symbols

        Returns:
            Dict with correlation matrix
        """
        try:
            # Calculate correlation matrix
            corr_matrix = returns_data.corr()

            # Convert to nested dict for JSON serialization
            corr_dict = {
                tickers[i]: {
                    tickers[j]: round(float(corr_matrix.iloc[i, j]), 4)
                    for j in range(len(tickers))
                }
                for i in range(len(tickers))
            }

            # Also provide as a list of lists for easier chart rendering
            corr_array = corr_matrix.values.tolist()
            corr_array_rounded = [
                [round(float(val), 4) for val in row]
                for row in corr_array
            ]

            return {
                "tickers": tickers,
                "matrix": corr_dict,
                "array": corr_array_rounded
            }

        except Exception as e:
            return {"error": f"Could not calculate correlation matrix: {str(e)}"}

    def _calculate_portfolio_statistics(
        self,
        portfolio_returns: pd.Series,
        price_data: pd.DataFrame,
        weights: np.ndarray
    ) -> Dict:
        """Calculate additional portfolio statistics."""
        returns_array = portfolio_returns.dropna()

        # Calculate portfolio value progression
        portfolio_value = price_data.dot(weights)
        total_return = (portfolio_value.iloc[-1] / portfolio_value.iloc[0]) - 1

        # Calculate daily return statistics
        daily_mean = returns_array.mean()
        daily_std = returns_array.std()

        # Skewness and kurtosis
        skewness = stats.skew(returns_array.dropna())
        kurtosis = stats.kurtosis(returns_array.dropna())

        # Best and worst days
        best_day = returns_array.max()
        worst_day = returns_array.min()

        # Positive vs negative days
        positive_days = (returns_array > 0).sum()
        negative_days = (returns_array < 0).sum()
        total_days = len(returns_array)

        return {
            "total_return_percent": round(float(total_return * 100), 2),
            "daily_return_mean_percent": round(float(daily_mean * 100), 4),
            "daily_return_std_percent": round(float(daily_std * 100), 4),
            "skewness": round(float(skewness), 3),
            "excess_kurtosis": round(float(kurtosis), 3),
            "best_day_percent": round(float(best_day * 100), 2),
            "worst_day_percent": round(float(worst_day * 100), 2),
            "positive_days": int(positive_days),
            "negative_days": int(negative_days),
            "win_rate_percent": round(float(positive_days / total_days * 100), 1) if total_days > 0 else 0
        }

    def calculate_risk_contribution(
        self,
        portfolio_weights: Dict[str, float],
        price_data: Dict[str, pd.DataFrame]
    ) -> Dict:
        """
        Calculate risk contribution of each asset to the portfolio.

        Args:
            portfolio_weights: Dict of {ticker: weight}
            price_data: Dict of {ticker: DataFrame} with 'Close' prices

        Returns:
            Dict with marginal and component VaR contribution
        """
        tickers = list(portfolio_weights.keys())
        aligned_data = self._align_price_data(price_data, tickers)

        if aligned_data is None or aligned_data.empty:
            return {"error": "Could not align price data"}

        returns_data = self._calculate_returns(aligned_data)
        weights_array = np.array([portfolio_weights[t] for t in tickers])
        portfolio_returns = returns_data.dot(weights_array)

        # Portfolio volatility
        cov_matrix = returns_data.cov().values
        portfolio_variance = weights_array.T @ cov_matrix @ weights_array
        portfolio_volatility = np.sqrt(portfolio_variance)

        # Marginal VaR contribution
        # MVaR_i = VaR_p * (w_i * Cov(r_i, r_p)) / Var(r_p)
        marginal_var = {}
        component_var = {}
        percentage_contribution = {}

        # Calculate 95% VaR
        var_95 = np.percentile(portfolio_returns, 5)

        for i, ticker in enumerate(tickers):
            # Marginal contribution to portfolio variance
            marginal_contrib = (cov_matrix[i, :] @ weights_array) / portfolio_variance

            # Component VaR
            component_var_i = var_95 * weights_array[i] * marginal_contrib

            # Percentage contribution
            pct_contrib = (component_var_i / var_95) * 100 if var_95 != 0 else 0

            marginal_var[ticker] = round(float(marginal_contrib), 4)
            component_var[ticker] = round(float(component_var_i), 4)
            percentage_contribution[ticker] = round(float(pct_contrib), 2)

        return {
            "marginal_var_contribution": marginal_var,
            "component_var": component_var,
            "percentage_contribution": percentage_contribution
        }


# Singleton instance
risk_engine = RiskEngine()
