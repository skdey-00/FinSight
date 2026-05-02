import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

const riskConfig = {
  low: {
    label: 'Low Risk',
    className: 'risk-low',
    icon: ShieldCheck
  },
  moderate: {
    label: 'Moderate',
    className: 'risk-low',
    icon: Shield
  },
  medium: {
    label: 'Medium Risk',
    className: 'risk-medium',
    icon: Shield
  },
  high: {
    label: 'High Risk',
    className: 'risk-high',
    icon: ShieldAlert
  },
  'very high': {
    label: 'Very High',
    className: 'risk-high',
    icon: AlertTriangle
  }
}

export default function RiskBadge({ level, size = 'md' }) {
  const config = riskConfig[level.toLowerCase()] || riskConfig.low
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2'
  }

  return (
    <span className={`risk-badge ${config.className} ${sizeClasses[size]}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
