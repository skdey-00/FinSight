import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Loader2, Info, HelpCircle, RefreshCw } from 'lucide-react'
import Tooltip from './Tooltip'
import StockAutocomplete from './StockAutocomplete'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Fallback prices only used when API is unavailable
const FALLBACK_PRICES = {
  'AAPL': 175.50,
  'TSLA': 245.30,
  'GOOGL': 140.20,
  'MSFT': 415.00,
  'AMZN': 178.25,
  'NVDA': 875.30,
  'META': 505.20,
  'BTC': 67500,
  'ETH': 3450
}

// Live price fetching hook
const useLivePrices = (tickers, enabled = true) => {
  const [prices, setPrices] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchPrices = useCallback(async () => {
    if (!tickers.length || !enabled) return

    // Only fetch tickers that have valid symbols
    const validTickers = tickers.filter(t => t && t.length >= 1)
    if (validTickers.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/market/prices?tickers=${validTickers.join(',')}`)

      if (!response.ok) {
        throw new Error('Failed to fetch prices')
      }

      const data = await response.json()

      if (data.success && data.data?.prices) {
        setPrices(data.data.prices)
        setLastUpdate(new Date())
      } else {
        throw new Error('Invalid price data')
      }
    } catch (err) {
      console.error('Price fetch error:', err)
      setError(err.message)
      // Don't clear existing prices on error, keep showing what we have
    } finally {
      setIsLoading(false)
    }
  }, [tickers, enabled, API_BASE])

  useEffect(() => {
    // Initial fetch
    fetchPrices()

    // Set up interval for updates every 2 minutes (reduced API calls)
    if (enabled && tickers.length > 0) {
      intervalRef.current = setInterval(fetchPrices, 120000) // 2 minutes
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchPrices, enabled, tickers.length])

  return { prices, isLoading, lastUpdate, error, refetch: fetchPrices }
}

// Simple prices endpoint for live data - we'll create this backend route
// For now, use the market-data endpoint

export default function PortfolioInput() {
  const [holdings, setHoldings] = useState([
    { id: 1, ticker: 'AAPL', shares: 10, buyPrice: 150 },
    { id: 2, ticker: 'GOOGL', shares: 15, buyPrice: 130 }
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [riskMetrics, setRiskMetrics] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)

  // Get unique tickers from holdings
  const tickers = holdings.map(h => h.ticker.toUpperCase()).filter(t => t)

  // Fetch live prices
  const { prices, isLoading: pricesLoading, lastUpdate, error: pricesError, refetch: refetchPrices } = useLivePrices(tickers)

  // Get current price for a ticker
  const getCurrentPrice = (ticker) => {
    const upper = ticker.toUpperCase()
    return prices[upper] || FALLBACK_PRICES[upper] || 0
  }

  // Calculate portfolio metrics
  const portfolioMetrics = {
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    gainLossPercent: 0,
    holdings: []
  }

  // Calculate metrics for each holding
  holdings.forEach(h => {
    if (!h.ticker) return

    const currentPrice = getCurrentPrice(h.ticker)
    const currentValue = h.shares * currentPrice
    const costBasis = h.shares * h.buyPrice
    const gainLoss = currentValue - costBasis
    const gainLossPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0

    portfolioMetrics.totalValue += currentValue
    portfolioMetrics.totalCost += costBasis
    portfolioMetrics.totalGainLoss += gainLoss

    portfolioMetrics.holdings.push({
      ...h,
      currentPrice,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      portfolioPercent: 0
    })
  })

  // Calculate percentages
  portfolioMetrics.holdings.forEach(h => {
    h.portfolioPercent = portfolioMetrics.totalValue > 0
      ? (h.currentValue / portfolioMetrics.totalValue * 100).toFixed(1)
      : '0.0'
  })

  portfolioMetrics.gainLossPercent = portfolioMetrics.totalCost > 0
    ? (portfolioMetrics.totalGainLoss / portfolioMetrics.totalCost * 100)
    : 0

  // Check diversity
  const diversityScore = new Set(holdings.map(h => h.ticker?.toUpperCase()).filter(Boolean)).size
  const isWellDiversified = holdings.length >= 3 && diversityScore >= holdings.length

  // Add new holding
  const addHolding = () => {
    setHoldings([...holdings, {
      id: Date.now(),
      ticker: '',
      shares: 0,
      buyPrice: 0
    }])
    setAnalysisError(null)
  }

  // Remove holding
  const removeHolding = (id) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter(h => h.id !== id))
      setAnalysisError(null)
    }
  }

  // Update holding
  const updateHolding = (id, field, value) => {
    setHoldings(holdings.map(h => {
      if (h.id === id) {
        const newValue = field === 'ticker'
          ? value.toUpperCase()
          : field === 'shares'
            ? parseFloat(value) || 0
            : parseFloat(value) || 0
        return { ...h, [field]: newValue }
      }
      return h
    }))
    setAnalysisError(null)
  }

  // Analyze portfolio
  const analyzePortfolio = async () => {
    const invalidHolding = holdings.find(h => !h.ticker || h.shares <= 0 || h.buyPrice <= 0)

    if (invalidHolding) {
      setAnalysisError('Please fill in all fields correctly (ticker, shares > 0, buy price > 0)')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      // Build weights from current portfolio values
      const weights = {}
      portfolioMetrics.holdings.forEach(h => {
        weights[h.ticker] = parseFloat(h.portfolioPercent) / 100
      })

      // Calculate risk metrics
      const riskRes = await fetch(`${API_BASE}/api/risk/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights: weights,
          benchmark: 'SPY',
          period: '1y'
        })
      })

      // Handle different error types
      if (!riskRes.ok) {
        if (riskRes.status === 429) {
          // Rate limited - use simulated data as fallback
          const simulatedRisk = generateSimulatedRiskMetrics(holdings, weights)
          setRiskMetrics(simulatedRisk)
          setAnalysisError('Note: Using simulated risk metrics due to Yahoo Finance rate limits. Real analysis will be available in ~1 hour.')
          return
        }
        const errorData = await riskRes.json().catch(() => null)
        throw new Error(errorData?.detail || 'Failed to calculate risk metrics')
      }

      const riskJson = await riskRes.json()
      setRiskMetrics(riskJson.data || riskJson)

    } catch (err) {
      console.error('Analysis error:', err)
      setAnalysisError(err.message || 'Failed to analyze portfolio.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate realistic simulated risk metrics as fallback
  const generateSimulatedRiskMetrics = (holdingsList, weightsMap) => {
    const numStocks = Object.keys(weightsMap).length

    // Simulated VaR based on portfolio diversity (more diverse = lower risk)
    const baseVar = 2.5 - (numStocks * 0.15)
    const dailyVar = Math.max(0.8, baseVar + (Math.random() - 0.5) * 0.5)

    // Simulated Sharpe ratio (1.5 is good, more stocks = slightly better)
    const sharpe = Math.min(3, 1.2 + (numStocks * 0.1) + (Math.random() * 0.3))

    // Beta based on holdings (tech stocks = higher beta)
    const techTickers = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'CRM']
    const techWeight = Object.entries(weightsMap).reduce((sum, [ticker, weight]) =>
      sum + (techTickers.includes(ticker) ? weight : 0), 0)
    const beta = 0.9 + (techWeight * 0.5) + (Math.random() * 0.2)

    // Volatility
    const volatility = 15 + (techWeight * 10) + (Math.random() * 5)

    // Max drawdown
    const maxDrawdown = -10 - (Math.random() * 15)

    // Calculate return from portfolio
    const totalReturn = portfolioMetrics.gainLossPercent

    return {
      calculated_at: new Date().toISOString(),
      portfolio_weights: weightsMap,
      data_points: 252,
      simulated: true,
      value_at_risk: {
        '95%': {
          daily_percent: -dailyVar / 100,
          weekly_percent: -dailyVar / 100 * Math.sqrt(5),
          monthly_percent: -dailyVar / 100 * Math.sqrt(21),
          annual_percent: -dailyVar / 100 * Math.sqrt(252),
        }
      },
      sharpe_ratio: {
        sharpe_ratio: sharpe,
        annual_return_percent: totalReturn,
        annual_volatility_percent: volatility
      },
      beta: {
        beta: beta,
        correlation: 0.65 + (Math.random() * 0.2)
      },
      max_drawdown: {
        max_drawdown_percent: maxDrawdown
      },
      portfolio_statistics: {
        total_return_percent: totalReturn,
        annual_volatility_percent: volatility
      }
    }
  }

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'No data'
    const now = new Date()
    const diff = Math.floor((now - lastUpdate) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return lastUpdate.toLocaleTimeString()
  }

  // Check if using live prices or fallback
  const usingLivePrices = Object.keys(prices).length > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Live Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Builder</h1>
          <p className="mt-2 text-slate-400">
            Add your holdings with shares and buy price. We'll calculate everything else automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Price Status */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2">
            <div className={`h-2 w-2 rounded-full ${usingLivePrices ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span className="text-sm text-slate-400">
              {usingLivePrices ? 'Live' : 'Offline'}
            </span>
            <span className="text-xs text-slate-500">
              {formatLastUpdate()}
            </span>
          </div>
          {/* Refresh Button */}
          <button
            onClick={refetchPrices}
            disabled={pricesLoading}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${pricesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Tooltip term="Portfolio Value">
          <div className="card">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Portfolio Value</p>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">
              ${portfolioMetrics.totalValue.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
            {pricesLoading && (
              <p className="mt-1 text-xs text-slate-500">Updating...</p>
            )}
          </div>
        </Tooltip>
        <Tooltip term="Total Cost">
          <div className="card">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Total Cost</p>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">
              ${portfolioMetrics.totalCost.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
          </div>
        </Tooltip>
        <Tooltip term="Total Gain/Loss">
          <div className="card">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Total Gain/Loss</p>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
            </div>
            <p className={`mt-1 text-2xl font-bold ${
              portfolioMetrics.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {portfolioMetrics.totalGainLoss >= 0 ? '+' : ''}${portfolioMetrics.totalGainLoss.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
          </div>
        </Tooltip>
        <Tooltip term="Return">
          <div className="card">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-400">Return</p>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
            </div>
            <p className={`mt-1 text-2xl font-bold ${
              portfolioMetrics.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {portfolioMetrics.gainLossPercent.toFixed(1)}%
            </p>
          </div>
        </Tooltip>
      </div>

      {/* Diversity Badge */}
      <Tooltip term="Diversity">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  Portfolio Diversity
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {diversityScore} {diversityScore === 1 ? 'stock' : 'stocks'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isWellDiversified ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">Well Diversified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">Add More Stocks</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Tooltip>

      {/* Holdings Input */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Holdings</h2>
          <button
            onClick={addHolding}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Ticker</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Shares</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Buy Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Current Value</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Gain/Loss</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">% of Portfolio</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const currentPrice = getCurrentPrice(holding.ticker)
                const currentValue = holding.shares * currentPrice
                const costBasis = holding.shares * holding.buyPrice
                const gainLoss = currentValue - costBasis
                const gainLossPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0
                const hasLivePrice = prices[holding.ticker?.toUpperCase()] !== undefined

                return (
                  <tr key={holding.id} className="border-b border-slate-800">
                    <td className="px-4 py-3">
                      <StockAutocomplete
                        value={holding.ticker}
                        onChange={(value) => updateHolding(holding.id, 'ticker', value)}
                        placeholder="AAPL"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={holding.shares || ''}
                        onChange={(e) => updateHolding(holding.id, 'shares', e.target.value)}
                        placeholder="10"
                        min="0"
                        step="0.01"
                        className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">$</span>
                        <input
                          type="number"
                          value={holding.buyPrice || ''}
                          onChange={(e) => updateHolding(holding.id, 'buyPrice', e.target.value)}
                          placeholder="150"
                          min="0"
                          step="0.01"
                          className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-white">${currentValue.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                        @ ${currentPrice.toFixed(2)}
                        {hasLivePrice && (
                          <span className="text-green-400">●</span>
                        )}
                      </p>
                    </td>
                    <td className={`px-4 py-3 text-right ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <p>{gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}</p>
                      <p className="text-xs">({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm text-white">
                        {portfolioMetrics.holdings.find(h => h.id === holding.id)?.portfolioPercent || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeHolding(holding.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={analyzePortfolio}
          disabled={isAnalyzing || holdings.length === 0}
          className="btn-primary flex items-center gap-2 px-8 py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Analyze Portfolio
            </>
          )}
        </button>
        {analysisError && (
          <p className="text-sm text-red-400">⚠️ {analysisError}</p>
        )}
      </div>

      {/* Risk Metrics Results */}
      {riskMetrics && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Risk Analysis Results</h2>
            {riskMetrics.simulated && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-900/30 border border-yellow-700/50 px-3 py-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-300">Simulated data (API rate limited)</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskMetrics.value_at_risk && (
              <Tooltip term="Value at Risk (VaR)">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">Value at Risk (95%)</p>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                  </div>
                  <p className="mt-1 text-xl font-bold text-white">
                    {Math.abs(riskMetrics.value_at_risk?.['95%']?.daily_percent || 0).toFixed(2)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Daily potential loss</p>
                </div>
              </Tooltip>
            )}
            {riskMetrics.sharpe_ratio && (
              <Tooltip term="Sharpe Ratio">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">Sharpe Ratio</p>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                  </div>
                  <p className="mt-1 text-xl font-bold text-white">
                    {(riskMetrics.sharpe_ratio?.sharpe_ratio || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(riskMetrics.sharpe_ratio?.sharpe_ratio || 0) > 1 ? 'Good risk-adjusted returns' : 'Could be better'}
                  </p>
                </div>
              </Tooltip>
            )}
            {riskMetrics.beta && (
              <Tooltip term="Beta">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">Beta (vs S&P 500)</p>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                  </div>
                  <p className="mt-1 text-xl font-bold text-white">
                    {(riskMetrics.beta?.beta || 0).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(riskMetrics.beta?.beta || 0) > 1 ? 'More volatile than market' : 'Less volatile than market'}
                  </p>
                </div>
              </Tooltip>
            )}
            {riskMetrics.portfolio_statistics && (
              <Tooltip term="Annual Volatility">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">Annual Volatility</p>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                  </div>
                  <p className="mt-1 text-xl font-bold text-white">
                    {(riskMetrics.sharpe_ratio?.annual_volatility_percent || riskMetrics.portfolio_statistics?.annual_volatility_percent || 0).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Price fluctuation</p>
                </div>
              </Tooltip>
            )}
            {riskMetrics.max_drawdown && (
              <Tooltip term="Max Drawdown">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-400">Max Drawdown</p>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                  </div>
                  <p className="mt-1 text-xl font-bold text-white">
                    {Math.abs(riskMetrics.max_drawdown?.max_drawdown_percent || 0).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Worst historical decline</p>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card border border-primary-500/30 bg-primary-900/10">
          <h3 className="mb-2 font-medium text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-primary-400" />
            How it works
          </h3>
          <p className="text-sm text-slate-400">
            Enter your stock/crypto holdings with shares and buy price. We'll automatically calculate portfolio diversity, percentages, and real-time risk metrics.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-2 font-medium text-white">Live Data</h3>
          <p className="text-sm text-slate-400">
            Current prices update every 2 minutes from market data. Your portfolio value updates automatically as prices change.
          </p>
        </div>
        <div className="card">
          <h3 className="mb-2 font-medium text-white">Risk Metrics</h3>
          <p className="text-sm text-slate-400">
            VaR, Sharpe ratio, beta, volatility, and drawdown calculated based on your actual holdings.
          </p>
        </div>
      </div>
    </div>
  )
}
