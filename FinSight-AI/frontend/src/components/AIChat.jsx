import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Loader2, Sparkles, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Typing animation component
const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-3">
    <div className="flex gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400" />
    </div>
  </div>
)

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your FinSight AI assistant. I can help you with:\n\n• Portfolio analysis and risk insights\n• Understanding financial metrics\n• Market trends and anomalies\n• Investment strategies\n\nHow can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: user?.id || 'default',
          question: input,
          context: {
            username: user?.username || 'User',
            history: messages.slice(-5) // Send last 5 messages for context
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data?.response || data.response || 'I apologize, but I couldn\'t process that request. Please try again.'
      }])
    } catch (err) {
      console.error('AI Chat error:', err)
      setError(err.message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔴 Sorry, I\'m having trouble connecting right now. The AI service may be unavailable. Please try again later.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    'What is Value at Risk (VaR)?',
    'How do I interpret my Sharpe ratio?',
    'What are the signs of market anomaly?',
    'How can I reduce my portfolio risk?',
    'Explain beta in simple terms'
  ]

  const handleSuggestedQuestion = (question) => {
    setInput(question)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FinSight AI Assistant</h1>
              <p className="text-sm text-slate-400">Powered by Groq AI • Ask anything about your portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-primary-400">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-slate-800 px-4 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="border-t border-slate-700 p-4">
            <p className="mb-3 text-sm text-slate-400">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio, risk metrics, or investment strategies..."
              className="input-field flex-1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary flex items-center gap-2 px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-400">
              ⚠️ {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
