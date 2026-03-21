'use client'

import { cn } from '@/lib/utils'
import type { CalendarSystem } from '@/lib/types'

interface CalendarToggleProps {
  value: CalendarSystem
  onChange: (system: CalendarSystem) => void
  className?: string
}

export function CalendarToggle({ value, onChange, className }: CalendarToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-secondary rounded-full', className)}>
      <button
        onClick={() => onChange('gregorian')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
          value === 'gregorian'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={value === 'gregorian'}
      >
        12 Month
      </button>
      <button
        onClick={() => onChange('international-fixed')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
          value === 'international-fixed'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-pressed={value === 'international-fixed'}
      >
        13 Month (IFC)
      </button>
    </div>
  )
}
