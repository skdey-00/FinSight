/**
 * Auth Context - localStorage-based mock authentication
 * Simulates SaaS multi-user functionality
 */
import { createContext, useContext, useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('finsight_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('finsight_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username, email = null) => {
    const userData = {
      id: `user_${Date.now()}`,
      username,
      email: email || `${username}@finsight.ai`,
      createdAt: new Date().toISOString(),
      subscriptionTier: 'free' // free, pro, enterprise
    }

    setUser(userData)
    localStorage.setItem('finsight_user', JSON.stringify(userData))

    // Also store in a separate key for session persistence
    localStorage.setItem('finsight_session', JSON.stringify({
      userId: userData.id,
      username: userData.username,
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }))

    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('finsight_user')
    localStorage.removeItem('finsight_session')
  }

  const updateUser = (updates) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('finsight_user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook for accessing alert settings from localStorage
export const useAlertSettings = () => {
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const stored = localStorage.getItem('finsight_alerts')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        // Use defaults
        setSettings(getDefaultSettings())
      }
    } else {
      setSettings(getDefaultSettings())
    }
    setIsLoading(false)
  }

  const saveSettings = async (newSettings) => {
    const settingsToSave = { ...getDefaultSettings(), ...newSettings }

    try {
      // Save to backend
      const response = await fetch(`${API_BASE}/api/alerts/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      })

      if (response.ok) {
        const data = await response.json()
        // Store locally for quick access
        localStorage.setItem('finsight_alerts', JSON.stringify(settingsToSave))
        setSettings(settingsToSave)
        return { success: true, data }
      }
    } catch (error) {
      // Save locally even if backend fails
      localStorage.setItem('finsight_alerts', JSON.stringify(settingsToSave))
      setSettings(settingsToSave)
      return { success: true, offline: true }
    }
  }

  const checkThresholds = (metrics) => {
    if (!settings || !metrics) return { triggered: [] }

    const triggered = []

    // Check VaR threshold
    if (settings.varThreshold.enabled) {
      const var95 = Math.abs(metrics.value_at_risk?.['95%']?.daily_percent || 0)
      if (var95 > settings.varThreshold.value) {
        triggered.push({
          type: 'var',
          message: `Daily VaR (${var95.toFixed(2)}%) exceeds threshold (${settings.varThreshold.value}%)`,
          severity: 'critical'
        })
      }
    }

    // Check volatility threshold
    if (settings.volatilityThreshold.enabled) {
      const volatility = metrics.sharpe_ratio?.annual_volatility_percent || 0
      if (volatility > settings.volatilityThreshold.value) {
        triggered.push({
          type: 'volatility',
          message: `Volatility (${volatility.toFixed(2)}%) exceeds threshold (${settings.volatilityThreshold.value}%)`,
          severity: 'warning'
        })
      }
    }

    // Check drawdown threshold
    if (settings.drawdownThreshold.enabled) {
      const drawdown = Math.abs(metrics.max_drawdown?.max_drawdown_percent || 0)
      if (drawdown > settings.drawdownThreshold.value) {
        triggered.push({
          type: 'drawdown',
          message: `Max drawdown (${drawdown.toFixed(2)}%) exceeds threshold (${settings.drawdownThreshold.value}%)`,
          severity: 'critical'
        })
      }
    }

    // Check concentration threshold
    if (settings.concentrationThreshold.enabled) {
      // This would need portfolio data
    }

    return { triggered, hasAlerts: triggered.length > 0 }
  }

  return {
    settings,
    isLoading,
    saveSettings,
    loadSettings,
    checkThresholds
  }
}

const getDefaultSettings = () => ({
  varThreshold: { enabled: true, value: 3.0, condition: 'above' },
  volatilityThreshold: { enabled: true, value: 25.0, condition: 'above' },
  drawdownThreshold: { enabled: true, value: 15.0, condition: 'above' },
  concentrationThreshold: { enabled: true, value: 50.0, condition: 'above' },
  emailNotifications: true,
  pushNotifications: false
})
