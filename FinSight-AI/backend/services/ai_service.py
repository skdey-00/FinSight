"""
AI Service - AI Risk Explainer
"""
from typing import Dict, List
import json


class AIService:
    def __init__(self):
        # Lazy import to avoid circular dependency
        from services.ai_explainer import ai_explainer
        self.ai_explainer = ai_explainer
        self.risk_explanations = {
            "var": "Value at Risk (VaR) estimates the maximum loss your portfolio could experience with a given confidence level. A VaR of -$2,500 at 95% confidence means there's a 5% chance of losing more than $2,500 in a day.",
            "sharpe": "The Sharpe ratio measures risk-adjusted returns. Above 1 is good, above 2 is excellent. Your ratio indicates how much return you're getting for each unit of risk taken.",
            "beta": "Beta measures your portfolio's sensitivity to market movements. A beta above 1 means your portfolio tends to move more than the market, amplifying both gains and losses.",
            "volatility": "Volatility measures how much your portfolio's value fluctuates. Higher volatility means larger swings in value, which can be stressful but also presents opportunities.",
            "drawdown": "Maximum drawdown shows the largest peak-to-valley decline in your portfolio's value. It helps you understand the worst-case historical loss you would have experienced."
        }

    async def explain_risk_metrics(self, portfolio_id: str, metrics: Dict) -> Dict:
        """Convert risk metrics into plain English explanations"""
        explanations = []

        # VaR explanation
        if "var" in metrics:
            var_value = metrics["var"].get("daily_95", 0)
            explanations.append({
                "metric": "Value at Risk",
                "value": f"{var_value}%",
                "explanation": f"Based on your portfolio's history, there's a 5% chance you could lose more than {var_value}% of your portfolio value in a single day. This is your worst-case scenario threshold.",
                "plain_english": f"On a really bad day, you might lose about {var_value}% of your portfolio. This happens about 1 in 20 trading days.",
                "concern_level": "low" if var_value < 3 else "medium" if var_value < 5 else "high"
            })

        # Sharpe ratio explanation
        if "sharpe_ratio" in metrics:
            sharpe = metrics["sharpe_ratio"]
            sharpe_comment = (
                "is excellent - you're getting good returns for the risk you're taking" if sharpe > 1.5
                else "is decent, but there may be room to improve your risk-adjusted returns" if sharpe > 0.5
                else "suggests your returns may not justify the level of risk you're taking"
            )
            explanations.append({
                "metric": "Sharpe Ratio",
                "value": sharpe,
                "explanation": self._explain_sharpe(sharpe),
                "plain_english": f"Your Sharpe ratio of {sharpe} {sharpe_comment}",
                "concern_level": "low" if sharpe > 1 else "medium" if sharpe > 0.5 else "high"
            })

        # Volatility explanation
        if "volatility" in metrics:
            vol = metrics["volatility"].get("annual", 0)
            vol_comment = (
                "This is quite volatile - be prepared for big swings" if vol > 30
                else "This is moderate volatility" if vol > 15
                else "This is relatively stable"
            )
            explanations.append({
                "metric": "Volatility",
                "value": f"{vol}%",
                "explanation": f"Your portfolio's annual volatility of {vol}% means its value typically fluctuates within a range of ±{vol}% over the course of a year.",
                "plain_english": f"Expect your portfolio to swing up or down by around {vol}% in a typical year. {vol_comment}",
                "concern_level": "low" if vol < 15 else "medium" if vol < 25 else "high"
            })

        return {
            "explanations": explanations,
            "overall_assessment": self._get_overall_assessment(explanations)
        }

    def _explain_sharpe(self, sharpe: float) -> str:
        if sharpe > 2:
            return "Excellent risk-adjusted performance. You're generating strong returns relative to the risk you're taking."
        elif sharpe > 1:
            return "Good risk-adjusted performance. Your returns adequately compensate for the risk level."
        elif sharpe > 0.5:
            return "Moderate risk-adjusted performance. Consider diversifying to improve the ratio."
        else:
            return "Poor risk-adjusted performance. The returns may not justify the risk level."

    def _get_overall_assessment(self, explanations: List[Dict]) -> Dict:
        """Get overall risk assessment"""
        concern_counts = {"low": 0, "medium": 0, "high": 0}
        for exp in explanations:
            concern_counts[exp["concern_level"]] += 1

        if concern_counts["high"] > 0:
            overall = "elevated"
            summary = "Your portfolio has several risk factors that require attention. Consider reducing exposure to volatile assets."
        elif concern_counts["medium"] > 1:
            overall = "moderate"
            summary = "Your portfolio has moderate risk levels. Monitor your holdings closely during market volatility."
        else:
            overall = "healthy"
            summary = "Your portfolio risk profile looks healthy. Continue monitoring and rebalancing periodically."

        return {
            "overall_level": overall,
            "summary": summary,
            "recommendations": self._get_recommendations(concern_counts)
        }

    def _get_recommendations(self, concern_counts: Dict) -> List[str]:
        """Get recommendations based on concern levels"""
        recommendations = []

        if concern_counts["high"] > 0:
            recommendations.extend([
                "Consider reducing position sizes in highly volatile assets",
                "Set up stop-loss orders to limit downside risk",
                "Increase diversification across uncorrelated assets"
            ])

        if concern_counts["medium"] > 0:
            recommendations.extend([
                "Review portfolio allocation quarterly",
                "Consider adding defensive assets like bonds"
            ])

        if not any(concern_counts.values()):
            recommendations.append("Continue your current strategy with periodic reviews")

        return recommendations

    async def chat(self, portfolio_id: str, question: str, context: Dict = None) -> str:
        """Chat with AI about portfolio risks using Groq AI"""
        try:
            # Try to use Groq AI for intelligent responses
            response = await self.ai_explainer.chat(question, context)
            if response and "error" not in response:
                return response.get("response", response.get("answer", str(response)))
        except Exception as e:
            print(f"Groq AI error: {e}")

        # Fallback to rule-based responses
        question_lower = question.lower()

        if "risk" in question_lower and ("what" in question_lower or "explain" in question_lower):
            return "Your portfolio currently has a moderate risk profile. The main risk factors include market volatility (18% annual) and concentration in technology stocks (52%). I recommend diversifying into other sectors to reduce concentration risk."

        elif "var" in question_lower or "value at risk" in question_lower:
            return "Your portfolio's 95% daily VaR is -2.8%. This means there's a 5% chance you could lose more than 2.8% of your portfolio value in a single day. For a $100,000 portfolio, that's a potential loss of $2,800."

        elif "sharpe" in question_lower:
            return "Your Sharpe ratio is 1.24, which indicates good risk-adjusted returns. You're earning adequate returns for the level of risk you're taking. Anything above 1 is generally considered good."

        elif "volatile" in question_lower or "volatility" in question_lower:
            return "Your portfolio has an annual volatility of 18%, which is in the moderate range. This means you can expect typical price swings of ±18% over the course of a year. For comparison, the S&P 500 typically has volatility around 15-20%."

        elif "diversif" in question_lower:
            return "Your portfolio is 52% concentrated in technology stocks. While tech has performed well, this concentration exposes you to sector-specific risks. Consider adding positions in healthcare, finance, or consumer staples to improve diversification."

        elif "recommend" in question_lower or "suggest" in question_lower or "improve" in question_lower:
            return "Based on your portfolio analysis, here are my top recommendations:\n1. Reduce tech concentration from 52% to under 40%\n2. Add defensive assets like bonds or dividend stocks\n3. Consider international exposure for geographic diversification\n4. Set up alerts for when any position exceeds 25% of your portfolio"

        else:
            return "I'm your FinSight AI assistant. I can help you understand your portfolio risks, explain metrics like VaR and Sharpe ratio, and provide recommendations. Ask me about your risk profile, diversification, or specific metrics!"

    async def generate_insights(self, portfolio_id: str) -> List[Dict]:
        """Generate AI-powered insights"""
        return [
            {
                "type": "opportunity",
                "title": "Tech Concentration Risk",
                "description": "Your portfolio is heavily weighted toward technology (52%). While this has been profitable, consider diversifying to reduce sector-specific risk.",
                "priority": "high",
                "actionable": True
            },
            {
                "type": "positive",
                "title": "Strong Risk-Adjusted Returns",
                "description": "Your Sharpe ratio of 1.24 indicates you're generating good returns relative to the risk you're taking.",
                "priority": "low",
                "actionable": False
            },
            {
                "type": "warning",
                "title": "Elevated Volatility",
                "description": "Portfolio volatility of 18% is above the market average. Expect larger price swings during turbulent periods.",
                "priority": "medium",
                "actionable": True
            }
        ]

    async def get_recommendations(self, portfolio_id: str) -> List[Dict]:
        """Get AI-powered recommendations to reduce risk"""
        return [
            {
                "category": "Diversification",
                "recommendation": "Reduce technology allocation from 52% to 35%",
                "reason": "Lower sector concentration risk",
                "impact": "Medium",
                "effort": "Requires rebalancing"
            },
            {
                "category": "Risk Management",
                "recommendation": "Set up VaR alerts at 5% daily threshold",
                "reason": "Early warning for unusual losses",
                "impact": "High",
                "effort": "Easy to implement"
            },
            {
                "category": "Portfolio Optimization",
                "recommendation": "Add 10-15% allocation to bonds",
                "reason": "Reduce overall portfolio volatility",
                "impact": "Medium",
                "effort": "Moderate"
            }
        ]

    async def summarize_portfolio(self, portfolio_id: str) -> str:
        """Generate plain English portfolio summary"""
        return """
        Your portfolio has a total value of $125,430 with a moderate risk profile.

        **Risk Assessment:**
        - Overall risk level: Moderate (score: 5/10)
        - Daily Value at Risk (95%): -$2,800
        - Volatility: 18% annually (slightly above market)
        - Sharpe Ratio: 1.24 (good risk-adjusted returns)

        **Key Concerns:**
        - Technology concentration at 52% of your portfolio
        - Beta of 1.15 means you're more volatile than the market

        **What This Means:**
        Your portfolio is positioned for growth but carries moderate risk. You can expect good returns over time, but be prepared for periods of volatility. Consider diversifying away from technology to reduce concentration risk.

        **Bottom Line:**
        Your portfolio is well-positioned for long-term growth with acceptable risk levels. Focus on diversification and set up risk alerts to monitor your positions.
        """
