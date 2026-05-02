import { useEffect, useState } from 'react'
import { marketAPI, riskAPI, aiAPI } from '../services/api'
import MetricCard from '../components/MetricCard'
import LineChart from '../components/LineChart'
import RiskBadge from '../components/RiskBadge'
import { TrendingUp, DollarSign, Activity, ShieldAlert } from 'lucide-react'

export default function Dashboard() {
  const [marketOverview, setMarketOverview] = useState(null)
  const [riskMetrics, setRiskMetrics] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load each API separately to handle partial failures
      const marketRes = await marketAPI.getOverview()
      setMarketOverview(marketRes.data)
    } catch (err) {
      console.error('Market data failed:', err)
    }

    try {
      const riskRes = await riskAPI.getMetrics('demo')
      setRiskMetrics(riskRes.data?.metrics || riskRes.data)
    } catch (err) {
      console.error('Risk metrics failed:', err)
    }

    try {
      const insightsRes = await aiAPI.getInsights('demo')
      setInsights(insightsRes.data?.insights || insightsRes.data || [])
    } catch (err) {
      console.error('AI insights failed:', err)
      setError('AI insights temporarily unavailable')
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-4">
          <p className="text-sm text-yellow-400">⚠️ {error}</p>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">Real-time portfolio risk intelligence</p>
      </div>

      {/* Market Overview */}
      {marketOverview && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-white">Market Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketOverview.data.indices.map((index) => (
              <div key={index.symbol} className="rounded-lg bg-slate-800/50 p-4">
                <p className="text-sm text-slate-400">{index.name}</p>
                <p className="mt-1 text-xl font-bold text-white">{index.value.toLocaleString()}</p>
                <p className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {index.change >= 0 ? '+' : ''}{index.changePercent}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Metrics Summary */}
      {riskMetrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Portfolio Value"
            value="$125,430"
            change={0.99}
            unit="%"
            icon={DollarSign}
          />
          <MetricCard
            title="Daily VaR (95%)"
            value={`-${riskMetrics.var.daily_95}%`}
            icon={ShieldAlert}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={riskMetrics.sharpe_ratio}
            icon={TrendingUp}
          />
          <MetricCard
            title="Volatility"
            value={`${riskMetrics.volatility.annual}%`}
            icon={Activity}
          />
        </div>
      )}

      {/* Risk Level Badge */}
      {riskMetrics && (
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Overall Risk Level:</span>
          <RiskBadge level={riskMetrics.risk_level} size="lg" />
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-white">AI Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`
                  rounded-lg border p-4
                  ${insight.type === 'warning' ? 'border-yellow-800 bg-yellow-900/20' :
                    insight.type === 'positive' ? 'border-green-800 bg-green-900/20' :
                    'border-slate-700 bg-slate-800/50'}
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{insight.description}</p>
                  </div>
                  <span className={`text-xs ${
                    insight.priority === 'high' ? 'text-red-400' :
                    insight.priority === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights - Empty/Loading State */}
      {insights.length === 0 && !loading && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-white">AI Risk Analyst</h2>
              <p className="text-sm text-slate-400">Powered by Llama 3 • Get plain English risk explanations</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Load Insights
            </button>
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">⚠️ {error}</p>
            </div>
          )}
        </div>
      )}

      {/* Sample Chart */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Portfolio Performance</h2>
        <LineChart
          data={[
            { date: 'Jan', value: 120000 },
            { date: 'Feb', value: 122000 },
            { date: 'Mar', value: 119000 },
            { date: 'Apr', value: 124000 },
            { date: 'May', value: 125430 }
          ]}
          lines={[{ dataKey: 'value', name: 'Portfolio Value' }]}
        />
      </div>
    </div>
  )
}
