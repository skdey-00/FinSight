import ScenarioSimulator from '../components/ScenarioSimulator'

export default function ScenarioSimulatorPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Scenario Simulator</h1>
        <p className="mt-2 text-slate-400">
          Run "what-if" scenarios to understand potential portfolio impacts
        </p>
      </div>

      <div className="card">
        <ScenarioSimulator
          portfolioValue={100000}
          weights={{ AAPL: 40, TSLA: 30, GOOGL: 30 }}
        />
      </div>
    </div>
  )
}
