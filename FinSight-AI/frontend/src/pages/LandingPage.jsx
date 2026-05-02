import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  TrendingUp,
  ShieldAlert,
  Bot,
  Zap,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle2,
  Github,
  Twitter,
  Bell,
  PieChart,
  Eye
} from 'lucide-react'

export default function LandingPage() {
  const [expandedCard, setExpandedCard] = useState(null)
  const [visibleFeatures, setVisibleFeatures] = useState([])

  const features = [
    {
      id: 1,
      icon: ShieldAlert,
      title: 'Real-Time Risk Metrics',
      shortDesc: 'Live VaR, Sharpe, Beta tracking',
      fullDesc: 'Track Value at Risk, Sharpe ratio, beta, volatility, and max drawdown with live market data integration. Get instant updates as market conditions change.',
      details: ['VaR (95%, 99%)', 'Sharpe Ratio', 'Beta Coefficient', 'Volatility Metrics', 'Max Drawdown', 'Sortino Ratio'],
      color: 'from-red-500 to-orange-500',
      delay: 0
    },
    {
      id: 2,
      icon: Bot,
      title: 'AI-Powered Explanations',
      shortDesc: 'Llama 3 insights in plain English',
      fullDesc: 'Get plain English insights from Llama 3. Understand your portfolio risks without the financial jargon. Ask questions and get instant, clear answers.',
      details: ['Natural Language Queries', 'Context-Aware Analysis', 'Instant Explanations', 'Risk Breakdowns', 'Recommendations'],
      color: 'from-primary-500 to-purple-500',
      delay: 100
    },
    {
      id: 3,
      icon: Zap,
      title: 'Scenario Simulation',
      shortDesc: 'Test crashes, rate hikes, bull runs',
      fullDesc: 'Test your portfolio against market crashes, rate hikes, or bull runs. See the impact before it happens with Monte Carlo simulations.',
      details: ['Market Crash Scenarios', 'Interest Rate Changes', 'Bull/Bear Markets', 'Custom Parameters', 'Historical Replay'],
      color: 'from-yellow-500 to-amber-500',
      delay: 200
    },
    {
      id: 4,
      icon: Eye,
      title: 'Anomaly Detection',
      shortDesc: 'AI catches unusual patterns',
      fullDesc: 'Our AI monitors your portfolio 24/7 and alerts you to unusual patterns, sudden changes, or potential risks before they become problems.',
      details: ['Pattern Recognition', 'Outlier Detection', 'Trend Analysis', 'Automatic Alerts', 'Historical Comparison'],
      color: 'from-purple-500 to-pink-500',
      delay: 300
    },
    {
      id: 5,
      icon: Bell,
      title: 'Smart Alerts',
      shortDesc: 'Custom threshold notifications',
      fullDesc: 'Set custom thresholds for any metric and receive instant notifications when your portfolio needs attention. Never miss a critical risk signal.',
      details: ['Custom Thresholds', 'Multi-Channel Alerts', 'Risk Level Warnings', 'Daily Summaries', 'Push Notifications'],
      color: 'from-green-500 to-emerald-500',
      delay: 400
    },
    {
      id: 6,
      icon: PieChart,
      title: 'Portfolio Analytics',
      shortDesc: 'Full composition breakdown',
      fullDesc: 'Understand your portfolio composition with detailed analytics. Sector exposure, geographic distribution, and concentration analysis at your fingertips.',
      details: ['Sector Breakdown', 'Geographic Exposure', 'Concentration Analysis', 'Correlation Matrix', 'Performance Attribution'],
      color: 'from-blue-500 to-cyan-500',
      delay: 500
    }
  ]

  const stats = [
    { value: '15+', label: 'Risk Metrics' },
    { value: '4', label: 'AI Models' },
    { value: '100%', label: 'Data Accuracy' },
    { value: '24/7', label: 'Monitoring' }
  ]

  useEffect(() => {
    // Staggered animation for feature cards
    const timeouts = features.map((f, i) =>
      setTimeout(() => {
        setVisibleFeatures(prev => [...prev, f.id])
      }, f.delay)
    )
    return () => timeouts.forEach(clearTimeout)
  }, [])

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-neo">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="neo-icon">
                <TrendingUp className="h-6 w-6 text-primary-400" />
              </div>
              <span className="text-xl font-bold text-white">FinSight AI</span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">
                Docs
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="neo-btn-primary flex items-center gap-2 text-sm px-5 py-2.5"
              >
                Try Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Feature Showcase */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Text */}
          <div className="mx-auto max-w-3xl text-center mb-16 animate-fade-in-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full neo-pressed px-4 py-2">
              <span className="flex h-2 w-2 rounded-full bg-accent-success animate-subtle-pulse" />
              <span className="text-sm text-slate-300">Now with AI-powered risk explanations</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Understand your portfolio
              <span className="block gradient-text mt-2">
                risk in plain English
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-slate-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Stop deciphering complex financial metrics. FinSight AI translates your portfolio risks
              into clear, actionable insights powered by Llama 3.
            </p>
          </div>

          {/* Feature Cards Grid - The Main Hero Content */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`
                  neo-card cursor-pointer relative overflow-hidden
                  ${visibleFeatures.includes(feature.id) ? 'animate-fade-in-up' : 'opacity-0'}
                  ${expandedCard === feature.id ? 'ring-2 ring-primary-500/50' : ''}
                `}
                style={{ animationDelay: `${feature.delay}ms` }}
                onClick={() => toggleCard(feature.id)}
              >
                {/* Card Header */}
                <div className="flex items-start gap-4">
                  <div className={`neo-icon flex-shrink-0 bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{feature.shortDesc}</p>
                  </div>
                </div>

                {/* Expandable Content */}
                <div className={`
                  mt-4 overflow-hidden transition-all duration-300 ease-in-out
                  ${expandedCard === feature.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-slate-300 leading-relaxed">{feature.fullDesc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.details.map((detail, idx) => (
                        <span
                          key={idx}
                          className="neo-pressed px-3 py-1 text-xs text-slate-400"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expand Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Click to {expandedCard === feature.id ? 'collapse' : 'expand'}</span>
                  <ArrowRight className={`
                    h-4 w-4 text-primary-400 transition-transform duration-300
                    ${expandedCard === feature.id ? 'rotate-90' : ''}
                  `} />
                </div>

                {/* Hover Glow Effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0
                  hover:opacity-5 transition-opacity duration-300 pointer-events-none
                `} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 flex flex-col items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Link
              to="/login"
              className="neo-btn-primary flex items-center gap-2 px-10 py-4 text-lg glow-primary"
            >
              Start Analyzing Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a
                href="https://github.com/skdey-00/FinSight"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-slate-300 transition-colors"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-accent-success" />
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white">How it works</h2>
            <p className="mt-4 text-slate-400">
              Three steps to portfolio clarity
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Input your portfolio',
                description: 'Add your holdings and weights. We\'ll fetch live market data automatically.',
                icon: PieChart
              },
              {
                step: '02',
                title: 'AI analyzes your risk',
                description: 'Our engine calculates 15+ risk metrics and Llama 3 explains what they mean.',
                icon: Bot
              },
              {
                step: '03',
                title: 'Get actionable insights',
                description: 'Receive clear recommendations, run scenarios, and set up custom alerts.',
                icon: Activity
              }
            ].map((item, index) => (
              <div key={index} className="neo-card relative group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 text-white font-bold">
                  {item.step}
                </div>
                <div className="neo-icon mb-4">
                  <item.icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>

                {/* Connector */}
                {index < 2 && (
                  <div className="hidden absolute top-1/2 -right-4 -translate-y-1/2 md:block">
                    <ArrowRight className="h-6 w-6 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Preview */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white">See your risks at a glance</h2>
            <p className="mt-4 text-slate-400">
              All your key metrics, color-coded and explained in plain English.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mx-auto max-w-5xl">
            <div className="neo-card overflow-hidden p-0">
              {/* Header */}
              <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <span className="flex h-3 w-3 rounded-full bg-accent-success animate-subtle-pulse" />
                <span className="text-sm text-slate-400">Live Dashboard Demo</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {[
                  { label: 'Value at Risk', value: '-2.34%', good: true },
                  { label: 'Sharpe Ratio', value: '1.24', good: true },
                  { label: 'Beta', value: '1.15', good: false },
                  { label: 'Max Drawdown', value: '-8.5%', good: true }
                ].map((metric, i) => (
                  <div
                    key={i}
                    className={`
                      neo-pressed p-4 text-center
                      ${metric.good ? 'text-accent-success' : 'text-accent-warning'}
                    `}
                  >
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI explanation */}
              <div className="border-t border-white/5 p-6">
                <div className="flex items-start gap-3">
                  <div className="neo-icon flex-shrink-0 bg-gradient-to-br from-primary-500 to-purple-500">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">AI Analysis</p>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                      "Your portfolio has moderate risk with a concentration in technology (52%). Consider diversifying into other sectors to reduce volatility..."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Preview • Actual data will vary based on your portfolio
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to understand your risk?</h2>
          <p className="mt-4 text-slate-400">
            Join hundreds of investors who use FinSight AI to make better decisions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Link
              to="/demo"
              className="neo-btn-primary flex items-center gap-2 px-10 py-4 text-lg glow-primary"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-slate-500">No credit card required • Free forever for basic use</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="neo-icon">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                </div>
                <span className="text-lg font-bold text-white">FinSight AI</span>
              </div>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                Real-Time Portfolio Risk Intelligence Platform powered by AI.
                Understand your risks in plain English.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://github.com/skdey-00/FinSight/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">
              © 2025 FinSight AI. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="neo-icon p-2 text-slate-400 hover:text-white">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="neo-icon p-2 text-slate-400 hover:text-white">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
