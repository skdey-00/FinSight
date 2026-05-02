"""
Market Service - Market Data
"""
from typing import Dict, List
from datetime import datetime, timedelta
import random


class MarketService:
    def __init__(self):
        pass

    async def get_market_overview(self) -> Dict:
        """Get overall market overview and indices"""
        return {
            "indices": [
                {"symbol": "SPX", "name": "S&P 500", "value": 5234.18, "change": 1.23, "changePercent": 0.02},
                {"symbol": "DJI", "name": "Dow Jones", "value": 39512.84, "change": -45.22, "changePercent": -0.11},
                {"symbol": "IXIC", "name": "NASDAQ", "value": 16428.82, "change": 125.34, "changePercent": 0.77},
                {"symbol": "VIX", "name": "Volatility Index", "value": 13.45, "change": -0.82, "changePercent": -5.75},
            ],
            "market_status": "open",
            "last_updated": datetime.now().isoformat()
        }

    async def get_stock_data(self, symbol: str) -> Dict | None:
        """Get detailed stock information"""
        stocks = {
            "AAPL": {
                "symbol": "AAPL", "name": "Apple Inc.", "price": 188.87,
                "change": 2.34, "changePercent": 1.25, "volume": 52341234,
                "marketCap": 2950000000000, "pe": 29.5, "eps": 6.42,
                "high52w": 199.62, "low52w": 164.08, "sector": "Technology"
            },
            "GOOGL": {
                "symbol": "GOOGL", "name": "Alphabet Inc.", "price": 153.71,
                "change": -1.23, "changePercent": -0.79, "volume": 23456789,
                "marketCap": 1920000000000, "pe": 25.3, "eps": 6.06,
                "high52w": 158.32, "low52w": 115.23, "sector": "Technology"
            },
            "MSFT": {
                "symbol": "MSFT", "name": "Microsoft Corporation", "price": 402.56,
                "change": 5.67, "changePercent": 1.43, "volume": 18234567,
                "marketCap": 2980000000000, "pe": 36.2, "eps": 11.12,
                "high52w": 420.82, "low52w": 309.45, "sector": "Technology"
            },
            "TSLA": {
                "symbol": "TSLA", "name": "Tesla Inc.", "price": 218.89,
                "change": -3.45, "changePercent": -1.55, "volume": 98765432,
                "marketCap": 695000000000, "pe": 72.4, "eps": 3.02,
                "high52w": 299.29, "low52w": 152.37, "sector": "Consumer Cyclical"
            },
            "NVDA": {
                "symbol": "NVDA", "name": "NVIDIA Corporation", "price": 594.91,
                "change": 12.34, "changePercent": 2.12, "volume": 45678901,
                "marketCap": 1460000000000, "pe": 68.5, "eps": 8.68,
                "high52w": 604.90, "low52w": 216.18, "sector": "Technology"
            }
        }
        return stocks.get(symbol.upper())

    async def get_historical_data(self, symbol: str, period: str, interval: str) -> List[Dict]:
        """Get historical price data"""
        periods = {"1d": 1, "5d": 5, "1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "5y": 365}
        days = periods.get(period, 30)

        data = []
        base_price = 150.0 + hash(symbol) % 100  # Deterministic but varied base price

        for i in range(days):
            date = datetime.now() - timedelta(days=days-i)
            change = random.uniform(-3, 3)
            open_price = base_price + change
            close_price = open_price + random.uniform(-2, 2)
            high_price = max(open_price, close_price) + random.uniform(0, 1)
            low_price = min(open_price, close_price) - random.uniform(0, 1)
            volume = random.randint(10000000, 50000000)

            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": volume
            })
            base_price = close_price

        return data

    async def get_crypto_prices(self) -> List[Dict]:
        """Get top cryptocurrency prices"""
        return [
            {"symbol": "BTC", "name": "Bitcoin", "price": 43250.00, "change": 1.25, "changePercent": 0.29, "marketCap": 845000000000},
            {"symbol": "ETH", "name": "Ethereum", "price": 2280.00, "change": -15.50, "changePercent": -0.68, "marketCap": 274000000000},
            {"symbol": "BNB", "name": "Binance Coin", "price": 320.50, "change": 3.20, "changePercent": 1.01, "marketCap": 49000000000},
            {"symbol": "SOL", "name": "Solana", "price": 98.75, "change": -2.30, "changePercent": -2.28, "marketCap": 42000000000},
            {"symbol": "XRP", "name": "XRP", "price": 0.56, "change": 0.01, "changePercent": 1.82, "marketCap": 30000000000}
        ]

    async def get_market_news(self, category: str, limit: int) -> List[Dict]:
        """Get latest market news"""
        news_items = [
            {"title": "Fed signals potential rate cuts in 2025 as inflation cools", "source": "Reuters", "timestamp": datetime.now().isoformat(), "sentiment": "positive"},
            {"title": "Tech stocks rally on AI optimism, NASDAQ up 0.77%", "source": "Bloomberg", "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "sentiment": "positive"},
            {"title": "Oil prices surge 5% on supply concerns from Middle East", "source": "CNBC", "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(), "sentiment": "neutral"},
            {"title": "Bank earnings beat expectations, financial sector gains", "source": "WSJ", "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(), "sentiment": "positive"},
            {"title": "Market volatility rises as VIX hits 2-month high", "source": "MarketWatch", "timestamp": (datetime.now() - timedelta(hours=8)).isoformat(), "sentiment": "negative"},
            {"title": "Consumer spending shows resilience in holiday season", "source": "Bloomberg", "timestamp": (datetime.now() - timedelta(hours=12)).isoformat(), "sentiment": "positive"},
            {"title": "Housing market cooldown continues as mortgage rates rise", "source": "Reuters", "timestamp": (datetime.now() - timedelta(hours=18)).isoformat(), "sentiment": "negative"},
            {"title": "Bitcoin holds steady above $43,000 amid ETF anticipation", "source": "CoinDesk", "timestamp": (datetime.now() - timedelta(hours=24)).isoformat(), "sentiment": "neutral"}
        ]

        return news_items[:limit]

    async def get_economic_calendar(self, days: int) -> List[Dict]:
        """Get upcoming economic events"""
        events = [
            {"date": "2025-01-18", "time": "08:30", "event": "CPI Data Release", "impact": "high", "forecast": "0.2%", "previous": "0.1%"},
            {"date": "2025-01-19", "time": "10:00", "event": "Existing Home Sales", "impact": "medium", "forecast": "4.15M", "previous": "4.10M"},
            {"date": "2025-01-22", "time": "14:00", "event": "FOMC Minutes", "impact": "high", "forecast": "-", "previous": "-"},
            {"date": "2025-01-24", "time": "08:30", "event": "GDP Advance Estimate", "impact": "high", "forecast": "2.0%", "previous": "2.1%"},
            {"date": "2025-01-26", "time": "08:30", "event": "PCE Price Index", "impact": "high", "forecast": "0.2%", "previous": "0.1%"},
            {"date": "2025-01-27", "time": "10:00", "event": "Consumer Confidence", "impact": "medium", "forecast": "105.0", "previous": "104.5"},
            {"date": "2025-01-30", "time": "08:30", "event": "Employment Cost Index", "impact": "medium", "forecast": "0.9%", "previous": "0.8%"}
        ]

        # Filter events within specified days
        cutoff_date = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
        return [e for e in events if e["date"] <= cutoff_date]
