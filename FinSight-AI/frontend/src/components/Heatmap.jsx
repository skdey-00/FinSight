import { useMemo } from 'react'

const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-green-500/30 hover:bg-green-500/50',
    medium: 'bg-yellow-500/30 hover:bg-yellow-500/50',
    high: 'bg-orange-500/30 hover:bg-orange-500/50',
    critical: 'bg-red-500/30 hover:bg-red-500/50'
  }
  return colors[severity] || colors.low
}

export default function Heatmap({ data }) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.score))
  }, [data])

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.length > 0 ? 5 : 1}, minmax(0, 1fr))` }}>
      {data.map((item, index) => (
        <div
          key={index}
          className={`
            relative flex aspect-square flex-col items-center justify-center
            rounded-lg border border-slate-700 p-3 transition-all
            ${getSeverityColor(item.severity)}
          `}
        >
          <p className="text-xs font-medium text-slate-300">{item.symbol}</p>
          <p className="text-lg font-bold text-white">{item.score}</p>
          <p className="absolute bottom-1 text-[10px] text-slate-400">{item.risk_type}</p>
        </div>
      ))}
    </div>
  )
}
