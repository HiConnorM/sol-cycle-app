'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Sparkles, AlertCircle } from 'lucide-react'
import type { CyclePrediction, ConfidenceTier } from '@/lib/types'

interface PredictionExplainerProps {
  prediction: CyclePrediction
  className?: string
}

const TIER_COPY: Record<
  ConfidenceTier,
  { label: string; color: string; bgColor: string; description: string }
> = {
  learning: {
    label: 'Still learning',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Log 3+ complete cycles for personalized predictions.',
  },
  low: {
    label: 'Low confidence',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Your cycles vary — the window reflects that honestly.',
  },
  medium: {
    label: 'Getting there',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Predictions are personalizing to your history.',
  },
  high: {
    label: 'Reliable',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Consistent patterns found across your logged cycles.',
  },
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function PredictionExplainer({ prediction, className = '' }: PredictionExplainerProps) {
  const [open, setOpen] = useState(false)
  const tier = TIER_COPY[prediction.confidenceTier]

  const { earliest, latest } = prediction.nextPeriodRange
  const hasRange = earliest && latest
  const isSameDay =
    hasRange &&
    earliest.toDateString() === latest.toDateString()

  return (
    <div className={`rounded-xl border ${tier.bgColor} ${className}`}>
      {/* Summary row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {prediction.confidenceTier === 'high' ? (
            <Sparkles className={`w-4 h-4 ${tier.color}`} />
          ) : prediction.confidenceTier === 'learning' ? (
            <Info className={`w-4 h-4 ${tier.color}`} />
          ) : (
            <AlertCircle className={`w-4 h-4 ${tier.color}`} />
          )}
          <div>
            <span className={`text-xs font-semibold ${tier.color}`}>{tier.label}</span>
            {hasRange && !isSameDay && (
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDateShort(earliest)} – {formatDateShort(latest)}
              </span>
            )}
            {hasRange && isSameDay && (
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDateShort(earliest)}
              </span>
            )}
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-inherit/30 pt-2">
          <p className={`text-xs ${tier.color}`}>{tier.description}</p>

          {prediction.reason.map((r, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed">
              {r}
            </p>
          ))}

          {prediction.cycleHistoryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Based on {prediction.cycleHistoryCount} completed cycle
              {prediction.cycleHistoryCount === 1 ? '' : 's'}.
              {prediction.cycleLengthStdDev > 0
                ? ` Variability: ±${prediction.cycleLengthStdDev}d.`
                : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
