import { useEffect, useState } from 'react'
import { anomalyAPI } from '../services/api'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState(null)
  const [concentration, setConcentration] = useState(null)
  const [marketEvents, setMarketEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnomalyData()
  }, [])

  const loadAnomalyData = async () => {
    try {
      const [anomaliesRes, concentrationRes, eventsRes] = await Promise.all([
        anomalyAPI.detect('demo', 30),
        anomalyAPI.getConcentration('demo'),
        anomalyAPI.getMarketEvents(7)
      ])

      setAnomalies(anomaliesRes.data.anomalies)
      setConcentration(concentrationRes.data.concentration_risk)
      setMarketEvents(eventsRes.data.events)
    } catch (error) {
      console.error('Failed to load anomaly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'border-red-800 bg-red-900/20'
      case 'medium':
        return 'border-yellow-800 bg-yellow-900/20'
      default:
        return 'border-blue-800 bg-blue-900/20'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Anomaly Detection</h1>
        <p className="mt-2 text-slate-400">Real-time detection of unusual market movements and concentration risks</p>
      </div>

      {/* Concentration Risk Alert */}
      {concentration && (
        <div className={`card ${concentration.has_concentration_risk ? 'border-yellow-700 bg-yellow-900/10' : ''}`}>
          <h2 className="mb-4 text-lg font-semibold text-white">Concentration Risk Analysis</h2>

          <div className="space-y-3">
            {concentration.concentrations.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300">{item.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white">{item.percent}%</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'elevated' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-green-900/50 text-green-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {concentration.has_concentration_risk && (
            <div className="mt-4 rounded-lg bg-yellow-900/30 p-3">
              <p className="text-sm text-yellow-300">⚠️ {concentration.recommendations[0]}</p>
            </div>
          )}
        </div>
      )}

      {/* Detected Anomalies */}
      {anomalies && anomalies.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Recent Anomalies ({anomalies.length})
            </h2>
            <span className="text-sm text-slate-400">Last 30 days</span>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getSeverityClass(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(anomaly.severity)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{anomaly.symbol}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {anomaly.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{anomaly.description}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {anomaly.date} • Threshold: {anomaly.threshold} • Actual: {anomaly.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Events */}
      {marketEvents.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Market Events</h2>

          <div className="space-y-3">
            {marketEvents.map((event, index) => (
              <div key={index} className="border-l-2 border-primary-500 pl-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{event.event}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    event.impact === 'high' ? 'bg-red-900/50 text-red-400' :
                    event.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-green-900/50 text-green-400'
                  }`}>
                    {event.impact}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                <p className="mt-1 text-xs text-slate-500">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!anomalies?.length && !marketEvents?.length && (
        <div className="card text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">No anomalies detected in the selected period</p>
        </div>
      )}
    </div>
  )
}
