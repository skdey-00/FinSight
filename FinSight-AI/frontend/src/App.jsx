import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import PortfolioAnalyzer from './pages/PortfolioAnalyzer'
import RiskAnalysis from './pages/RiskAnalysis'
import AnomalyDetection from './pages/AnomalyDetection'
import ScenarioSimulator from './pages/ScenarioSimulator'
import Alerts from './pages/Alerts'
import Login from './pages/Login'
import AlertSettings from './components/AlertSettings'
import AIChat from './components/AIChat'
import HelpGuide from './components/HelpGuide'
import { useAlertSettings } from './contexts/AuthContext'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public route (accessible without auth)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Index route redirect
function IndexRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />
}

// Sample risk metrics for alert banner
const sampleRiskMetrics = {
  value_at_risk: {
    '95%': { daily_percent: -3.5 }
  },
  sharpe_ratio: {
    annual_volatility_percent: 28
  },
  max_drawdown: {
    max_drawdown_percent: -18
  }
}

// Layout wrapper with consistent content
function LayoutWrapper({ children }) {
  return <Layout riskMetrics={sampleRiskMetrics}>{children}</Layout>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Default route - redirect based on auth status */}
        <Route path="/" element={<IndexRedirect />} />

        {/* Protected routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWrapper><Dashboard /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <LayoutWrapper><PortfolioAnalyzer /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-analysis"
          element={
            <ProtectedRoute>
              <LayoutWrapper><RiskAnalysis /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/anomalies"
          element={
            <ProtectedRoute>
              <LayoutWrapper><AnomalyDetection /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <LayoutWrapper><ScenarioSimulator /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <LayoutWrapper><AlertsPage /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute>
              <LayoutWrapper><AIChat /></LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <LayoutWrapper><HelpGuide /></LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to appropriate page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

// Alerts page component
function AlertsPage() {
  const { settings, checkThresholds } = useAlertSettings()
  const [showBanner, setShowBanner] = useState(true)

  const sampleMetrics = {
    value_at_risk: {
      '95%': { daily_percent: -3.5 }
    },
    sharpe_ratio: {
      annual_volatility_percent: 28
    },
    max_drawdown: {
      max_drawdown_percent: -18
    }
  }

  const { triggered } = checkThresholds(sampleMetrics)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Alert Settings</h1>
        <p className="mt-2 text-slate-400">
          Configure risk thresholds and notification preferences
        </p>
      </div>

      {/* Active alerts banner */}
      {triggered.length > 0 && showBanner && (
        <div className="rounded-lg border-2 border-red-800 bg-red-900/30 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-red-400">⚠️ Active Alerts</h3>
              <ul className="mt-2 space-y-1">
                {triggered.map((alert, i) => (
                  <li key={i} className="text-sm text-red-300">
                    • {alert.message}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <AlertSettings />
    </div>
  )
}

export default App
