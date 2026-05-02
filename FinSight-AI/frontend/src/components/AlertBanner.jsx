import { useState, useEffect } from 'react'
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { useAlertSettings } from '../contexts/AuthContext'

export default function AlertBanner({ metrics, onDismiss }) {
  const { settings, checkThresholds } = useAlertSettings()
  const [alerts, setAlerts] = useState([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (metrics && settings) {
      const result = checkThresholds(metrics)
      setAlerts(result.triggered || [])
      setVisible(result.hasAlerts)
    }
  }, [metrics, settings])

  if (!visible || alerts.length === 0) {
    return null
  }

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getAlertStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/40 border-red-700 text-red-300'
      case 'warning':
        return 'bg-yellow-900/40 border-yellow-700 text-yellow-300'
      default:
        return 'bg-blue-900/40 border-blue-700 text-blue-300'
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    if (onDismiss) onDismiss()
  }

  return (
    <div className={`border-l-4 ${alerts[0]?.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`
            flex items-start gap-3 p-4 border backdrop-blur-sm animate-fade-in
            ${getAlertStyles(alert.severity)}
          `}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getAlertIcon(alert.severity)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium capitalize">{alert.type} Alert</h4>
              <span className="text-xs uppercase opacity-75">{alert.severity}</span>
            </div>
            <p className="mt-1 text-sm">{alert.message}</p>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Compact alert badge for sidebar
export function AlertBadge({ count, onClick }) {
  if (!count || count === 0) return null

  return (
    <button
      onClick={onClick}
      className="relative rounded-full bg-red-900/50 p-2 text-red-400 hover:bg-red-900/70 transition-colors"
      title={`${count} active alert${count > 1 ? 's' : ''}`}
    >
      <AlertTriangle className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
