import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border/50 bg-card p-6 transition-all hover:border-camel/30 hover:shadow-lg hover:shadow-camel/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-camel' : 'text-rubine'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-camel/10 text-camel transition-colors group-hover:bg-camel/20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Subtle decorative element */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-camel/5 transition-transform group-hover:scale-110" />
    </div>
  )
}
