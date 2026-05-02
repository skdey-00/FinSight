import { useState, useEffect } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'
import { TrendingUp, Activity, BarChart3, AlertCircle } from 'lucide-react'

// Custom dark-themed tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
      {label && <p className="mb-2 text-sm font-medium text-slate-300">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-300">{entry.name}:</span>
          <span className="text-sm font-semibold text-white">
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            {entry.unit && <span className="text-slate-400">{entry.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

// Custom tooltip for correlation heatmap
const CorrelationTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  const value = data.value

  const getCorrelationLabel = (val) => {
    if (val >= 0.8) return { label: 'Strong Positive', color: 'text-red-400' }
    if (val >= 0.5) return { label: 'Moderate Positive', color: 'text-orange-400' }
    if (val >= 0.2) return { label: 'Weak Positive', color: 'text-yellow-400' }
    if (val >= -0.2) return { label: 'No Correlation', color: 'text-slate-400' }
    if (val >= -0.5) return { label: 'Weak Negative', color: 'text-green-400' }
    return { label: 'Moderate Negative', color: 'text-green-500' }
  }

  const { label, color } = getCorrelationLabel(value)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-sm text-slate-400">{data.x} vs {data.y}</p>
      <p className="text-lg font-bold text-white">{value.toFixed(3)}</p>
      <p className={`text-sm ${color}`}>{label}</p>
    </div>
  )
}

// Generate sample data for demonstration
const generateCumulativeReturns = () => {
  const data = []
  let portfolioValue = 100
  let spyValue = 100

  for (let i = 0; i < 252; i++) {
    const portfolioReturn = (Math.random() - 0.48) * 0.03 // Slightly bullish
    const spyReturn = (Math.random() - 0.5) * 0.025

    portfolioValue *= (1 + portfolioReturn)
    spyValue *= (1 + spyReturn)

    data.push({
      date: `Day ${i + 1}`,
      portfolio: ((portfolioValue - 100) / 100) * 100,
      spy: ((spyValue - 100) / 100) * 100
    })
  }

  return data
}

const generateCorrelationData = (tickers) => {
  const data = []
  const correlations = {
    'AAPL': { 'AAPL': 1, 'TSLA': 0.52, 'GOOGL': 0.68, 'NVDA': 0.72, 'MSFT': 0.75 },
    'TSLA': { 'AAPL': 0.52, 'TSLA': 1, 'GOOGL': 0.45, 'NVDA': 0.58, 'MSFT': 0.48 },
    'GOOGL': { 'AAPL': 0.68, 'TSLA': 0.45, 'GOOGL': 1, 'NVDA': 0.65, 'MSFT': 0.62 },
    'NVDA': { 'AAPL': 0.72, 'TSLA': 0.58, 'GOOGL': 0.65, 'NVDA': 1, 'MSFT': 0.78 },
    'MSFT': { 'AAPL': 0.75, 'TSLA': 0.48, 'GOOGL': 0.62, 'NVDA': 0.78, 'MSFT': 1 }
  }

  tickers.forEach(x => {
    tickers.forEach(y => {
      if (x !== y) {
        data.push({
          x: x,
          y: y,
          value: correlations[x]?.[y] || Math.random() * 0.8
        })
      }
    })
  })

  return data
}

const generateReturnsDistribution = () => {
  const bins = [
    { range: '< -3%', count: 8, color: '#dc2626' },
    { range: '-3% to -2%', count: 15, color: '#ef4444' },
    { range: '-2% to -1%', count: 28, color: '#f87171' },
    { range: '-1% to 0%', count: 45, color: '#fca5a5' },
    { range: '0% to 1%', count: 52, color: '#86efac' },
    { range: '1% to 2%', count: 35, color: '#4ade80' },
    { range: '2% to 3%', count: 22, color: '#22c55e' },
    { range: '> 3%', count: 12, color: '#16a34a' }
  ]
  return bins
}

const generateRollingVolatility = () => {
  const data = []
  let volatility = 18

  for (let i = 0; i < 60; i++) {
    // Random walk with mean reversion
    const change = (18 - volatility) * 0.05 + (Math.random() - 0.5) * 3
    volatility = Math.max(10, Math.min(35, volatility + change))

    data.push({
      date: `${i + 1}d ago`,
      volatility: parseFloat(volatility.toFixed(2))
    })
  }

  return data.reverse()
}

// Chart 1: Cumulative Returns Area Chart
const CumulativeReturnsChart = ({ data }) => {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Cumulative Returns</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary-500" />
            <span className="text-slate-400">Portfolio</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-slate-500" />
            <span className="text-slate-400">S&P 500</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => {
              if (typeof value === 'string' && value.includes(' ')) {
                return value.split(' ')[1] + 'd'
              }
              return value
            }}
            interval={30}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} unit="%" />
          <Area
            type="monotone"
            dataKey="spy"
            stroke="#64748b"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#spyGradient)"
            name="S&P 500"
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#0ea5e9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#portfolioGradient)"
            name="Portfolio"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">Portfolio Return</p>
          <p className="text-lg font-bold text-green-400">
            +{data[data.length - 1]?.portfolio?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">S&P 500 Return</p>
          <p className="text-lg font-bold text-slate-300">
            +{data[data.length - 1]?.spy?.toFixed(1) || 0}%
          </p>
        </div>
      </div>
    </div>
  )
}

