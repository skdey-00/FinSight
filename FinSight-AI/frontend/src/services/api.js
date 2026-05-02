import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Portfolio API
export const portfolioAPI = {
  analyze: (data) => api.post('/api/portfolio/analyze', data),
  simulate: (portfolioId, scenario) => api.post(`/api/portfolio/simulate`, portfolioId, scenario),
  getCorrelation: (portfolioId) => api.get(`/api/portfolio/correlation/${portfolioId}`),
  getAllocation: (portfolioId) => api.get(`/api/portfolio/allocation/${portfolioId}`),
  getReturns: (portfolioId, period) => api.get(`/api/portfolio/returns/${portfolioId}?period=${period}`),
}

// Risk API
export const riskAPI = {
  getMetrics: (portfolioId) => api.get(`/api/risk/metrics/${portfolioId}`),
  getVar: (portfolioId, confidence, horizon) =>
    api.get(`/api/risk/var/${portfolioId}?confidence=${confidence}&horizon=${horizon}`),
  getSharpe: (portfolioId, riskFreeRate) =>
    api.get(`/api/risk/sharpe/${portfolioId}?risk_free_rate=${riskFreeRate}`),
  getBeta: (portfolioId, benchmark) =>
    api.get(`/api/risk/beta/${portfolioId}?benchmark=${benchmark}`),
  getVolatility: (portfolioId, period) =>
    api.get(`/api/risk/volatility/${portfolioId}?period=${period}`),
  getHeatmap: (portfolioId) => api.get(`/api/risk/heatmap/${portfolioId}`),
}

// AI API
export const aiAPI = {
  explain: (portfolioId, metrics) => api.post('/api/ai/explain', { portfolio_id: portfolioId, metrics }),
  chat: (portfolioId, question) => api.post('/api/ai/chat', { portfolio_id: portfolioId, question }),
  getInsights: (portfolioId) => api.get(`/api/ai/insights/${portfolioId}`),
  getRecommendations: (portfolioId) => api.get(`/api/ai/recommendations/${portfolioId}`),
  summarize: (portfolioId) => api.post('/api/ai/summarize', { portfolio_id: portfolioId }),
}

// Anomaly API
export const anomalyAPI = {
  detect: (portfolioId, lookbackDays) =>
    api.get(`/api/anomalies/detect/${portfolioId}?lookback_days=${lookbackDays}`),
  getConcentration: (portfolioId) => api.get(`/api/anomalies/concentration/${portfolioId}`),
  getMarketEvents: (days) => api.get(`/api/anomalies/market-events?days=${days}`),
  detectDrift: (portfolioId) => api.get(`/api/anomalies/drift/${portfolioId}`),
}

// Alert API
export const alertAPI = {
  setThreshold: (data) => api.post('/api/alerts/thresholds', data),
  getThresholds: (portfolioId) => api.get(`/api/alerts/thresholds/${portfolioId}`),
  createRule: (data) => api.post('/api/alerts/rules', data),
  getRules: (portfolioId) => api.get(`/api/alerts/rules/${portfolioId}`),
  getHistory: (portfolioId, limit) => api.get(`/api/alerts/history/${portfolioId}?limit=${limit}`),
  testAlert: (ruleId) => api.post(`/api/alerts/test/${ruleId}`),
  deleteRule: (ruleId) => api.delete(`/api/alerts/rules/${ruleId}`),
}

// Market API
export const marketAPI = {
  getOverview: () => api.get('/api/market/overview'),
  getStock: (symbol) => api.get(`/api/market/stock/${symbol}`),
  getHistory: (symbol, period, interval) =>
    api.get(`/api/market/stock/${symbol}/history?period=${period}&interval=${interval}`),
  getCrypto: () => api.get('/api/market/crypto'),
  getNews: (category, limit) => api.get(`/api/market/news?category=${category}&limit=${limit}`),
  getEconomicCalendar: (days) => api.get(`/api/market/economic-calendar?days=${days}`),
}

export default api
