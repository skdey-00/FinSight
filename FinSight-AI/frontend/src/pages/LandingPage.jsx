import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShieldAlert,
  Bot,
  Zap,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Github,
  Twitter
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: ShieldAlert,
      title: 'Real-Time Risk Metrics',
      description: 'Track VaR, Sharpe ratio, beta, volatility, and max drawdown with live market data integration.',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Bot,
      title: 'AI-Powered Explanations',
      description: 'Get plain English insights from Llama 3. Understand your portfolio risks without the financial jargon.',
      color: 'from-primary-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Scenario Simulation',
      description: 'Test your portfolio against market crashes, rate hikes, or bull runs. See the impact before it happens.',
      color: 'from-yellow-500 to-amber-500'
    }
  ]

  const stats = [
    { value: '15+', label: 'Risk Metrics' },
    { value: '4', label: 'AI Models' },
    { value: '100%', label: 'Data Accuracy' },
    { value: '24/7', label: 'Monitoring' }
  ]

  const useCases = [
    {
      title: 'Portfolio Managers',
      description: 'Monitor client portfolios in real-time and explain risks in language anyone can understand.'
    },
    {
      title: 'Retail Investors',
      description: 'Stop guessing. Know exactly how much risk you\'re taking and if it\'s worth the reward.'
    },
    {
      title: 'Financial Advisors',
      description: 'Provide clients with clear, AI-generated risk reports that build trust and transparency.'
    },
    {
      title: 'Quant Researchers',
      description: 'Rapid scenario testing and anomaly detection to identify hidden portfolio risks.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FinSight AI</span>
            </div>

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

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="btn-primary flex items-center gap-2"
              >
                Try Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-slate-950 to-slate-950" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-900/30 border border-primary-700 px-4 py-2">
              <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-sm text-primary-300">Now with AI-powered risk explanations</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Understand your portfolio
              <span className="block bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                risk in plain English
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-slate-400 sm:text-xl max-w-2xl mx-auto">
              Stop deciphering complex financial metrics. FinSight AI translates your portfolio risks
              into clear, actionable insights powered by Llama 3 — so you can invest with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/login"
                className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
              >
                Try Demo Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://github.com/skdey-00/FinSight"
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-lg"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>Real-time market data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span>AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Everything you need to understand risk</h2>
            <p className="mt-4 text-slate-400">
              Professional-grade risk analytics, explained in a way anyone can understand.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:border-slate-600 transition-all"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>

                {/* Hover effect indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900/30">
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
                description: 'Add your holdings and weights. We\'ll fetch live market data automatically.'
              },
              {
                step: '02',
                title: 'AI analyzes your risk',
                description: 'Our engine calculates 15+ risk metrics and Llama 3 explains what they mean.'
              },
              {
                step: '03',
                title: 'Get actionable insights',
                description: 'Receive clear recommendations, run scenarios, and set up custom alerts.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card h-full">
                  <div className="mb-4 text-5xl font-bold text-slate-700">{item.step}</div>
                  <h3 className="mb-3 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>

                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden absolute left-1/2 top-1/2 -translate-x-1/2 md:block">
                    <ChevronRight className="h-6 w-6 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Built for everyone who manages risk</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="card hover:border-slate-600 transition-all">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                  <Activity className="h-5 w-5 text-primary-400" />
                </div>
                <h3 className="font-semibold text-white">{useCase.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Preview */}
      <section className="py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-white">See your risks at a glance</h2>
            <p className="mt-4 text-slate-400">
              All your key metrics, color-coded and explained in plain English.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mx-auto max-w-5xl">
            <div className="card overflow-hidden">
              {/* Fake dashboard header */}
              <div className="border-b border-slate-700 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="text-sm text-slate-400">Live Dashboard Demo</span>
                </div>
              </div>

              {/* Fake metrics */}
              <div className="grid grid-cols-4 gap-4 p-6">
                {[
                  { label: 'Value at Risk', value: '-2.34%', good: true },
                  { label: 'Sharpe Ratio', value: '1.24', good: true },
                  { label: 'Beta', value: '1.15', good: false },
                  { label: 'Max Drawdown', value: '-8.5%', good: true }
                ].map((metric, i) => (
                  <div key={i} className={`rounded-lg p-4 ${metric.good ? 'bg-green-900/20' : 'bg-yellow-900/20'}`}>
                    <p className="text-xs text-slate-400">{metric.label}</p>
                    <p className={`mt-2 text-lg font-bold ${metric.good ? 'text-green-400' : 'text-yellow-400'}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fake AI explanation */}
              <div className="border-t border-slate-700 p-6">
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">AI Analysis</p>
                    <p className="mt-1 text-sm text-slate-400">
                      "Your portfolio has moderate risk with a concentration in technology (52%). Consider diversifying..."
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

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to understand your risk?</h2>
          <p className="mt-4 text-slate-400">
            Join hundreds of investors who use FinSight AI to make better decisions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/demo"
              className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-slate-500">No credit card required • Free forever for basic use</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                  <TrendingUp className="h-4 w-4 text-white" />
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

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm text-slate-500">
              © 2025 FinSight AI. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <a href="https://github.com/skdey-00/FinSight" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
