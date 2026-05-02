"""
Market Data Routes
"""
from fastapi import APIRouter, HTTPException, Query
from services.market_service import MarketService
from services.market_data import market_data_service
import yfinance as yf

router = APIRouter()
market_service = MarketService()


@router.get("/prices")
async def get_current_prices(
    tickers: str = Query(..., description="Comma-separated list of stock tickers (e.g., AAPL,TSLA,GOOGL)")
):
    """
    Quick endpoint to get current prices for multiple tickers.
    Lightweight response for real-time price updates.

    Example: /api/market/prices?tickers=AAPL,TSLA,GOOGL

    Returns:
    {
        "success": true,
        "data": {
            "prices": {
                "AAPL": 175.50,
                "TSLA": 245.30,
                "GOOGL": 140.20
            },
            "updated_at": "2026-05-02T12:00:00"
        }
    }
    """
    try:
        from datetime import datetime

        ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]

        if not ticker_list:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")

        prices = {}

        for ticker in ticker_list:
            try:
                stock = yf.Ticker(ticker)
                # Get recent price data (faster than .info)
                hist = stock.history(period="2d")

                if hist.empty:
                    continue

                latest_price = float(hist['Close'].iloc[-1])
                prices[ticker] = round(latest_price, 2)

            except Exception as e:
                print(f"Error fetching price for {ticker}: {e}")
                # Skip failed tickers but continue with others
                continue

        return {
            "success": True,
            "data": {
                "prices": prices,
                "updated_at": datetime.now().isoformat()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prices: {str(e)}")


@router.get("/search")
async def search_stocks(
    q: str = Query(..., description="Search query (ticker or company name)")
):
    """
    Search for stocks by ticker symbol or company name.
    Uses a local database of popular stocks + fallback to yfinance.

    Example: /api/market/search?q=apple

    Returns:
    {
        "success": true,
        "data": {
            "results": [
                {"symbol": "AAPL", "name": "Apple Inc."},
                {"symbol": "AAPL.BA", "name": "Apple Inc. (Buenos Aires)"}
            ]
        }
    }
    """
    try:
        # Popular stocks database
        POPULAR_STOCKS = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corporation"},
            {"symbol": "GOOGL", "name": "Alphabet Inc. (Class A)"},
            {"symbol": "GOOG", "name": "Alphabet Inc. (Class C)"},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "NVDA", "name": "NVIDIA Corporation"},
            {"symbol": "META", "name": "Meta Platforms Inc."},
            {"symbol": "TSLA", "name": "Tesla Inc."},
            {"symbol": "BRK-B", "name": "Berkshire Hathaway Inc."},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
            {"symbol": "V", "name": "Visa Inc."},
            {"symbol": "JNJ", "name": "Johnson & Johnson"},
            {"symbol": "WMT", "name": "Walmart Inc."},
            {"symbol": "PG", "name": "Procter & Gamble Co."},
            {"symbol": "MA", "name": "Mastercard Inc."},
            {"symbol": "HD", "name": "Home Depot Inc."},
            {"symbol": "DIS", "name": "Walt Disney Co."},
            {"symbol": "NFLX", "name": "Netflix Inc."},
            {"symbol": "PYPL", "name": "PayPal Holdings Inc."},
            {"symbol": "INTC", "name": "Intel Corporation"},
            {"symbol": "AMD", "name": "Advanced Micro Devices"},
            {"symbol": "CRM", "name": "Salesforce Inc."},
            {"symbol": "ORCL", "name": "Oracle Corporation"},
            {"symbol": "ADBE", "name": "Adobe Inc."},
            {"symbol": "IBM", "name": "IBM"},
            {"symbol": "CSCO", "name": "Cisco Systems Inc."},
            {"symbol": "AVGO", "name": "Broadcom Inc."},
            {"symbol": "PEP", "name": "PepsiCo Inc."},
            {"symbol": "COST", "name": "Costco Wholesale"},
            {"symbol": "KO", "name": "Coca-Cola Company"},
            {"symbol": "MRK", "name": "Merck & Co. Inc."},
            {"symbol": "ABBV", "name": "AbbVie Inc."},
            {"symbol": "BAC", "name": "Bank of America Corp"},
            {"symbol": "WFC", "name": "Wells Fargo & Co."},
            {"symbol": "GS", "name": "Goldman Sachs Group"},
            {"symbol": "MS", "name": "Morgan Stanley"},
            {"symbol": "C", "name": "Citigroup Inc."},
            {"symbol": "AXP", "name": "American Express"},
            {"symbol": "BA", "name": "Boeing Company"},
            {"symbol": "CAT", "name": "Caterpillar Inc."},
            {"symbol": "CVX", "name": "Chevron Corporation"},
            {"symbol": "XOM", "name": "Exxon Mobil Corp."},
            {"symbol": "COP", "name": "ConocoPhillips"},
            {"symbol": "UNH", "name": "UnitedHealth Group"},
            {"symbol": "PFE", "name": "Pfizer Inc."},
            {"symbol": "T", "name": "AT&T Inc."},
            {"symbol": "VZ", "name": "Verizon Communications"},
            {"symbol": "NKE", "name": "Nike Inc."},
            {"symbol": "MCD", "name": "McDonald's Corp."},
            {"symbol": "SBUX", "name": "Starbucks Corp."},
            {"symbol": "BTC", "name": "Bitcoin"},
            {"symbol": "ETH", "name": "Ethereum"},
            {"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust"},
            {"symbol": "QQQ", "name": "Invesco QQQ Trust"},
            {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF"},
            {"symbol": "IWM", "name": "iShares Russell 2000 ETF"},
            {"symbol": "DIA", "name": "SPDR Dow Jones Industrial Average ETF"},
            {"symbol": "GLD", "name": "SPDR Gold Shares"},
            {"symbol": "SLV", "name": "iShares Silver Trust"},
            {"symbol": "TLT", "name": "iShares 20+ Year Treasury Bond"},
        ]

        query = q.strip().upper()

        if not query:
            return {
                "success": True,
                "data": {"results": POPULAR_STOCKS[:10]}
            }

        # Search in popular stocks first
        results = []
        for stock in POPULAR_STOCKS:
            if (query in stock["symbol"] or query in stock["name"].upper()):
                results.append(stock)

        # If we have good results, return them
        if len(results) >= 5:
            return {
                "success": True,
                "data": {"results": results[:10]}
            }

        # Otherwise, try to get info from yfinance for exact match
        if len(results) < 3:
            try:
                ticker = yf.Ticker(query)
                info = ticker.info
                if info and "longName" in info:
                    new_result = {
                        "symbol": query,
                        "name": info.get("longName", info.get("shortName", query))
                    }
                    # Add to front if not already in results
                    if not any(r["symbol"] == query for r in results):
                        results.insert(0, new_result)
            except:
                pass

        return {
            "success": True,
            "data": {"results": results[:10]}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching stocks: {str(e)}")


@router.get("/company-info")
async def get_company_info(
    ticker: str = Query(..., description="Stock ticker symbol")
):
    """
    Get company information for a given ticker.

    Example: /api/market/company-info?ticker=AAPL

    Returns:
    {
        "success": true,
        "data": {
            "symbol": "AAPL",
            "name": "Apple Inc.",
            "exchange": "NASDAQ",
            "sector": "Technology",
            "industry": "Consumer Electronics"
        }
    }
    """
    try:
        stock = yf.Ticker(ticker.upper())

        # Try to get company info
        info = stock.info

        company_data = {
            "symbol": ticker.upper(),
            "name": None,
            "exchange": None,
            "sector": None,
            "industry": None
        }

        if info:
            company_data["name"] = info.get("longName") or info.get("shortName")
            company_data["exchange"] = info.get("exchange")
            company_data["sector"] = info.get("sector")
            company_data["industry"] = info.get("industry")

        return {
            "success": True,
            "data": company_data
        }

    except Exception as e:
        # Return basic info even on error
        return {
            "success": True,
            "data": {
                "symbol": ticker.upper(),
                "name": None,
                "exchange": None,
                "sector": None,
                "industry": None
            }
        }


@router.get("/market-data")
async def get_market_data(
    tickers: str = Query(..., description="Comma-separated list of stock tickers (e.g., AAPL,TSLA,GOOGL)"),
    period: str = Query("1y", description="Historical data period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y")
):
    """
    Fetch real market data using yfinance for multiple tickers.

    Returns:
        - Historical price data (OHLCV)
        - Daily returns
        - Rolling volatility (30-day, annualized)
        - Current price and market cap

    Example: /api/market/market-data?tickers=AAPL,TSLA,GOOGL&period=6mo
    """
    try:
        # Parse tickers from comma-separated string
        ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]

        if not ticker_list:
            raise HTTPException(status_code=400, detail="At least one ticker must be provided")

        # Fetch data from yfinance service
        result = await market_data_service.get_market_data(ticker_list, period)

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market data: {str(e)}")


@router.get("/market-data/{ticker}")
async def get_single_ticker_data(
    ticker: str,
    period: str = Query("1y", description="Historical data period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y")
):
    """
    Fetch market data for a single ticker.

    Example: /api/market/market-data/AAPL?period=6mo
    """
    try:
        result = await market_data_service.get_single_ticker_data(ticker.upper(), period)

        if "error" in result:
            raise HTTPException(status_code=404, detail=f"Data not available for ticker {ticker}")

        return {
            "success": True,
            "ticker": ticker.upper(),
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market data: {str(e)}")


@router.get("/overview")
async def get_market_overview():
    """
    Get overall market overview and indices
    """
    try:
        overview = await market_service.get_market_overview()
        return {
            "success": True,
            "data": overview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stock/{symbol}")
async def get_stock_data(symbol: str):
    """
    Get detailed stock information
    """
    try:
        data = await market_service.get_stock_data(symbol)
        if not data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        return {
            "success": True,
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stock/{symbol}/history")
async def get_historical_data(
    symbol: str,
    period: str = Query("1y", description="Time period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y"),
    interval: str = Query("1d", description="Data interval")
):
    """
    Get historical price data
    """
    try:
        data = await market_service.get_historical_data(symbol, period, interval)
        return {
            "success": True,
            "symbol": symbol,
            "period": period,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crypto")
async def get_crypto_prices():
    """
    Get top cryptocurrency prices
    """
    try:
        data = await market_service.get_crypto_prices()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news")
async def get_market_news(
    category: str = Query("general", description="News category"),
    limit: int = Query(10, description="Number of articles")
):
    """
    Get latest market news
    """
    try:
        news = await market_service.get_market_news(category, limit)
        return {
            "success": True,
            "category": category,
            "news": news
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/economic-calendar")
async def get_economic_calendar(
    days: int = Query(7, description="Days ahead")
):
    """
    Get upcoming economic events
    """
    try:
        events = await market_service.get_economic_calendar(days)
        return {
            "success": True,
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
