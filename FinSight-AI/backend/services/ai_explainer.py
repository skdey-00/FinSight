"""
AI Explainer - Uses Groq API for AI-powered risk explanations

Replaces Anthropic Claude with Groq for faster, free AI responses.
"""
import os
import httpx
from typing import Dict, Optional
from datetime import datetime

GROQ_API_URL = "https://api.groq.com/openai/v1"


class AIExplainer:
    def __init__(self):
        """Initialize the AI Explainer with Groq API key."""
        self.api_key = os.getenv("GROQ_API_KEY")
        self.api_url = f"{GROQ_API_URL}/chat/completions"
        self.model = "llama-3.3-70b-versatile"  # Fast, free model on Groq
        self.client = httpx.AsyncClient(timeout=60.0)

    async def explain_portfolio_risk(
        self,
        risk_metrics: Dict,
        portfolio_info: Optional[Dict] = None
    ) -> Dict:
        """
        Explain portfolio risk metrics in plain English using Groq AI.

        Args:
            risk_metrics: Dict of risk metrics from the risk engine
            portfolio_info: Optional dict with portfolio details (tickers, weights, value)

        Returns:
            Dict with the explanation, key risk factor, and recommendations
        """
        if not self.api_key:
            return {
                "error": "GROQ_API_KEY environment variable not set",
                "explanation": "AI explanation feature requires a Groq API key.",
                "biggest_risk_factor": "Unknown",
                "recommendations": ["Set GROQ_API_KEY to enable AI explanations"]
            }

        try:
            # Build the prompt for Groq
            prompt = self._build_explanation_prompt(risk_metrics, portfolio_info)

            # Call Groq API (OpenAI-compatible)
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert financial risk analyst explaining portfolio risk to non-expert investors. Be clear, honest, and actionable. Use simple language. Avoid financial jargon when possible."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1500
            }

            response = await self.client.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            if response.status_code != 200:
                return {
                    "error": f"Groq API error: {response.status_code}",
                    "details": response.text
                }

            result = response.json()
            explanation_text = result["choices"][0]["message"]["content"]

            # Parse the structured response
            parsed = self._parse_groq_response(explanation_text)

            return {
                "explained_at": datetime.now().isoformat(),
                "model_used": f"{self.model} (Groq)",
                "explanation": parsed.get("explanation", explanation_text),
                "biggest_risk_factor": parsed.get("biggest_risk_factor", "Unable to determine"),
                "recommendations": parsed.get("recommendations", []),
                "full_response": explanation_text
            }

        except httpx.TimeoutException:
            return {
                "error": "Request to Groq API timed out",
                "explanation": "The AI explanation service is currently unavailable."
            }
        except Exception as e:
            return {
                "error": f"Error calling Groq API: {str(e)}",
                "explanation": "Could not generate AI explanation at this time."
            }

    def _build_explanation_prompt(self, risk_metrics: Dict, portfolio_info: Optional[Dict]) -> str:
        """Build the prompt for Groq with the risk metrics."""
        # Format the risk metrics for the prompt
        metrics_text = self._format_metrics_for_prompt(risk_metrics)

        portfolio_text = ""
        if portfolio_info:
            portfolio_text = f"""
Portfolio Information:
- Holdings: {', '.join(portfolio_info.get('tickers', ['Unknown']))}
- Weights: {portfolio_info.get('weights', {})}
- Total Value: ${portfolio_info.get('value', 'Unknown')}
"""

        prompt = f"""You are an expert financial risk analyst explaining a portfolio's risk profile to a non-expert investor. Your goal is to be clear, honest, and actionable.

Here is the portfolio's risk metrics data:

{metrics_text}
{portfolio_text}

Please provide a response in exactly this format:

## RISK PROFILE EXPLANATION
[Write 3 short paragraphs explaining the portfolio's overall risk profile in plain English that anyone can understand. Avoid jargon. If using technical terms, explain them simply.]

## BIGGEST RISK FACTOR
[Identify and explain the single biggest risk factor this portfolio faces. Be specific and clear about why this matters.]

## RECOMMENDATIONS
1. [First specific, actionable recommendation to reduce risk]
2. [Second specific, actionable recommendation to reduce risk]

Keep explanations concise but informative. Focus on what the investor should actually understand and care about."""

        return prompt

    def _format_metrics_for_prompt(self, metrics: Dict) -> str:
        """Format risk metrics into readable text for the prompt."""
        lines = ["Risk Metrics:"]

        # Value at Risk
        if "value_at_risk" in metrics:
            var = metrics["value_at_risk"]
            if "95%" in var:
                lines.append(f"- Daily VaR (95% confidence): {var['95%'].get('daily_percent', 0)}%")
                lines.append(f"- Annual VaR (95% confidence): {var['95%'].get('annual_percent', 0)}%")

        # Sharpe Ratio
        if "sharpe_ratio" in metrics:
            sr = metrics["sharpe_ratio"]
            lines.append(f"- Sharpe Ratio: {sr.get('sharpe_ratio', 0)} (higher is good, above 1 is good)")
            lines.append(f"- Annual Return: {sr.get('annual_return_percent', 0)}%")
            lines.append(f"- Annual Volatility: {sr.get('annual_volatility_percent', 0)}%")

        # Beta
        if "beta" in metrics and "beta" not in str(metrics["beta"]):
            beta = metrics["beta"]
            lines.append(f"- Beta: {beta.get('beta', 0)} (vs market)")
            lines.append(f"- Alpha: {beta.get('alpha_annual_percent', 0)}%")

        # Max Drawdown
        if "max_drawdown" in metrics:
            dd = metrics["max_drawdown"]
            lines.append(f"- Maximum Drawdown: {dd.get('max_drawdown_percent', 0)}%")

        # Portfolio Statistics
        if "portfolio_statistics" in metrics:
            stats = metrics["portfolio_statistics"]
            lines.append(f"- Total Return: {stats.get('total_return_percent', 0)}%")
            lines.append(f"- Win Rate: {stats.get('win_rate_percent', 0)}% of positive days")

        # Correlation info
        if "correlation_matrix" in metrics:
            corr = metrics["correlation_matrix"]
            tickers = corr.get("tickers", [])
            if tickers:
                lines.append(f"- Holdings analyzed: {', '.join(tickers)}")

        return "\n".join(lines)

    def _parse_groq_response(self, response_text: str) -> Dict:
        """Parse Groq's structured response into components."""
        parsed = {
            "explanation": "",
            "biggest_risk_factor": "",
            "recommendations": []
        }

        lines = response_text.split('\n')
        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('## RISK PROFILE EXPLANATION'):
                current_section = 'explanation'
                continue
            elif line.startswith('## BIGGEST RISK FACTOR'):
                current_section = 'risk_factor'
                continue
            elif line.startswith('## RECOMMENDATIONS'):
                current_section = 'recommendations'
                continue

            if current_section == 'explanation' and line and not line.startswith('#'):
                parsed["explanation"] += line + " "
            elif current_section == 'risk_factor' and line and not line.startswith('#'):
                parsed["biggest_risk_factor"] += line + " "
            elif current_section == 'recommendations' and line:
                # Extract recommendations (numbered or bulleted)
                clean_line = line.lstrip('0123456789.-)* ')
                if clean_line:
                    parsed["recommendations"].append(clean_line)

        # Clean up the accumulated strings
        parsed["explanation"] = parsed["explanation"].strip()
        parsed["biggest_risk_factor"] = parsed["biggest_risk_factor"].strip()

        return parsed

    async def explain_anomaly(
        self,
        anomaly: Dict,
        context: Optional[Dict] = None
    ) -> Dict:
        """Explain a detected anomaly in plain English."""
        if not self.api_key:
            return {"error": "GROQ_API_KEY not set"}

        prompt = f"""Explain this financial market anomaly in plain English to an investor:

Anomaly Details:
- Symbol: {anomaly.get('symbol', 'Unknown')}
- Type: {anomaly.get('type', 'Unknown')}
- Severity: {anomaly.get('severity', 'Unknown')}
- Description: {anomaly.get('description', 'No description')}
- Value: {anomaly.get('value', 'N/A')}
- Threshold: {anomaly.get('threshold', 'N/A')}

Provide:
1. A simple explanation of what this means
2. Why it matters for the portfolio
3. One suggested action

Keep it to 3-4 sentences total."""

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a financial risk assistant. Explain market anomalies clearly and concisely."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.5,
                "max_tokens": 500
            }

            response = await self.client.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                explanation = result["choices"][0]["message"]["content"]
                return {"explanation": explanation}
            else:
                return {"error": f"Groq API error: {response.status_code}"}

        except Exception as e:
            return {"error": f"Error: {str(e)}"}

    async def chat(
        self,
        message: str,
        context: Optional[Dict] = None
    ) -> Dict:
        """
        Chat with AI about portfolio questions.
        """
        if not self.api_key:
            return {"error": "GROQ_API_KEY not set"}

        context_text = ""
        if context:
            context_text = f"\n\nPortfolio Context:\n{str(context)}"

        prompt = f"""You are FinSight AI, a helpful financial risk assistant. Answer the user's question about their portfolio clearly and concisely.

User question: {message}{context_text}

Provide a helpful, accurate response. If you're unsure about something, say so. Keep responses under 150 words."""

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are FinSight AI, a financial risk assistant. You help users understand their portfolio risks."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 500
            }

            response = await self.client.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]
                return {"response": ai_response}
            else:
                return {"error": f"Groq API error: {response.status_code}"}

        except Exception as e:
            return {"error": f"Error: {str(e)}"}


# Singleton instance
ai_explainer = AIExplainer()
