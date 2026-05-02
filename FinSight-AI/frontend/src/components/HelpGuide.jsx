import { useState } from 'react'
import {
  BookOpen,
  LayoutDashboard,
  PieChart,
  ShieldAlert,
  Activity,
  Zap,
  Bell,
  Bot,
  X,
  ChevronRight,
  Check,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    content: [
      {
        title: 'Welcome to FinSight AI!',
        description: 'Your AI-powered portfolio risk intelligence platform.'
      },
      {
        title: 'First Steps',
        description: '1. Log in with your username (use quick demo buttons for testing)\n2. Go to Portfolio to add your holdings\n3. Analyze your risk metrics\n4. Set up alerts for risk thresholds'
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    content: [
      {
        title: 'Overview',
        description: 'The Dashboard gives you a birds-eye view of your portfolio performance and market conditions.'
      },
      {
        title: 'Key Metrics Displayed',
        description: '• Portfolio Value & Changes\n• Daily VaR (Value at Risk)\n• Sharpe Ratio\n• Beta (market sensitivity)\n• Volatility metrics\n• Market Overview (S&P 500, NASDAQ, etc.)'
      },
      {
        title: 'Color Coding',
        description: '🟢 Green = Good/Low Risk\n🟡 Yellow = Moderate\n🔴 Red = High Risk'
      }
    ]
  },
  {
    id: 'portfolio',
    title: 'Portfolio Analyzer',
    icon: PieChart,
    content: [
      {
        title: 'Building Your Portfolio',
        description: 'Add stocks by ticker symbol and allocate weights (percentages). Total must equal 100%.'
      },
      {
        title: 'Features',
        description: '• Add multiple holdings\n• Auto-distribute weights equally\n• Real-time market data integration\n• Instant risk calculation\n• Expected returns analysis'
      },
      {
        title: 'Tips',
        description: '✓ Use valid stock tickers (AAPL, TSLA, GOOGL, etc.)\n✓ Weights must sum to 100%\n✓ Click "Analyze Portfolio" to see metrics'
      }
    ]
  },
  {
    id: 'risk-analysis',
    title: 'Risk Analysis',
    icon: ShieldAlert,
    content: [
      {
        title: 'Understanding Risk Metrics',
        description: 'FinSight AI calculates 15+ risk metrics for your portfolio.'
      },
      {
        title: 'Key Metrics Explained',
        description: '• VaR (Value at Risk): Maximum expected loss at confidence level\n• Sharpe Ratio: Risk-adjusted returns (>1 is good, >2 is excellent)\n• Beta: Sensitivity to market movements (1 = market)\n• Volatility: How much prices fluctuate\n• Max Drawdown: Largest peak-to-trough decline'
      },
      {
        title: 'Using This Page',
        description: 'View detailed breakdowns of each risk metric with AI-generated explanations in plain English.'
      }
    ]
  },
  {
    id: 'anomalies',
    title: 'Anomaly Detection',
    icon: Activity,
    content: [
      {
        title: 'What are Anomalies?',
        description: 'Unusual patterns or movements in your portfolio that deviate from expected behavior.'
      },
      {
        title: 'Detection Methods',
        description: '• Z-score analysis\n• Concentration risk detection\n• Market event correlation\n• Drift detection'
      },
      {
        title: 'Interpreting Alerts',
        description: '🔴 High Priority: Immediate attention needed\n🟡 Medium: Monitor closely\n🟢 Low: Informational'
      }
    ]
  },
  {
    id: 'simulator',
    title: 'Scenario Simulator',
    icon: Zap,
    content: [
      {
        title: 'What-If Analysis',
        description: 'Test how your portfolio would perform under different market scenarios.'
      },
      {
        title: 'Available Scenarios',
        description: '• Market Crash (-20% drop)\n• Rate Hike (interest rate increase)\n• Bull Run (+20% gain)\n• Bear Market (decline)\n• Custom scenarios'
      },
      {
        title: 'How to Use',
        description: '1. Ensure portfolio is loaded\n2. Select a scenario\n3. Click "Run Simulation"\n4. Review projected impact'
      }
    ]
  },
  {
    id: 'alerts',
    title: 'Alert System',
    icon: Bell,
    content: [
      {
        title: 'Setting Up Alerts',
        description: 'Get notified when risk metrics exceed your comfort threshold.'
      },
      {
        title: 'Alert Types',
        description: '• VaR Thresholds\n• Volatility Alerts\n• Drawdown Warnings\n• Concentration Risk'
      },
      {
        title: 'Configuration',
        description: 'Set percentage thresholds and choose whether alerts are enabled. Alerts appear as banners across the app.'
      }
    ]
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    icon: Bot,
    content: [
      {
        title: 'Your Personal Finance AI',
        description: 'Chat with our AI assistant powered by Groq for instant answers about your portfolio and financial concepts.'
      },
      {
        title: 'What You Can Ask',
        description: '• "Explain VaR in simple terms"\n• "How can I reduce my portfolio risk?"\n• "What does a Sharpe ratio of 1.5 mean?"\n• "Should I be worried about market volatility?"'
      },
      {
        title: 'Tips',
        description: '• Be specific with your questions\n• The AI remembers conversation context\n• Available 24/7 for instant help'
      }
    ]
  }
]

export default function HelpGuide() {
  const [expandedSection, setExpandedSection] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  const toggleComplete = (stepId) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(s => s !== stepId)
        : [...prev, stepId]
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">FinSight AI Guide</h1>
            <p className="text-slate-400">Learn how to use all features of the platform</p>
          </div>
        </div>
      </div>

      {/* Quick Start Checklist */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Quick Start Checklist
        </h2>
        <div className="space-y-3">
          {[
            { id: 'login', text: 'Log in to your account' },
            { id: 'portfolio', text: 'Create your first portfolio' },
            { id: 'analyze', text: 'Run portfolio analysis' },
            { id: 'alerts', text: 'Set up your first alert' },
            { id: 'ai', text: 'Chat with AI Assistant' }
          ].map((step) => (
            <label
              key={step.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={completedSteps.includes(step.id)}
                onChange={() => toggleComplete(step.id)}
                className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500"
              />
              <span className={`flex-1 text-slate-300 ${
                completedSteps.includes(step.id) ? 'line-through opacity-50' : ''
              }`}>
                {step.text}
              </span>
              {completedSteps.includes(step.id) && (
                <Check className="h-5 w-5 text-green-400" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Feature Guides */}
      <div className="grid gap-4 md:grid-cols-2">
        {helpSections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id

          return (
            <div
              key={section.id}
              className={`card cursor-pointer transition-all ${
                isExpanded ? 'md:col-span-2' : ''
              }`}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isExpanded ? 'bg-primary-600' : 'bg-slate-800'
                  } transition-colors`}>
                    <Icon className={`h-5 w-5 ${isExpanded ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{section.title}</h3>
                    <p className="text-sm text-slate-400">
                      {isExpanded ? 'Click to collapse' : 'Click to expand'}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-800/50 p-4">
                      <h4 className="mb-2 font-medium text-white">{item.title}</h4>
                      <p className="whitespace-pre-line text-sm text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          Keyboard Shortcuts
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { key: 'Ctrl + K', desc: 'Quick navigation' },
            { key: 'Ctrl + B', desc: 'Go to Dashboard' },
            { key: 'Ctrl + P', desc: 'Go to Portfolio' },
            { key: 'Ctrl + A', desc: 'Go to AI Chat' }
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span className="text-sm text-slate-400">{shortcut.desc}</span>
              <kbd className="rounded bg-slate-700 px-2 py-1 text-xs text-white font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Need More Help */}
      <div className="card border-primary-500/30 bg-primary-900/10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600/20">
            <AlertTriangle className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Need more help?</h3>
            <p className="mt-1 text-sm text-slate-400">
              Check out our documentation on GitHub or chat with the AI Assistant for personalized help.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
