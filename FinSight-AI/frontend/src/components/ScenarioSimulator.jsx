import { useState, useEffect } from 'react'
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Zap,
  SlidersHorizontal,
  Loader2,
  CheckCircle2
} from 'lucide-react'

// Animated counter for numbers
const AnimatedValue = ({ value, prefix = '', suffix = '', duration = 1000 }) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCurrentValue(value)
        clearInterval(timer)
      } else {
        setCurrentValue(current)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span>
      {prefix}{typeof currentValue === 'number' ? currentValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) : currentValue}{suffix}
    </span>
  )
}

// Scenario card component
const ScenarioCard = ({ scenario, isSelected, onClick, icon: Icon }) => {
  const colors = {
    crash: { bg: 'bg-red-900/20', border: 'border-red-800', icon: 'text-red-400', hover: 'hover:border-red-600' },
    rate_hike: { bg: 'bg-orange-900/20', border: 'border-orange-800', icon: 'text-orange-400', hover: 'hover:border-orange-600' },
    bull_run: { bg: 'bg-green-900/20', border: 'border-green-800', icon: 'text-green-400', hover: 'hover:border-green-600' },
    recession: { bg: 'bg-purple-900/20', border: 'border-purple-800', icon: 'text-purple-400', hover: 'hover:border-purple-600' },
    custom: { bg: 'bg-slate-800/50', border: 'border-slate-700', icon: 'text-slate-400', hover: 'hover:border-slate-500' }
  }

  const theme = colors[scenario] || colors.custom

  return (
    <button
      onClick={() => onClick(scenario)}
      className={`
        card p-4 text-left transition-all duration-300 ${theme.bg} ${theme.border} ${theme.hover}
        ${isSelected ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      <Icon className={`h-6 w-6 ${theme.icon} mb-3`} />
      <h3 className="font-medium text-white capitalize">
        {scenario.replace('_', ' ')}
      </h3>
    </button>
  )
}

// Result display with animation
const ResultDisplay = ({ result }) => {
  const isPositive = result?.total_change >= 0

  if (!result) return null

  return (
    <div className={`card overflow-hidden ${isPositive ? 'border-green-900/50' : 'border-red-900/50'}`}>
      {/* Animated header bar */}
      <div className={`px-6 py-4 ${isPositive ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40' : 'bg-gradient-to-r from-red-900/40 to-rose-900/40'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {result.scenario_name || 'Scenario'} Results
          </h3>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isPositive ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {result.total_change >= 0 ? '+' : ''}{result.total_change_percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Before/After comparison */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Before */}
          <div className="text-center">
            <p className="text-sm text-slate-400">Before</p>
            <p className="mt-2 text-3xl font-bold text-white">
              ${result.portfolio_value_before?.toLocaleString() || '0'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Current Value</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className={`rounded-full p-3 ${isPositive ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
          </div>

          {/* After */}
          <div className="text-center">
            <p className="text-sm text-slate-400">After</p>
            <p className={`mt-2 text-3xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <AnimatedValue
                value={result.portfolio_value_after || 0}
                prefix="$"
              />
            </p>
            <p className="mt-1 text-xs text-slate-500">Projected Value</p>
          </div>
        </div>

        {/* Change amount */}
        <div className={`mt-6 rounded-lg p-4 ${isPositive ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              {result.description || 'Projected change'}
            </span>
            <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {result.total_change >= 0 ? '+' : ''}${Math.abs(result.total_change || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Holdings impact */}
        {result.holdings_impact && result.holdings_impact.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-medium text-slate-400">Impact by Holding</h4>
            <div className="space-y-2">
              {result.holdings_impact.map((holding, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{holding.ticker}</span>
                    <span className="text-sm text-slate-400">
                      ${holding.value_before?.toLocaleString()} → ${holding.value_after?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${holding.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.change_percent >= 0 ? '+' : ''}{holding.change_percent}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Custom scenario input
const CustomScenarioInput = ({ customChanges, setCustomChanges }) => {
  const tickers = ['AAPL', 'TSLA', 'GOOGL', 'NVDA', 'MSFT']

  return (
    <div className="space-y-4">
      {tickers.map(ticker => (
        <div key={ticker} className="flex items-center gap-4">
          <span className="w-16 font-medium text-white">{ticker}</span>
          <input
            type="range"
            min="-50"
            max="50"
            value={customChanges[ticker] || 0}
            onChange={(e) => setCustomChanges({ ...customChanges, [ticker]: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="relative w-24">
            <input
              type="number"
              min="-50"
              max="50"
              value={customChanges[ticker] || 0}
              onChange={(e) => setCustomChanges({ ...customChanges, [ticker]: parseFloat(e.target.value) || 0 })}
              className="input-field w-full pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
        <span className="text-sm text-slate-400">Default for others:</span>
        <div className="relative w-24">
          <input
            type="number"
            min="-50"
            max="50"
            value={customChanges.default || 0}
            onChange={(e) => setCustomChanges({ ...customChanges, default: parseFloat(e.target.value) || 0 })}
            className="input-field w-full pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
        </div>
      </div>
    </div>
  )
}

// Main Scenario Simulator Component
export default function ScenarioSimulator({
  portfolioValue = 100000,
  weights = { AAPL: 0.4, TSLA: 0.3, GOOGL: 0.3 }
}) {
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [customChanges, setCustomChanges] = useState({
    AAPL: 0, TSLA: 0, GOOGL: 0, NVDA: 0, MSFT: 0, default: 0
  })

  const scenarios = [
    { id: 'market_crash', name: 'Market Crash', icon: TrendingDown, description: '-30% across all holdings' },
    { id: 'rate_hike', name: 'Rate Hike', icon: AlertTriangle, description: 'Bonds -15%, Tech -20%' },
    { id: 'bull_run', name: 'Bull Run', icon: TrendingUp, description: '+25% across all holdings' },
    { id: 'custom', name: 'Custom', icon: SlidersHorizontal, description: 'Set your own changes' }
  ]

  const runSimulation = async () => {
    if (!selectedScenario) return

    setIsRunning(true)
    setResult(null)

    // Simulate API call delay
    setTimeout(() => {
      let changes

      if (selectedScenario === 'market_crash') {
        changes = { AAPL: -30, TSLA: -30, GOOGL: -30 }
      } else if (selectedScenario === 'rate_hike') {
        changes = { AAPL: -20, TSLA: -20, GOOGL: -15 }
      } else if (selectedScenario === 'bull_run') {
        changes = { AAPL: 25, TSLA: 25, GOOGL: 25 }
      } else {
        changes = customChanges
      }

      // Calculate results
      const holdingsImpact = Object.entries(weights).map(([ticker, weight]) => {
        const valueBefore = portfolioValue * weight
        const changePercent = changes[ticker] || changes.default || 0
        const valueAfter = valueBefore * (1 + changePercent / 100)

        return {
          ticker,
          value_before: valueBefore,
          value_after: valueAfter,
          percent_change: changePercent,
          change_percent: changePercent
        }
      })

      const totalAfter = holdingsImpact.reduce((sum, h) => sum + h.value_after, 0)
      const totalChange = totalAfter - portfolioValue

      setResult({
        scenario: selectedScenario,
        scenario_name: scenarios.find(s => s.id === selectedScenario)?.name,
        description: scenarios.find(s => s.id === selectedScenario)?.description,
        portfolio_value_before: portfolioValue,
        portfolio_value_after: totalAfter,
        total_change: totalChange,
        total_change_percent: (totalChange / portfolioValue) * 100,
        holdings_impact: holdingsImpact
      })

      setIsRunning(false)
    }, 1500)
  }

  const getScenarioInfo = () => {
    return scenarios.find(s => s.id === selectedScenario)
  }

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Select Scenario</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {scenarios.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario.id}
              icon={scenario.icon}
              isSelected={selectedScenario === scenario.id}
              onClick={setSelectedScenario}
            />
          ))}
        </div>
      </div>

      {/* Custom Scenario Inputs */}
      {selectedScenario === 'custom' && (
        <div className="card animate-fade-in">
          <h3 className="mb-4 font-semibold text-white">Custom Scenario Changes</h3>
          <CustomScenarioInput
            customChanges={customChanges}
            setCustomChanges={setCustomChanges}
          />
        </div>
      )}

      {/* Scenario Info & Run Button */}
      {selectedScenario && selectedScenario !== 'custom' && (
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Selected Scenario</p>
            <p className="text-lg font-medium text-white">
              {getScenarioInfo()?.name} - {getScenarioInfo()?.description}
            </p>
          </div>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={runSimulation}
        disabled={!selectedScenario || isRunning}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Running Simulation...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Run Simulation
          </>
        )}
      </button>

      {/* Results */}
      {result && !isRunning && (
        <div className="animate-fade-in">
          <ResultDisplay result={result} />

          {/* Success indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Simulation complete</span>
          </div>
        </div>
      )}
    </div>
  )
}
