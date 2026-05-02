import { useState } from 'react'
import AIInsights from '../components/AIInsights'
import ScenarioSimulator from '../components/ScenarioSimulator'

export default function RiskAnalysis() {
  const [riskMetrics, setRiskMetrics] = useState(null)
  const [portfolioInfo, setPortfolioInfo] = useState({
    tickers: ['AAPL', 'TSLA', 'GOOGL'],
    weights: { AAPL: 40, TSLA: 30, GOOGL: 30 },
    value: 100000
  })

  // Sample risk metrics for demo
  const sampleRiskMetrics = {
    value_at_risk: {
      '95%': {
        daily_percent: -2.34,
        weekly_percent: -5.23,
        monthly_percent: -10.72,
        annual_percent: -37.14,
        expected_shortfall_daily_percent: -3.45
      },
      '99%': {
        daily_percent: -4.12,
        weekly_percent: -9.21,
        monthly_percent: -18.89,
        annual_percent: -65.44
      }
    },
    sharpe_ratio: {
      sharpe_ratio: 1.24,
      sortino_ratio: 1.56,
      annual_return_percent: 18.5,
      annual_volatility_percent: 14.8,
      risk_free_rate: 0.02
    },
    beta: {
      beta: 1.15,
      alpha_annual_percent: 2.34,
      r_squared: 0.82,
      correlation: 0.91,
      interpretation: 'Higher volatility than market'
    },
    max_drawdown: {
      max_drawdown_percent: -12.5,
      peak_date: '2024-07-15',
      trough_date: '2024-10-25',
      drawdown_duration_days: 102
    },
    portfolio_statistics: {
      total_return_percent: 15.2,
      daily_return_mean_percent: 0.06,
      daily_return_std_percent: 0.85,
      skewness: -0.32,
      excess_kurtosis: 2.85,
      best_day_percent: 4.5,
      worst_day_percent: -5.2,
      positive_days: 132,
      negative_days: 120,
      win_rate_percent: 52.5
    },
    correlation_matrix: {
      tickers: ['AAPL', 'TSLA', 'GOOGL'],
      matrix: {
        AAPL: { AAPL: 1, TSLA: 0.52, GOOGL: 0.68 },
        TSLA: { AAPL: 0.52, TSLA: 1, GOOGL: 0.45 },
        GOOGL: { AAPL: 0.68, TSLA: 0.45, GOOGL: 1 }
      }
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Risk Analysis & AI Insights</h1>
        <p className="mt-2 text-slate-400">
          Get AI-powered explanations and test your portfolio against market scenarios
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* AI Insights */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">AI Risk Analyst</h2>
          <AIInsights
            riskMetrics={riskMetrics || sampleRiskMetrics}
            portfolioInfo={portfolioInfo}
          />
        </div>

        {/* Scenario Simulator */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Scenario Simulator</h2>
          <div className="card">
            <ScenarioSimulator
              portfolioValue={portfolioInfo.value}
              weights={portfolioInfo.weights}
            />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <h3 className="font-medium text-white">How AI Analysis Works</h3>
          <p className="mt-2 text-sm text-slate-400">
            The AI analyzes your risk metrics using Llama 3 to provide plain-English explanations,
            identify your biggest risk factor, and suggest actionable improvements.
          </p>
        </div>

        <div className="card">
          <h3 className="font-medium text-white">Scenario Testing</h3>
          <p className="mt-2 text-sm text-slate-400">
            Simulate market events like crashes, rate hikes, or bull runs to see how your
            portfolio might perform under different conditions.
          </p>
        </div>

        <div className="card">
          <h3 className="font-medium text-white">Data-Driven Insights</h3>
          <p className="mt-2 text-sm text-slate-400">
            All calculations use historical data and proven statistical methods including
            Value at Risk, Sharpe ratios, and correlation analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
