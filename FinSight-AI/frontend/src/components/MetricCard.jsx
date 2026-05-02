import { ArrowUp, ArrowDown } from 'lucide-react'

export default function MetricCard({ title, value, change, unit = '', icon: Icon }) {
  const isPositive = change >= 0

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="text-lg text-slate-400">{unit}</span>}
          </p>
          {change !== undefined && (
            <p className={`mt-2 flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(change)}{typeof change === 'number' && unit}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
            <Icon className="h-6 w-6 text-primary-400" />
          </div>
        )}
      </div>
    </div>
  )
}
