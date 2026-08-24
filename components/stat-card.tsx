import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
  color?: 'primary' | 'accent' | 'secondary' | 'navy' | 'gold' | 'blue' | 'green';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const toneMap = {
  primary: 'navy',
  navy: 'navy',
  accent: 'gold',
  gold: 'gold',
  secondary: 'blue',
  blue: 'blue',
  green: 'green',
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  color = 'navy',
  trend,
}: StatCardProps) {
  const tone = toneMap[color] || 'navy';

  return (
    <div className="admin-stat-card">
      <div className={cn('admin-stat-icon', tone)}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-bold text-primary">{value}</div>
          {trend ? (
            <span className={cn('text-xs font-semibold', trend.isPositive ? 'text-green' : 'text-destructive')}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          ) : null}
        </div>
        {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
      </div>
    </div>
  );
}
