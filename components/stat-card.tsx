import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'primary' | 'accent' | 'secondary'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  trend,
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-primary/30 hover:shadow-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
