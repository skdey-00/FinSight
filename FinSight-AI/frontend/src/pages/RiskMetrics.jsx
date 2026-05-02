import { useEffect, useState } from 'react'
import { riskAPI, aiAPI } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import Heatmap from '../components/Heatmap'
import { ShieldAlert, Gauge } from 'lucide-react'

export default function RiskMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [explanations, setExplanations] = useState(null)
  const [heatmap, setHeatmap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRiskData()
  }, [])

  const loadRiskData = async () => {
    try {
      const [metricsRes, heatmapRes] = await Promise.all([
        riskAPI.getMetrics('demo'),
        riskAPI.getHeatmap('demo')
      ])

      setMetrics(metricsRes.data.metrics)
      setHeatmap(heatmapRes.data.heatmap.data)
    } catch (error) {
      console.error('Failed to load risk data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExplainRisk = async () => {
    if (!metrics) return
    try {
      const res = await aiAPI.explain('demo', metrics)
      setExplanations(res.data.explanation)
    } catch (error) {
      console.error('Failed to get explanation:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Risk Metrics</h1>
        <p className="mt-2 text-slate-400">Comprehensive risk analysis for your portfolio</p>
      </div>

      {/* Overall Risk Score */}
      {metrics && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Overall Risk Assessment</h2>
              <p className="mt-1 text-slate-400">Based on multiple risk factors</p>
            </div>
            <div className="flex items-center gap-4">
              <RiskBadge level={metrics.risk_level} size="lg" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{metrics.risk_score}</p>
                <p className="text-sm text-slate-400">Risk Score (1-10)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Value at Risk */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary-400" />
              <h3 className="font-semibold text-white">Value at Risk (VaR)</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily (95%)</span>
                <span className="font-medium text-red-400">-{metrics.var.daily_95}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily (99%)</span>
                <span className="font-medium text-red-400">-{metrics.var.daily_99}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual (95%)</span>
                <span className="font-medium text-red-400">-{metrics.var.annual_95}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Maximum expected loss with given confidence level
            </p>
          </div>

          {/* Sharpe Ratio */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary-400" />
              <h3 className="font-semibold text-white">Risk-Adjusted Returns</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Sharpe Ratio</span>
                <span className="font-medium text-green-400">{metrics.sharpe_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sortino Ratio</span>
                <span className="font-medium text-white">{metrics.sortino_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Beta</span>
                <span className="font-medium text-white">{metrics.beta}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Sharpe > 1 is good, > 2 is excellent
            </p>
          </div>

          {/* Volatility */}
          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-400" />
              <h3 className="font-semibold text-white">Volatility</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Volatility</span>
                <span className="font-medium text-white">{metrics.volatility.daily}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Volatility</span>
                <span className="font-medium text-white">{metrics.volatility.annual}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Drawdown</span>
                <span className="font-medium text-red-400">{metrics.max_drawdown}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Annualized standard deviation of returns
            </p>
          </div>
        </div>
      )}

      {/* AI Explanation Button */}
      <button
        onClick={getExplainRisk}
        className="btn-primary"
      >
        Explain in Plain English
      </button>

      {/* AI Explanations */}
      {explanations && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">AI Risk Explanation</h2>
          {explanations.explanations.map((exp, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{exp.metric}</h3>
                    <span className="text-primary-400">{exp.value}</span>
                    <RiskBadge level={exp.concern_level} size="sm" />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{exp.plain_english}</p>
                  <p className="mt-1 text-xs text-slate-500">{exp.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Heatmap */}
      {heatmap && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-white">Risk Heatmap</h2>
          <p className="mb-4 text-sm text-slate-400">Visual breakdown of risk types across holdings</p>
          <Heatmap data={heatmap} />
        </div>
      )}
    </div>
  )
}

function Activity({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  )
}
