import { useState, useEffect } from 'react'
import {
  Bell,
  BellRing,
  ShieldAlert,
  TrendingDown,
  Activity,
  PieChart,
  Mail,
  Smartphone,
  Save,
  CheckCircle2,
  X
} from 'lucide-react'
import { useAlertSettings } from '../contexts/AuthContext'

// Threshold slider component
const ThresholdSlider = ({
  label,
  icon: Icon,
  value,
  enabled,
  suffix = '%',
  onChange,
  onToggle,
  min = 0,
  max = 50,
  color = 'primary'
}) => {
  const colors = {
    primary: 'text-primary-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400'
  }

  return (
    <div className={`card transition-all ${!enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${enabled ? 'bg-slate-800' : 'bg-slate-900'}`}>
            <Icon className={`h-5 w-5 ${colors[color]}`} />
          </div>
          <div>
            <h4 className="font-medium text-white">{label}</h4>
            <p className="text-sm text-slate-400">
              Alert when value exceeds {value}{suffix}
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`
            relative h-6 w-11 rounded-full transition-colors duration-200
            ${enabled ? 'bg-primary-600' : 'bg-slate-700'}
          `}
        >
          <span
            className={`
              absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4">
          <input
            type="range"
            min={min}
            max={max}
            step={0.5}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">{min}{suffix}</span>
            <span className={`font-bold ${colors[color]}`}>
              {value}{suffix}
            </span>
            <span className="text-slate-500">{max}{suffix}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Alert Settings Component
export default function AlertSettings({ onSave }) {
  const { settings, isLoading, saveSettings } = useAlertSettings()
  const [localSettings, setLocalSettings] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!isLoading && settings) {
      setLocalSettings(JSON.parse(JSON.stringify(settings)))
    }
  }, [settings, isLoading])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const result = await saveSettings(localSettings)

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)

        if (onSave) {
          onSave(localSettings)
        }
      }

      if (result.offline) {
        // Show offline indicator
        setSaveError('Saved locally (backend unavailable)')
        setTimeout(() => setSaveError(null), 3000)
      }
    } catch (error) {
      setSaveError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateThreshold = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }))
  }

  const toggleThreshold = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key]?.enabled }
    }))
  }

  const toggleNotification = (type) => {
    setLocalSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (isLoading || !localSettings) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-slate-400">Loading alert settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-400" />
            Alert Settings
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Set thresholds to get notified when portfolio risks exceed your comfort level
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Settings saved</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {saveError && (
        <div className="flex items-center justify-between rounded-lg bg-yellow-900/30 border border-yellow-800 px-4 py-3">
          <span className="text-sm text-yellow-300">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-yellow-400 hover:text-yellow-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Risk Thresholds */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
          Risk Thresholds
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ThresholdSlider
            label="Value at Risk (VaR)"
            icon={ShieldAlert}
            value={localSettings.varThreshold.value}
            enabled={localSettings.varThreshold.enabled}
            onChange={(val) => updateThreshold('varThreshold', val)}
            onToggle={() => toggleThreshold('varThreshold')}
            min={1}
            max={10}
            color="red"
          />

          <ThresholdSlider
            label="Volatility"
            icon={Activity}
            value={localSettings.volatilityThreshold.value}
            enabled={localSettings.volatilityThreshold.enabled}
            onChange={(val) => updateThreshold('volatilityThreshold', val)}
            onToggle={() => toggleThreshold('volatilityThreshold')}
            min={10}
            max={50}
            color="yellow"
          />

          <ThresholdSlider
            label="Max Drawdown"
            icon={TrendingDown}
            value={localSettings.drawdownThreshold.value}
            enabled={localSettings.drawdownThreshold.enabled}
            onChange={(val) => updateThreshold('drawdownThreshold', val)}
            onToggle={() => toggleThreshold('drawdownThreshold')}
            min={5}
            max={30}
            color="red"
          />

          <ThresholdSlider
            label="Concentration"
            icon={PieChart}
            value={localSettings.concentrationThreshold.value}
            enabled={localSettings.concentrationThreshold.enabled}
            onChange={(val) => updateThreshold('concentrationThreshold', val)}
            onToggle={() => toggleThreshold('concentrationThreshold')}
            min={20}
            max={80}
            color="primary"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <h3 className="mb-4 text-sm font-medium text-slate-400 uppercase tracking-wide">
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive alerts via email</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('emailNotifications')}
              className={`
                relative h-6 w-11 rounded-full transition-colors duration-200
                ${localSettings.emailNotifications ? 'bg-primary-600' : 'bg-slate-700'}
              `}
            >
              <span
                className={`
                  absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200
                  ${localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-slate-400">Browser push notifications</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('pushNotifications')}
              className={`
                relative h-6 w-11 rounded-full transition-colors duration-200
                ${localSettings.pushNotifications ? 'bg-primary-600' : 'bg-slate-700'}
              `}
            >
              <span
                className={`
                  absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200
                  ${localSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="card bg-gradient-to-r from-primary-900/20 to-purple-900/20 border-primary-800">
        <div className="flex items-start gap-3">
          <BellRing className="h-5 w-5 text-primary-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-white">How Alerts Work</h4>
            <p className="mt-1 text-sm text-slate-400">
              When your portfolio metrics exceed these thresholds, you'll see a red banner alert
              on your dashboard. We'll also send notifications based on your preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Alert Settings
          </>
        )}
      </button>
    </div>
  )
}
