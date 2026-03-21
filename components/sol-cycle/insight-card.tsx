'use client'

import { cn } from '@/lib/utils'
import type { CyclePhase } from '@/lib/types'
import { getPhaseInfo } from '@/lib/calendar/cycle-calculations'

interface InsightCardProps {
  title: string
  label?: string
  children: React.ReactNode
  phase?: CyclePhase | null
  variant?: 'default' | 'highlight' | 'subtle'
  className?: string
  icon?: React.ReactNode
}

export function InsightCard({ 
  title, 
  label, 
  children, 
  phase,
  variant = 'default',
  className,
  icon,
}: InsightCardProps) {
  const phaseInfo = phase ? getPhaseInfo(phase) : null
  
  return (
    <div 
      className={cn(
        'rounded-2xl p-4 transition-all',
        variant === 'default' && 'bg-card border border-border shadow-sm',
        variant === 'highlight' && 'bg-card border-2 shadow-md',
        variant === 'subtle' && 'bg-secondary/50',
        className
      )}
      style={{
        borderColor: variant === 'highlight' && phaseInfo 
          ? phaseInfo.color 
          : undefined,
        backgroundColor: variant === 'highlight' && phaseInfo
          ? phaseInfo.colorLight
          : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground">{icon}</span>
          )}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {label && (
          <span 
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: phaseInfo?.colorLight || 'var(--secondary)',
              color: 'var(--foreground)',
            }}
          >
            {label}
          </span>
        )}
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}
