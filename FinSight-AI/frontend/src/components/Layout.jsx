import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PieChart,
  ShieldAlert,
  Activity,
  Zap,
  Bell,
  TrendingUp,
  User,
  LogOut,
  Bot,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AlertBanner, { AlertBadge } from './AlertBanner'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: ShieldAlert },
  { name: 'Anomalies', href: '/anomalies', icon: Activity },
  { name: 'Simulator', href: '/simulator', icon: Zap },
  { name: 'Alerts', href: '/alerts', icon: Bell },
]

const aiTools = [
  { name: 'AI Chat', href: '/ai-chat', icon: Bot, description: 'Chat with AI assistant' },
  { name: 'Help Guide', href: '/help', icon: BookOpen, description: 'Learn how to use the platform' },
]

export default function Layout({ children, riskMetrics }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null // Will be handled by router
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">FinSight AI</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-4">
            <p className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* AI Tools Section */}
          <div className="border-t border-slate-800 p-4">
            <p className="mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Tools
            </p>
            <nav className="space-y-1">
              {aiTools.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }
                    `}
                    title={item.description}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex-1">
                      {item.name}
                    </div>
                    {item.name === 'AI Chat' && (
                      <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-xs text-primary-400">
                        New
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-slate-800 p-4">
          {/* Alert Badge if there are active alerts */}
          <div className="mb-3 flex justify-end">
            <AlertBadge count={2} onClick={() => navigate('/alerts')} />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.subscriptionTier || 'Free'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        {/* Alert Banner */}
        {riskMetrics && (
          <div className="border-b border-slate-800">
            <AlertBanner metrics={riskMetrics} />
          </div>
        )}

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
