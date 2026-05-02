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
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null // Will be handled by router
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-neo">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6 bg-neo">
          <div className="neo-icon">
            <TrendingUp className="h-5 w-5 text-primary-400" />
          </div>
          <span className="text-lg font-bold text-white">FinSight AI</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-4">
            <p className="mb-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Main Menu
            </p>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      neo-nav-item ${isActive ? 'active text-primary-400' : 'text-slate-400 hover:text-slate-100'}
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
          <div className="border-t border-white/5 p-4">
            <p className="mb-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Tools
            </p>
            <nav className="space-y-2">
              {aiTools.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      neo-nav-item ${isActive ? 'active text-primary-400' : 'text-slate-400 hover:text-slate-100'}
                    `}
                    title={item.description}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex-1">
                      {item.name}
                    </div>
                    {item.name === 'AI Chat' && (
                      <span className="rounded-full neo-pressed px-2 py-0.5 text-xs text-primary-400">
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
        <div className="border-t border-white/5 p-4 bg-neo">
          {/* Alert Badge if there are active alerts */}
          <div className="mb-3 flex justify-end">
            <AlertBadge count={2} onClick={() => navigate('/alerts')} />
          </div>

          <div className="neo-pressed flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-600">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.subscriptionTier || 'Free'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="neo-icon p-2 text-slate-400 hover:text-accent-danger"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 border-b border-white/5 bg-neo px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neo-icon p-2"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FinSight AI</span>
          </div>
        </div>
        <div className="neo-icon">
          <User className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Main content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        {/* Alert Banner */}
        {riskMetrics && (
          <div className="border-b border-white/5">
            <AlertBanner metrics={riskMetrics} />
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
