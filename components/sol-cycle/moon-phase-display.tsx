'use client'

import { useState, useEffect } from 'react'
import { getMoonPhase } from '@/lib/calendar/moon-phases'
import type { MoonPhase, MoonPhaseData } from '@/lib/types'

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

// Default moon data for SSR (stable value)
const DEFAULT_MOON_DATA: MoonPhaseData = {
  phase: 'waxing-crescent',
  illumination: 25,
  name: 'Waxing Crescent',
}

export function MoonPhaseDisplay({ 
  date, 
  size = 'md',
  showLabel = true,
  className 
}: MoonPhaseDisplayProps) {
  const [moonData, setMoonData] = useState<MoonPhaseData>(DEFAULT_MOON_DATA)
  const [mounted, setMounted] = useState(false)
  
  // Only calculate moon phase on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    const targetDate = date || new Date()
    setMoonData(getMoonPhase(targetDate))
  }, [date])
  
  const pixelSize = SIZES[size]
  
  // Use stable default values for SSR to avoid hydration mismatch
  // The actual moon calculation only happens on the client
  const displayData = mounted ? moonData : DEFAULT_MOON_DATA
  
  // Pre-calculate static path for default moon data (25% illumination, waxing-crescent)
  const getStaticDefaultPath = (): string => {
    const r = pixelSize / 2 - 2
    const c = pixelSize / 2
    const curveOffset = r * 0.5 // 25% illumination = 0.5 curve offset
    return `M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} Q ${c - curveOffset} ${c} ${c} ${c - r}`
  }
  
  // Calculate the clip path for moon illumination (only used client-side)
  const getIlluminationPath = (phase: MoonPhase, illumination: number): string => {
    const r = pixelSize / 2 - 2
    const center = pixelSize / 2
    
    // Normalize illumination to 0-1
    const illum = illumination / 100
    
    // Calculate the curve for the terminator line
    const curveOffset = r * (1 - Math.abs(illum * 2 - 1))
    
    if (phase === 'new') {
      return ''
    }
    
    if (phase === 'full') {
      return `M ${center} ${center - r} A ${r} ${r} 0 1 1 ${center} ${center + r} A ${r} ${r} 0 1 1 ${center} ${center - r}`
    }
    
    if (phase.includes('waxing')) {
      if (illumination <= 50) {
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 1 ${center} ${center + r}
          Q ${center - curveOffset} ${center} ${center} ${center - r}
        `
      } else {
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 1 ${center} ${center + r}
          Q ${center + curveOffset} ${center} ${center} ${center - r}
        `
      }
    }
    
    if (phase.includes('waning')) {
      if (illumination <= 50) {
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 0 ${center} ${center + r}
          Q ${center + curveOffset} ${center} ${center} ${center - r}
        `
      } else {
        return `
          M ${center} ${center - r}
          A ${r} ${r} 0 0 0 ${center} ${center + r}
          Q ${center - curveOffset} ${center} ${center} ${center - r}
        `
      }
    }
    
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
  
  // Use static path on server, dynamic on client
  const illuminationPath = mounted 
    ? getIlluminationPath(displayData.phase, displayData.illumination)
    : getStaticDefaultPath()
  
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
        {displayData.phase !== 'new' && illuminationPath && (
          <path
            d={illuminationPath}
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
          {displayData.name}
        </span>
      )}
    </div>
  )
}
