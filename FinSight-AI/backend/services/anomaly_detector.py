"""
Anomaly Detector - Detect unusual price movements and concentration risks

Uses Z-score normalization on 60-day price history to flag anomalies:
- Returns > 2 standard deviations from mean
- Concentration risk (>50% in single ticker)
- Volume spikes
- Price gaps
"""
import numpy as np
import pandas as pd
import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class AnomalyDetector:
    def __init__(self):
        """Initialize the Anomaly Detector."""
        self.lookback_days = 60
        self.z_score_threshold = 2.0  # Flag anomalies beyond 2 std devs
        self.concentration_threshold = 50.0  # 50% concentration threshold

    async def detect_anomalies(
        self,
        tickers: List[str],
        portfolio_weights: Optional[Dict[str, float]] = None,
        lookback_days: Optional[int] = None
    ) -> Dict:
        """
        Detect anomalies in the given tickers.

        Args:
            tickers: List of ticker symbols
            portfolio_weights: Optional dict of {ticker: weight_percent} for concentration checks
            lookback_days: Days to look back (default: 60)

        Returns:
            Dict with list of detected anomalies
        """
        if lookback_days:
            self.lookback_days = lookback_days

        anomalies = []
        tickers = [t.upper() for t in tickers]

        # Fetch price data for all tickers
        price_data = await self._fetch_price_data(tickers)

        if not price_data:
            return {
                "detected_at": datetime.now().isoformat(),
                "tickers_analyzed": tickers,
                "lookback_period_days": self.lookback_days,
                "anomalies": [],
                "summary": {
                    "total_anomalies": 0,
                    "by_severity": {"low": 0, "medium": 0, "high": 0, "critical": 0}
                },
                "error": "No price data available"
            }

        # Detect price return anomalies for each ticker
        for ticker in tickers:
            if ticker in price_data:
                ticker_anomalies = self._detect_return_anomalies(ticker, price_data[ticker])
                anomalies.extend(ticker_anomalies)

                # Detect volume anomalies
                volume_anomalies = self._detect_volume_anomalies(ticker, price_data[ticker])
                anomalies.extend(volume_anomalies)

                # Detect price gaps
                gap_anomalies = self._detect_gap_anomalies(ticker, price_data[ticker])
                anomalies.extend(gap_anomalies)

        # Detect concentration risk if weights provided
        if portfolio_weights:
            concentration_anomalies = self._detect_concentration_risk(
                portfolio_weights,
                tickers
            )
            anomalies.extend(concentration_anomalies)

        # Sort anomalies by date (newest first) and severity
        anomalies.sort(key=lambda x: (
            x.get("date", ""),
            {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x.get("severity", "low"), 4)
        ), reverse=True)

        # Generate summary
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        for anomaly in anomalies:
            severity = anomaly.get("severity", "low")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        return {
            "detected_at": datetime.now().isoformat(),
            "tickers_analyzed": tickers,
            "lookback_period_days": self.lookback_days,
            "anomalies": anomalies,
            "summary": {
                "total_anomalies": len(anomalies),
                "by_severity": severity_counts
            }
        }

    async def _fetch_price_data(self, tickers: List[str]) -> Dict[str, pd.DataFrame]:
        """Fetch historical price data for all tickers."""
        price_data = {}

        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=self.lookback_days + 10)  # Buffer for weekends

        try:
            # Download data for all tickers at once
            data = yf.download(
                tickers,
                start=start_date.strftime("%Y-%m-%d"),
                end=end_date.strftime("%Y-%m-%d"),
                progress=False,
                group_by='ticker'
            )

            # Process data for each ticker
            for ticker in tickers:
                if len(tickers) == 1:
                    df = data
                else:
                    if ticker in data.columns.get_level_values(0):
                        df = data[ticker]
                    else:
                        continue

                # Clean and validate data
                df = df.dropna()
                if len(df) >= 20:  # Minimum 20 days of data
                    price_data[ticker] = df

        except Exception as e:
            print(f"Error fetching price data: {e}")

        return price_data

    def _detect_return_anomalies(self, ticker: str, data: pd.DataFrame) -> List[Dict]:
        """Detect return anomalies using Z-score normalization."""
        anomalies = []

        # Calculate daily returns
        data = data.copy()
        data['Return'] = data['Close'].pct_change() * 100

        # Remove NaN returns
        returns = data['Return'].dropna()

        if len(returns) < 10:
            return anomalies

        # Calculate Z-scores
        mean_return = returns.mean()
        std_return = returns.std()

        if std_return == 0:
            return anomalies

        z_scores = (returns - mean_return) / std_return

        # Flag anomalies beyond threshold
        for date, z_score in z_scores.items():
            if abs(z_score) > self.z_score_threshold:
                return_value = returns.loc[date]
                direction = "spike" if return_value > 0 else "drop"

                severity = "low"
                if abs(z_score) > 3:
                    severity = "critical"
                elif abs(z_score) > 2.5:
                    severity = "high"
                elif abs(z_score) > 2.2:
                    severity = "medium"

                anomalies.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "ticker": ticker,
                    "type": "return_anomaly",
                    "severity": severity,
                    "z_score": round(float(z_score), 2),
                    "return_percent": round(float(return_value), 2),
                    "description": self._generate_return_description(
                        ticker, date, return_value, z_score
                    )
                })

        return anomalies

    def _detect_volume_anomalies(self, ticker: str, data: pd.DataFrame) -> List[Dict]:
        """Detect volume spikes using Z-score."""
        anomalies = []

        if 'Volume' not in data.columns:
            return anomalies

        volume = data['Volume'].dropna()

        if len(volume) < 10:
            return anomalies

        # Calculate Z-scores for volume
        mean_volume = volume.mean()
        std_volume = volume.std()

        if std_volume == 0:
            return anomalies

        z_scores = (volume - mean_volume) / std_volume

        # Flag significant volume spikes (> 2.5 std devs)
        for date, z_score in z_scores.items():
            if z_score > 2.5:
                volume_value = volume.loc[date]
                avg_volume = mean_volume

                severity = "medium"
                if z_score > 4:
                    severity = "critical"
                elif z_score > 3:
                    severity = "high"

                anomalies.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "ticker": ticker,
                    "type": "volume_spike",
                    "severity": severity,
                    "z_score": round(float(z_score), 2),
                    "volume": int(volume_value),
                    "avg_volume": int(avg_volume),
                    "description": self._generate_volume_description(
                        ticker, date, volume_value, avg_volume
                    )
                })

        return anomalies

    def _detect_gap_anomalies(self, ticker: str, data: pd.DataFrame) -> List[Dict]:
        """Detect price gaps (overnight gaps)."""
        anomalies = []

        # Calculate gap from previous close to open
        data = data.copy()
        data['Gap'] = ((data['Open'] - data['Close'].shift(1)) / data['Close'].shift(1)) * 100

        gaps = data['Gap'].dropna()

        if len(gaps) < 10:
            return anomalies

        # Calculate Z-scores for gaps
        mean_gap = gaps.mean()
        std_gap = gaps.std()

        if std_gap == 0:
            return anomalies

        z_scores = (gaps - mean_gap) / std_gap

        # Flag significant gaps (> 2 std devs)
        for date, z_score in z_scores.items():
            if abs(z_score) > 2.0:
                gap_value = gaps.loc[date]

                severity = "medium"
                if abs(z_score) > 3:
                    severity = "critical"
                elif abs(z_score) > 2.5:
                    severity = "high"

                direction = "up" if gap_value > 0 else "down"

                anomalies.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "ticker": ticker,
                    "type": "price_gap",
                    "severity": severity,
                    "z_score": round(float(z_score), 2),
                    "gap_percent": round(float(gap_value), 2),
                    "description": self._generate_gap_description(
                        ticker, date, gap_value, direction
                    )
                })

        return anomalies

    def _detect_concentration_risk(
        self,
        weights: Dict[str, float],
        tickers: List[str]
    ) -> List[Dict]:
        """Detect concentration risk in portfolio."""
        anomalies = []

        total_weight = sum(weights.values())

        for ticker, weight in weights.items():
            # Normalize to percentage
            weight_percent = (weight / total_weight) * 100 if total_weight > 0 else 0

            if weight_percent > self.concentration_threshold:
                severity = "high"
                if weight_percent > 70:
                    severity = "critical"

                anomalies.append({
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "ticker": ticker,
                    "type": "concentration_risk",
                    "severity": severity,
                    "weight_percent": round(weight_percent, 2),
                    "description": self._generate_concentration_description(
                        ticker, weight_percent
                    )
                })

        return anomalies

    def _generate_return_description(
        self,
        ticker: str,
        date,
        return_value: float,
        z_score: float
    ) -> str:
        """Generate plain-English description for return anomaly."""
        direction = "surged" if return_value > 0 else "plunged"
        magnitude = abs(return_value)

        if magnitude > 5:
            level = "dramatically"
        elif magnitude > 3:
            level = "sharply"
        else:
            level = "unusually"

        return (
            f"{ticker} {direction} {level} on {date.strftime('%B %d')} "
            f"with a {magnitude:.2f}% move ({abs(z_score):.1f}x standard deviation). "
            f"This is an abnormal price movement worth investigating."
        )

    def _generate_volume_description(
        self,
        ticker: str,
        date,
        volume: float,
        avg_volume: float
    ) -> str:
        """Generate plain-English description for volume anomaly."""
        multiple = volume / avg_volume if avg_volume > 0 else 1

        return (
            f"{ticker} trading volume spiked to {volume:,.0f} shares on {date.strftime('%B %d')}, "
            f"approximately {multiple:.1f}x the normal average of {avg_volume:,.0f}. "
            f"This unusual activity may indicate significant news or institutional trading."
        )

    def _generate_gap_description(
        self,
        ticker: str,
        date,
        gap_value: float,
        direction: str
    ) -> str:
        """Generate plain-English description for gap anomaly."""
        return (
            f"{ticker} gapped {direction} {abs(gap_value):.2f}% at the open on {date.strftime('%B %d')}. "
            f"This overnight gap suggests after-hours news or a shift in market sentiment."
        )

    def _generate_concentration_description(
        self,
        ticker: str,
        weight_percent: float
    ) -> str:
        """Generate plain-English description for concentration risk."""
        return (
            f"Concentration Alert: {ticker} makes up {weight_percent:.1f}% of your portfolio, "
            f"exceeding the 50% threshold. A single declining stock could significantly impact "
            f"your overall portfolio value. Consider diversifying."
        )

    async def get_anomaly_summary(
        self,
        tickers: List[str],
        portfolio_weights: Optional[Dict[str, float]] = None
    ) -> Dict:
        """
        Get a summary of anomalies without full details.

        Args:
            tickers: List of ticker symbols
            portfolio_weights: Optional portfolio weights

        Returns:
            Summary of anomalies found
        """
        result = await self.detect_anomalies(tickers, portfolio_weights)

        return {
            "tickers": tickers,
            "has_anomalies": result["summary"]["total_anomalies"] > 0,
            "total_count": result["summary"]["total_anomalies"],
            "critical_count": result["summary"]["by_severity"].get("critical", 0),
            "high_count": result["summary"]["by_severity"].get("high", 0),
            "needs_attention": (
                result["summary"]["by_severity"].get("critical", 0) > 0 or
                result["summary"]["by_severity"].get("high", 0) > 2
            ),
            "last_analyzed": result["detected_at"]
        }


# Singleton instance
anomaly_detector = AnomalyDetector()
