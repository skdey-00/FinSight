"""
Market Data Service - Uses yfinance to fetch and process stock data
"""
import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta


class MarketDataService:
    def __init__(self):
        self.default_period = "1y"  # 1 year of historical data
        self.volatility_window = 30  # 30-day rolling volatility

    async def get_market_data(
        self,
        tickers: List[str],
        period: str = "1y"
    ) -> Dict:
        """
        Fetch comprehensive market data for a list of tickers

        Args:
            tickers: List of stock ticker symbols
            period: Historical data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)

        Returns:
            Dict containing historical data, daily returns, volatility, and current info
        """
        if not tickers:
            return {"error": "No tickers provided"}

        # Fetch historical data for all tickers at once
        historical_data = await self._fetch_historical_data(tickers, period)

        # Fetch current info for each ticker
        current_info = await self._fetch_current_info(tickers)

        # Calculate metrics for each ticker
        ticker_metrics = {}
        for ticker in tickers:
            ticker_data = historical_data.get(ticker)
            if ticker_data is not None and not ticker_data.empty:
                ticker_metrics[ticker] = self._calculate_ticker_metrics(ticker_data)
            else:
                ticker_metrics[ticker] = {"error": f"No data available for {ticker}"}

        return {
            "tickers": tickers,
            "period": period,
            "data_updated": datetime.now().isoformat(),
            "historical_data": self._format_historical_for_json(historical_data, tickers),
            "metrics": ticker_metrics,
            "current_info": current_info
        }

    async def _fetch_historical_data(
        self,
        tickers: List[str],
        period: str
    ) -> Dict[str, pd.DataFrame]:
        """Fetch historical price data from Yahoo Finance"""
        try:
            # Download data for all tickers
            data = yf.download(
                tickers,
                period=period,
                progress=False,
                group_by='ticker'
            )

            # If single ticker, yfinance returns a DataFrame without MultiIndex columns
            if len(tickers) == 1:
                # Ensure we have the expected columns
                if isinstance(data, pd.DataFrame) and not data.empty:
                    # Reset the index to have Date as a column
                    data = data.reset_index()
                    # Ensure we have the required columns
                    required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
                    if all(col in data.columns for col in required_cols):
                        data = data.set_index('Date')
                        return {tickers[0]: data}
                    else:
                        print(f"Missing columns for {tickers[0]}: {data.columns.tolist()}")
                        return self._get_mock_historical_data(tickers)
                return {tickers[0]: data}

            # Multiple tickers - return dict of DataFrames
            result = {}
            for ticker in tickers:
                try:
                    if ticker in data.columns.get_level_values(0):
                        ticker_data = data[ticker].copy()
                        # Drop rows with NaN values
                        ticker_data = ticker_data.dropna()
                        result[ticker] = ticker_data
                except Exception as e:
                    print(f"Error processing {ticker}: {e}")
                    # Use mock data for this ticker
                    mock_data = self._get_mock_historical_data([ticker])
                    if ticker in mock_data:
                        result[ticker] = mock_data[ticker]

            return result if result else self._get_mock_historical_data(tickers)

        except Exception as e:
            print(f"Error fetching historical data: {e}")
            # Return mock data for development/testing
            return self._get_mock_historical_data(tickers)

    async def _fetch_current_info(self, tickers: List[str]) -> Dict[str, Dict]:
        """Fetch current price and market cap for each ticker"""
        current_info = {}

        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                # Get recent price data first (more reliable than .info)
                hist = stock.history(period="5d")

                if hist.empty:
                    raise Exception(f"No historical data for {ticker}")

                latest_close = float(hist['Close'].iloc[-1])

                # Try to get additional info, but don't fail if it's not available
                try:
                    info = stock.info
                    current_price = info.get("currentPrice") or info.get("regularMarketPrice") or latest_close
                except:
                    current_price = latest_close

                current_info[ticker] = {
                    "current_price": round(current_price, 2),
                    "previous_close": round(float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price * 0.99, 2),
                    "latest_close": round(latest_close, 2),
                    "currency": "USD",
                    "is_mock": False
                }

                # Try to get additional info if available
                try:
                    info = stock.info
                    current_info[ticker].update({
                        "market_cap": info.get("marketCap"),
                        "exchange": info.get("exchange"),
                        "sector": info.get("sector"),
                        "industry": info.get("industry"),
                        "52_week_high": info.get("fiftyTwoWeekHigh"),
                        "52_week_low": info.get("fiftyTwoWeekLow"),
                    })
                except:
                    pass

            except Exception as e:
                print(f"Error fetching info for {ticker}: {e}")
                # Use mock data as fallback
                mock_info = self._get_mock_current_info([ticker])
                if ticker in mock_info:
                    current_info[ticker] = mock_info[ticker]
                else:
                    current_info[ticker] = {"error": str(e), "is_mock": True}

        return current_info

    def _calculate_ticker_metrics(self, data: pd.DataFrame) -> Dict:
        """Calculate returns and volatility metrics"""
        # Calculate daily returns
        data['daily_return'] = data['Close'].pct_change() * 100

        # Calculate rolling volatility (30-day standard deviation of returns, annualized)
        data['rolling_volatility'] = data['daily_return'].rolling(
            window=self.volatility_window
        ).std() * np.sqrt(252)  # Annualized

        # Get the most recent values
        latest = data.iloc[-1]

        return {
            "latest_price": round(float(latest['Close']), 2),
            "latest_date": latest.name.strftime("%Y-%m-%d") if hasattr(latest.name, 'strftime') else str(latest.name),
            "daily_return_percent": round(float(latest['daily_return']) if pd.notna(latest['daily_return']) else 0, 4),
            "rolling_volatility_annual": round(float(latest['rolling_volatility']) if pd.notna(latest['rolling_volatility']) else 0, 2),
            "avg_daily_return": round(float(data['daily_return'].mean()), 4),
            "std_daily_return": round(float(data['daily_return'].std()), 4),
            "total_return_percent": round(((data['Close'].iloc[-1] / data['Close'].iloc[0]) - 1) * 100, 2),
            "max_drawdown_percent": round(self._calculate_max_drawdown(data['Close']), 2),
            "sharpe_ratio": round(self._calculate_sharpe_ratio(data['daily_return']), 2)
        }

    def _calculate_max_drawdown(self, prices: pd.Series) -> float:
        """Calculate maximum drawdown percentage"""
        rolling_max = prices.expanding().max()
        drawdown = ((prices - rolling_max) / rolling_max) * 100
        return float(drawdown.min())

    def _calculate_sharpe_ratio(self, returns: pd.Series, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio (annualized)"""
        # Remove NaN values
        clean_returns = returns.dropna()

        if len(clean_returns) == 0 or clean_returns.std() == 0:
            return 0.0

        # Annualized return
        avg_return = clean_returns.mean() * 252
        # Annualized volatility
        std_return = clean_returns.std() * np.sqrt(252)

        if std_return == 0:
            return 0.0

        return (avg_return - risk_free_rate) / std_return

    def _format_historical_for_json(
        self,
        data_dict: Dict[str, pd.DataFrame],
        tickers: List[str]
    ) -> Dict[str, List[Dict]]:
        """Format historical DataFrames for JSON response"""
        formatted = {}

        for ticker in tickers:
            if ticker not in data_dict or data_dict[ticker].empty:
                formatted[ticker] = []
                continue

            df = data_dict[ticker].copy()
            df.reset_index(inplace=True)

            # Convert to list of dicts
            formatted[ticker] = [
                {
                    "date": row['Date'].strftime("%Y-%m-%d") if hasattr(row['Date'], 'strftime') else str(row['Date']),
                    "open": round(float(row['Open']), 2) if pd.notna(row['Open']) else None,
                    "high": round(float(row['High']), 2) if pd.notna(row['High']) else None,
                    "low": round(float(row['Low']), 2) if pd.notna(row['Low']) else None,
                    "close": round(float(row['Close']), 2) if pd.notna(row['Close']) else None,
                    "volume": int(row['Volume']) if pd.notna(row['Volume']) else None,
                    "daily_return_percent": round(float(row.get('daily_return', 0)), 4) if pd.notna(row.get('daily_return')) else None,
                    "rolling_volatility": round(float(row.get('rolling_volatility', 0)), 2) if pd.notna(row.get('rolling_volatility')) else None
                }
                for _, row in df.iterrows()
            ]

        return formatted

    async def get_single_ticker_data(self, ticker: str, period: str = "1y") -> Dict:
        """Get data for a single ticker (convenience method)"""
        result = await self.get_market_data([ticker], period)
        return result

    def _get_mock_historical_data(self, tickers: List[str]) -> Dict[str, pd.DataFrame]:
        """Generate mock historical data for development/testing when yfinance fails"""
        mock_data = {}
        import numpy as np
        from datetime import datetime, timedelta

        for ticker in tickers:
            dates = pd.date_range(end=datetime.now(), periods=252, freq='D')

            # Simulate price movement with random walk
            np.random.seed(hash(ticker) % 2**32)
            base_price = np.random.uniform(50, 500)
            returns = np.random.normal(0.001, 0.02, 252)
            prices = [base_price]

            for ret in returns[1:]:
                prices.append(prices[-1] * (1 + ret))

            # Generate OHLCV data
            data = {
                'Date': dates,
                'Open': [p * (1 + np.random.uniform(-0.01, 0.01)) for p in prices],
                'High': [p * (1 + np.random.uniform(0, 0.02)) for p in prices],
                'Low': [p * (1 - np.random.uniform(0, 0.02)) for p in prices],
                'Close': prices,
                'Volume': [int(np.random.uniform(1000000, 50000000)) for _ in range(252)]
            }

            mock_data[ticker] = pd.DataFrame(data)

        return mock_data

    def _get_mock_current_info(self, tickers: List[str]) -> Dict[str, Dict]:
        """Generate mock current info when yfinance fails"""
        mock_info = {}
        mock_prices = {
            'AAPL': 178.50,
            'TSLA': 248.30,
            'GOOGL': 141.80,
            'MSFT': 378.90,
            'AMZN': 178.25,
            'NVDA': 875.30,
            'META': 505.20,
            'BTC': 67500,
            'ETH': 3450
        }

        for ticker in tickers:
            price = mock_prices.get(ticker.upper(), np.random.uniform(50, 500))
            mock_info[ticker] = {
                "current_price": round(price, 2),
                "previous_close": round(price * np.random.uniform(0.98, 1.02), 2),
                "market_cap": int(np.random.uniform(1e11, 2e12)),
                "currency": "USD",
                "sector": "Technology",
                "52_week_high": round(price * 1.3, 2),
                "52_week_low": round(price * 0.7, 2),
                "shares_outstanding": int(np.random.uniform(1e9, 5e9)),
                "is_mock": True  # Flag to indicate this is simulated data
            }

        return mock_info


# Singleton instance
market_data_service = MarketDataService()
