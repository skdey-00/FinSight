import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function LineChart({ data, lines = [], xAxisKey = 'date', height = 300 }) {
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-pressed px-4 py-3">
          <p className="text-xs text-slate-500 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold text-white">{entry.value}</span>
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
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
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
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || colors[index % colors.length]}
              name={line.name}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: line.color || colors[index % colors.length]
              }}
              animationDuration={800}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