// Chart 2: Correlation Heatmap (as stacked bar chart)
const CorrelationHeatmap = ({ tickers, data }) => {
  const getCorrelationColor = (value) => {
    // Green for low/negative correlation, red for high positive correlation
    if (value >= 0.8) return { bg: 'rgba(220, 38, 38, 0.8)', border: '#dc2626' }
    if (value >= 0.6) return { bg: 'rgba(239, 68, 68, 0.7)', border: '#ef4444' }
    if (value >= 0.4) return { bg: 'rgba(251, 146, 60, 0.6)', border: '#fb923c' }
    if (value >= 0.2) return { bg: 'rgba(234, 179, 8, 0.5)', border: '#eab308' }
    if (value >= 0) return { bg: 'rgba(74, 222, 128, 0.4)', border: '#4ade80' }
    return { bg: 'rgba(34, 197, 94, 0.5)', border: '#22c55e' }
  }

  // Transform data for bar chart display
  const chartData = tickers.map(ticker => {
    const tickerData = { ticker }
    data.forEach(d => {
      if (d.x === ticker) {
        tickerData[d.y] = d.value
      }
    })
    return tickerData
  })

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Correlation Matrix</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
            <span className="text-slate-400">Low</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.5)' }} />
            <span className="text-slate-400">Medium</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 0.8)' }} />
            <span className="text-slate-400">High</span>
          </span>
        </div>
      </div>

      {/* Traditional correlation matrix grid */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-2 text-left text-slate-400"></th>
              {tickers.map(t => (
                <th key={t} className="p-2 text-center text-slate-300">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map(rowTicker => (
              <tr key={rowTicker} className="border-b border-slate-800">
                <td className="p-2 font-medium text-white">{rowTicker}</td>
                {tickers.map(colTicker => {
                  const correlation = data.find(d => d.x === rowTicker && d.y === colTicker)?.value ?? 1
                  const colors = getCorrelationColor(correlation)
                  if (rowTicker === colTicker) {
                    return (
                      <td key={colTicker} className="p-2 text-center">
                        <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-400">1.00</span>
                      </td>
                    )
                  }
                  return (
                    <td key={colTicker} className="p-2">
                      <div
                        className="mx-auto flex h-8 w-12 items-center justify-center rounded text-xs font-medium"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart visualization */}
      <ResponsiveContainer width="100%" height={200}>
        <RechartsBarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          barCategoryGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            domain={[0, 1]}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <YAxis
            type="category"
            dataKey="x"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={40}
          />
          <Tooltip content={<CorrelationTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => {
              const colors = getCorrelationColor(entry.value)
              return <Cell key={`cell-${index}`} fill={colors.bg} stroke={colors.border} strokeWidth={1} />
            })}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 3: Returns Distribution Histogram
const ReturnsDistributionChart = ({ data }) => {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Daily Returns Distribution</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-slate-400">Losses</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-slate-400">Gains</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="range"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl">
                  <p className="text-sm text-slate-400">{data.range}</p>
                  <p className="text-lg font-bold text-white">{data.count} days</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <span className="text-slate-400">Most frequent:</span>
          <span className="ml-2 font-medium text-white">0% to 1%</span>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <span className="text-slate-400">Total days:</span>
          <span className="ml-2 font-medium text-white">{data.reduce((sum, d) => sum + d.count, 0)}</span>
        </div>
      </div>
    </div>
  )
}

// Chart 4: Rolling Volatility Line Chart
const RollingVolatilityChart = ({ data }) => {
  const latestVol = data[data.length - 1]?.volatility || 0
  const avgVol = data.reduce((sum, d) => sum + d.volatility, 0) / data.length

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">30-Day Rolling Volatility</h3>
        <div className="text-xs text-slate-400">Annualized (%)</div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(value) => value.replace(' ago', '')}
            interval={5}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            domain={[10, 35]}
          />
          <Tooltip content={<CustomTooltip />} unit="%" />
          <Area
            type="monotone"
            dataKey="volatility"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#volatilityGradient)"
          />
          <Line
            type="monotone"
            dataKey="volatility"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">Current</p>
          <p className={`text-lg font-bold ${latestVol > 20 ? 'text-red-400' : latestVol > 15 ? 'text-yellow-400' : 'text-green-400'}`}>
            {latestVol.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">Average</p>
          <p className="text-lg font-bold text-white">{avgVol.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">Range</p>
          <p className="text-lg font-bold text-white">
            {Math.min(...data.map(d => d.volatility)).toFixed(0)}% - {Math.max(...data.map(d => d.volatility)).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard({ tickers = ['AAPL', 'TSLA', 'GOOGL', 'NVDA', 'MSFT'] }) {
  const [data, setData] = useState({
    cumulativeReturns: [],
    correlation: [],
    returnsDistribution: [],
    rollingVolatility: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({
        cumulativeReturns: generateCumulativeReturns(),
        correlation: generateCorrelationData(tickers),
        returnsDistribution: generateReturnsDistribution(),
        rollingVolatility: generateRollingVolatility()
      })
      setIsLoading(false)
    }, 500)
  }, [tickers])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Portfolio Analytics Dashboard</h2>
        <p className="mt-1 text-slate-400">Real-time visualization of your portfolio performance and risk metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Cumulative Returns */}
        <CumulativeReturnsChart data={data.cumulativeReturns} />

        {/* Chart 2: Correlation Matrix */}
        <CorrelationHeatmap tickers={tickers} data={data.correlation} />

        {/* Chart 3: Returns Distribution */}
        <ReturnsDistributionChart data={data.returnsDistribution} />

        {/* Chart 4: Rolling Volatility */}
        <RollingVolatilityChart data={data.rollingVolatility} />
      </div>

      {/* Legend/Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/30">
            <TrendingUp className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Cumulative Return</p>
            <p className="font-medium text-white">Portfolio vs Benchmark</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900/30">
            <Activity className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Correlation Risk</p>
            <p className="font-medium text-white">Diversification Analysis</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-900/30">
            <BarChart3 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Returns Dist</p>
            <p className="font-medium text-white">Gain/Loss Frequency</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-900/30">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Rolling Vol</p>
            <p className="font-medium text-white">30-Day Volatility</p>
          </div>
        </div>
      </div>
    </div>
  )
}
