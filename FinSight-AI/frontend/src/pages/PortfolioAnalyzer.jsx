import PortfolioInput from '../components/PortfolioInput'

export default function PortfolioAnalyzer() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Portfolio Analyzer</h1>
        <p className="mt-2 text-slate-400">
          Build your portfolio and get instant risk metrics with real-time market data
        </p>
      </div>

      {/* Main Component */}
      <PortfolioInput />

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <h3 className="font-medium text-white">Value at Risk (VaR)</h3>
          <p className="mt-2 text-sm text-slate-400">
            Maximum expected loss at a given confidence level. 95% VaR means there's a 5% chance of losing more than this amount in a day.
          </p>
        </div>

        <div className="card">
          <h3 className="font-medium text-white">Sharpe Ratio</h3>
          <p className="mt-2 text-sm text-slate-400">
            Measures risk-adjusted returns. Above 1 is good, above 2 is excellent. Higher values indicate better returns for the risk taken.
          </p>
        </div>

        <div className="card">
          <h3 className="font-medium text-white">Beta & Drawdown</h3>
          <p className="mt-2 text-sm text-slate-400">
            Beta shows market sensitivity (1 = market). Max drawdown is the largest peak-to-trough decline in portfolio value.
          </p>
        </div>
      </div>
    </div>
  )
}
