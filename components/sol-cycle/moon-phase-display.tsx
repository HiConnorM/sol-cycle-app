'use client'

import { useMemo } from 'react'
import { getMoonPhase } from '@/lib/calendar/moon-phases'
import type { MoonPhase } from '@/lib/types'

interface MoonPhaseDisplayProps {
  date?: Date
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const SIZES = {
  sm: 24,
  md: 40,
  lg: 64,
}

export function MoonPhaseDisplay({ 
  date = new Date(), 
  size = 'md',
  showLabel = true,
  className 
}: MoonPhaseDisplayProps) {
  const moonData = useMemo(() => getMoonPhase(date), [date])
  const pixelSize = SIZES[size]
  
  // Calculate the clip path for moon illumination
  const getIlluminationPath = (phase: MoonPhase, illumination: number): string => {
    const r = pixelSize / 2 - 2
    const center = pixelSize / 2
    
    // Normalize illumination to 0-1
    const illum = illumination / 100
    
    // Calculate the curve for the terminator line
    // This creates the crescent/gibbous effect
    const curveOffset = r * (1 - Math.abs(illum * 2 - 1))
    
    if (phase === 'new') {
      return '' // All dark
    }
    
    if (phase === 'full') {
      return `M ${center} ${center - r} A ${r} ${r} 0 1 1 ${center} ${center + r} A ${r} ${r} 0 1 1 ${center} ${center - r}`
    }
    
    // Waxing phases - right side illuminated
    if (phase.includes('waxing')) {
      if (illumination <= 50) {
        // Crescent - illuminated area is less than half
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 1 ${center} ${center + r}
          Q ${center - curveOffset} ${center} ${center} ${center - r}
        `
      } else {
        // Gibbous - illuminated area is more than half
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 1 ${center} ${center + r}
          Q ${center + curveOffset} ${center} ${center} ${center - r}
        `
      }
    }
    
    // Waning phases - left side illuminated
    if (phase.includes('waning')) {
      if (illumination <= 50) {
        // Crescent
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 0 ${center} ${center + r}
          Q ${center + curveOffset} ${center} ${center} ${center - r}
        `
      } else {
        // Gibbous
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 0 ${center} ${center + r}
          Q ${center - curveOffset} ${center} ${center} ${center - r}
        `
      }
    }
    
    // Quarter phases
    if (phase === 'first-quarter') {
      return `
        M ${center} ${center - r}
        A ${r} ${r} 0 0 1 ${center} ${center + r}
        L ${center} ${center - r}
      `
    }
    
    if (phase === 'last-quarter') {
      return `
        M ${center} ${center - r}
        A ${r} ${r} 0 0 0 ${center} ${center + r}
        L ${center} ${center - r}
      `
    }
    
    return ''
  }
  
  return (
    <div className={`flex flex-col items-center gap-1 ${className || ''}`}>
      <svg 
        width={pixelSize} 
        height={pixelSize} 
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        className="drop-shadow-sm"
      >
        {/* Moon background (dark side) */}
        <circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={pixelSize / 2 - 2}
          fill="#D9D5D0"
          stroke="#C5C1BC"
          strokeWidth="1"
        />
        
        {/* Illuminated portion */}
        {moonData.phase !== 'new' && (
          <path
            d={getIlluminationPath(moonData.phase, moonData.illumination)}
            fill="#FFFEF5"
            stroke="none"
          />
        )}
        
        {/* Subtle crater texture */}
        <circle
          cx={pixelSize / 2 - pixelSize / 6}
          cy={pixelSize / 2 - pixelSize / 8}
          r={pixelSize / 12}
          fill="rgba(0,0,0,0.03)"
        />
        <circle
          cx={pixelSize / 2 + pixelSize / 5}
          cy={pixelSize / 2 + pixelSize / 6}
          r={pixelSize / 10}
          fill="rgba(0,0,0,0.02)"
        />
      </svg>
      
      {showLabel && (
        <span className="text-xs text-muted-foreground text-center">
          {moonData.name}
        </span>
      )}
    </div>
  )
}
