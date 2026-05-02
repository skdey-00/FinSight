import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, User, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username.trim()) return

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const userData = login(username.trim(), showEmail ? email.trim() : null)
      setIsLoading(false)
      navigate('/dashboard')
    }, 500)
  }

  const quickLogin = (presetUsername) => {
    setUsername(presetUsername)
    setIsLoading(true)
    setTimeout(() => {
      login(presetUsername)
      navigate('/dashboard')
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FinSight AI</h1>
          <p className="mt-2 text-slate-400">Portfolio Risk Intelligence</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter your username to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field w-full pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {showEmail && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field w-full pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {showEmail ? 'Remove email' : '+ Add email (optional)'}
            </button>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-slate-700" />
            <span className="text-xs text-slate-500">Quick demo</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Investor', 'Trader', 'Analyst'].map((name) => (
              <button
                key={name}
                onClick={() => quickLogin(name.toLowerCase())}
                className="rounded-lg border border-slate-700 bg-slate-800/50 py-2 text-sm text-slate-300 hover:border-primary-500 hover:bg-primary-900/20 hover:text-white transition-all"
                disabled={isLoading}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
