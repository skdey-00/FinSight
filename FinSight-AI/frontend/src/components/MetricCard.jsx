import { useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

export default function MetricCard({ title, value, change, unit = '', icon: Icon }) {
  const isPositive = change >= 0
  const [displayValue, setDisplayValue] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const cardRef = useRef(null)

  // Value counting animation - run once
  useEffect(() => {
    if (hasAnimated || typeof value !== 'number') return

    const targetValue = value
    const duration = 800
    const startTime = performance.now()
    const startValue = 0

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + (targetValue - startValue) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setHasAnimated(true)
      }
    }

    requestAnimationFrame(animate)
  }, [value, hasAnimated])

  const formatValue = (val) => {
    if (typeof value === 'string') return value
    if (unit === '%') return val.toFixed(2)
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  return (
    <div ref={cardRef} className="neo-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? formatValue(displayValue) : value}
            {unit && <span className="text-xl text-slate-400 ml-1">{unit}</span>}
          </p>
          {change !== undefined && (
            <p className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-lg ${
              isPositive ? 'text-accent-success bg-accent-success/10' : 'text-accent-danger bg-accent-danger/10'
            }`}>
              {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {Math.abs(change)}{typeof change === 'number' && unit}
            </p>
          )}
        </div>
        {Icon && (
          <div className="neo-icon">
            <Icon className="h-6 w-6 text-primary-400" />
          </div>
        )}
      </div>
    </div>
  )
}
