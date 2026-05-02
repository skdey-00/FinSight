import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function BarChart({ data, dataKey = 'value', xAxisKey = 'name', height = 300 }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-pressed px-4 py-3">
          <p className="text-xs text-slate-500 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>{' '}
              <span className="font-semibold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e1e29"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey={xAxisKey}
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#1e1e29' }}
            tickLine={{ stroke: '#1e1e29' }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#1e1e29' }}
            tickLine={{ stroke: '#1e1e29' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={dataKey}
            radius={[8, 8, 0, 0]}
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
