import { useState, useEffect, useRef } from 'react'
import { Send, Bot, Loader2, AlertCircle, Lightbulb, ShieldAlert } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Typing animation component
const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3">
    <div className="flex gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400" />
    </div>
    <span className="text-sm text-slate-400">AI is analyzing...</span>
  </div>
)

// Typewriter effect for streaming text
const TypewriterText = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayedText('')

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayedText}</span>
}

// Animated counter for number values (standalone version)
const AnimatedNumber = ({ value, prefix = '', suffix = '', duration = 1000 }) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCurrentValue(value)
        clearInterval(timer)
      } else {
        setCurrentValue(current)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span>
      {prefix}{typeof currentValue === 'number' ? currentValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) : currentValue}{suffix}
    </span>
  )
}

// Parse markdown-like formatting from AI response
const FormattedResponse = ({ text }) => {
  const parseText = (input) => {
    if (!input) return []

    const lines = input.split('\n').filter(line => line.trim())
    const sections = []

    for (const line of lines) {
      if (line.startsWith('## ')) {
        sections.push({
          type: 'heading',
          content: line.replace('## ', '').trim()
        })
      } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\./.test(line)) {
        sections.push({
          type: 'bullet',
          content: line.replace(/^[-*]\s*|^\d+\.\s*/, '').trim()
        })
      } else {
        sections.push({
          type: 'paragraph',
          content: line.trim()
        })
      }
    }

    return sections
  }

  const sections = parseText(text)

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        if (section.type === 'heading') {
          return (
            <h4 key={idx} className="font-semibold text-white">
              {section.content}
            </h4>
          )
        }
        if (section.type === 'bullet') {
          return (
            <li key={idx} className="ml-4 flex items-start gap-2 text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-400 flex-shrink-0" />
              <span>{section.content}</span>
            </li>
          )
        }
        return (
          <p key={idx} className="text-slate-300 leading-relaxed">
            {section.content}
          </p>
        )
      })}
    </div>
  )
}

// Main AI Insights Component
export default function AIInsights({
  riskMetrics = null,
  portfolioInfo = null,
  autoAnalyze = false
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (autoAnalyze && riskMetrics) {
      analyzeRisk()
    }
  }, [riskMetrics])

  useEffect(() => {
    scrollToBottom()
  }, [response, isAnalyzing])

  const analyzeRisk = async () => {
    setIsAnalyzing(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_metrics: riskMetrics || getDefaultRiskMetrics(),
          portfolio_info: portfolioInfo
        })
      })

      if (!res.ok) {
        throw new Error('Failed to get AI insights')
      }

      const data = await res.json()

      if (data.success && data.data) {
        setResponse(data.data)
      } else if (data.data?.error) {
        setError(data.data.error)
      } else {
        setError('Unable to generate insights. Please try again.')
      }

    } catch (err) {
      setError(err.message || 'Failed to connect to AI service')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getDefaultRiskMetrics = () => ({
    value_at_risk: {
      '95%': { daily_percent: -2.34, annual_percent: -37.14 }
    },
    sharpe_ratio: {
      sharpe_ratio: 1.24,
      annual_return_percent: 18.5,
      annual_volatility_percent: 14.8
    },
    beta: { beta: 1.15 },
    max_drawdown: { max_drawdown_percent: -12.5 }
  })

  return (
    <div className="flex flex-col">
      {/* Header with Analyze Button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Risk Analyst</h3>
            <p className="text-xs text-slate-400">Powered by Llama 3</p>
          </div>
        </div>

        <button
          onClick={analyzeRisk}
          disabled={isAnalyzing}
          className="btn-primary flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Explain My Risk
            </>
          )}
        </button>
      </div>

      {/* Chat Container */}
      <div className="card min-h-[400px]">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-900/30 border border-red-800 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {!response && !isAnalyzing && !error && (
          <div className="flex h-[340px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
              <Bot className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-lg font-medium text-slate-300">Ready to analyze your portfolio</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Click "Explain My Risk" to get a plain-English breakdown of your portfolio's risk profile,
              biggest risk factors, and actionable recommendations.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex h-[340px] flex-col items-center justify-center">
            <TypingIndicator />
          </div>
        )}

        {response && !isAnalyzing && (
          <div className="space-y-6">
            {/* Explanation Section */}
            {response.explanation && (
              <div className="rounded-lg bg-slate-800/50 p-5 border border-slate-700">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <h4 className="font-semibold text-white">Risk Profile Explanation</h4>
                </div>
                <TypewriterText text={response.explanation} />
              </div>
            )}

            {/* Biggest Risk Factor */}
            {response.biggest_risk_factor && (
              <div className="rounded-lg bg-red-900/20 p-5 border border-red-900/50">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <h4 className="font-semibold text-white">Biggest Risk Factor</h4>
                </div>
                <p className="text-slate-300">{response.biggest_risk_factor}</p>
              </div>
            )}

            {/* Recommendations */}
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="rounded-lg bg-green-900/20 p-5 border border-green-900/50">
                <h4 className="mb-3 font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-400" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <span className="mt-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-900/50 text-xs font-medium text-green-400">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-slate-500">
              Analyzed at {new Date(response.explained_at).toLocaleString()}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
