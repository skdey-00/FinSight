import { useEffect, useState } from 'react'
import { alertAPI } from '../services/api'
import { Bell, Plus, Trash2, CheckCircle } from 'lucide-react'

export default function Alerts() {
  const [rules, setRules] = useState([])
  const [history, setHistory] = useState([])
  const [showNewRule, setShowNewRule] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlertData()
  }, [])

  const loadAlertData = async () => {
    try {
      const [rulesRes, historyRes] = await Promise.all([
        alertAPI.getRules('demo'),
        alertAPI.getHistory('demo', 20)
      ])

      setRules(rulesRes.data.rules || [])
      setHistory(historyRes.data.alerts || [])
    } catch (error) {
      console.error('Failed to load alert data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/30 text-red-400 border-red-800'
      case 'warning': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
      default: return 'bg-blue-900/30 text-blue-400 border-blue-800'
    }
  }

  const sampleRules = [
    { id: '1', name: 'Daily VaR Alert', metric: 'VaR', threshold: '3%', condition: 'Above', enabled: true },
    { id: '2', name: 'Volatility Warning', metric: 'Volatility', threshold: '25%', condition: 'Above', enabled: true },
    { id: '3', name: 'Tech Concentration', metric: 'Concentration', threshold: '50%', condition: 'Above', enabled: true },
    { id: '4', name: 'Drawdown Alert', metric: 'Drawdown', threshold: '10%', condition: 'Above', enabled: true }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Alert System</h1>
          <p className="mt-2 text-slate-400">Set up risk threshold alerts and manage notifications</p>
        </div>
        <button
          onClick={() => setShowNewRule(!showNewRule)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Alert Rule
        </button>
      </div>

      {/* Alert Rules */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Active Alert Rules</h2>

        <div className="space-y-3">
          {sampleRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${rule.enabled ? 'bg-green-400' : 'bg-slate-500'}`} />
                <div>
                  <p className="font-medium text-white">{rule.name}</p>
                  <p className="text-sm text-slate-400">
                    Alert when {rule.metric} goes {rule.condition} {rule.threshold}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded p-2 text-slate-400 hover:bg-slate-700 hover:text-white">
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button className="rounded p-2 text-slate-400 hover:bg-slate-700 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert History */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Alerts</h2>

        <div className="space-y-3">
          {history.map((alert) => (
            <div
              key={alert.alert_id}
              className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Bell className={`h-5 w-5 mt-0.5 ${alert.resolved ? 'text-slate-500' : ''}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{alert.type.replace('_', ' ')}</span>
                      {alert.resolved && (
                        <span className="text-xs rounded bg-green-900/50 px-2 py-0.5 text-green-400">Resolved</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Setup Templates */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Setup Templates</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { name: 'Conservative', description: 'Alert on any risk increase', thresholds: ['VaR > 2%', 'Vol > 15%'] },
            { name: 'Moderate', description: 'Balanced alert settings', thresholds: ['VaR > 3%', 'Vol > 20%', 'Drawdown > 8%'] },
            { name: 'Aggressive', description: 'Only critical alerts', thresholds: ['VaR > 5%', 'Vol > 30%', 'Drawdown > 15%'] }
          ].map((template) => (
            <button
              key={template.name}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:border-primary-500"
            >
              <h3 className="font-medium text-white">{template.name} Profile</h3>
              <p className="mt-1 text-sm text-slate-400">{template.description}</p>
              <div className="mt-3 space-y-1">
                {template.thresholds.map((t, i) => (
                  <p key={i} className="text-xs text-slate-500">• {t}</p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
