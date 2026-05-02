import { useState, useEffect } from 'react'
import { X, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react'
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
        return 'border-accent-danger/30 bg-accent-danger/5 text-accent-danger'
      case 'warning':
        return 'border-accent-warning/30 bg-accent-warning/5 text-accent-warning'
      default:
        return 'border-primary-500/30 bg-primary-500/5 text-primary-400'
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    if (onDismiss) onDismiss()
  }

  return (
    <div className="border-b border-white/5">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`
            flex items-center gap-4 px-6 py-4 border-x-4 backdrop-blur-sm animate-fade-in
            ${getAlertStyles(alert.severity)}
          `}
          style={{ borderLeftWidth: '4px', borderRightWidth: '0' }}
        >
          <div className="flex-shrink-0 neo-icon p-2">
            {getAlertIcon(alert.severity)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white capitalize">{alert.type} Alert</h4>
              <span className="text-xs uppercase rounded-full neo-pressed px-2 py-0.5 opacity-75">
                {alert.severity}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 neo-icon p-2 text-slate-400 hover:text-white"
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
      className="relative neo-icon p-2 text-accent-danger"
      title={`${count} active alert${count > 1 ? 's' : ''}`}
    >
      <Bell className="h-4 w-4 animate-subtle-pulse" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-accent-danger to-red-600 text-[10px] font-bold text-white shadow-lg">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
