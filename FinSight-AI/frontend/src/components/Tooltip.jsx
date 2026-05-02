import { useState } from 'react'

const TOOLTIP_EXPLANATIONS = {
  'Portfolio Value': 'The total current market value of all your holdings. Calculated as shares × current price for each stock.',
  'Total Cost': 'The original amount you paid to purchase all your holdings. Calculated as shares × buy price.',
  'Total Gain/Loss': 'The difference between your portfolio\'s current value and what you paid. Positive means profit, negative means loss.',
  'Return': 'The percentage return on your investment. Calculated as (Current Value - Cost) / Cost × 100.',
  'Value at Risk (VaR)': 'Estimates the maximum potential loss your portfolio could experience with 95% confidence. For example, a 2% daily VaR means there\'s a 5% chance of losing more than 2% in a single day.',
  'Sharpe Ratio': 'Measures risk-adjusted returns. Higher is better. Above 1 = good, above 2 = excellent. It shows how much return you\'re getting for each unit of risk taken.',
  'Beta': 'Measures your portfolio\'s sensitivity to market movements. Above 1 = more volatile than market, below 1 = less volatile. Beta of 1.15 means your portfolio tends to move 15% more than the market.',
  'Annual Volatility': 'Measures how much your portfolio\'s value fluctuates. Higher volatility means larger price swings. 15-20% is typical for stocks.',
  'Max Drawdown': 'The largest peak-to-valley decline in your portfolio\'s historical value. Shows the worst-case loss you would have experienced if you bought at the peak and sold at the trough.',
  'Diversity': 'Having different types of assets reduces risk. A well-diversified portfolio has 3+ stocks across different sectors.'
}

export default function Tooltip({ children, term }) {
  const [isVisible, setIsVisible] = useState(false)
  const explanation = TOOLTIP_EXPLANATIONS[term]

  if (!explanation) {
    return children
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-full top-1/2 z-50 ml-2 w-72 -translate-y-1/2 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-slate-300 shadow-xl">
          <p className="font-medium text-white mb-1">{term}</p>
          <p>{explanation}</p>
          <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-b border-slate-700 bg-slate-900" />
        </div>
      )}
    </div>
  )
}
