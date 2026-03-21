'use client'

import { useMemo, useState, useEffect } from 'react'
import type { CalendarSystem, CyclePhase, MoonPhaseData } from '@/lib/types'
import { gregorianToIFC, IFC_MONTHS } from '@/lib/calendar/international-fixed-calendar'
import { getMoonPhase } from '@/lib/calendar/moon-phases'
import { getCyclePhase, getPhaseInfo } from '@/lib/calendar/cycle-calculations'

// Default moon data for SSR
const DEFAULT_MOON_DATA: MoonPhaseData = {
  phase: 'waxing-crescent',
  illumination: 25,
  name: 'Waxing Crescent',
}

// Wheel segment colors - soft pastel spectrum
const WHEEL_COLORS = {
  gregorian: [
    '#C9D6E3', // January - Pale Blue (winter)
    '#C7C3D9', // February - Lavender Gray
    '#BFA8C9', // March - Soft Plum
    '#BFD8C2', // April - Sage Green (spring)
    '#AFC3A4', // May - Soft Olive
    '#EAD9A0', // June - Muted Gold (summer)
    '#E8D2B0', // July - Warm Sand
    '#E6B8A2', // August - Soft Peach
    '#D8A7A7', // September - Dusty Rose (autumn)
    '#E4BFC3', // October - Blush Pink
    '#B7D3CF', // November - Misty Teal
    '#C9D6E3', // December - Pale Blue (winter)
  ],
  ifc: [
    '#C9D6E3', // January
    '#C7C3D9', // February
    '#BFA8C9', // March
    '#BFD8C2', // April
    '#AFC3A4', // May
    '#EAD9A0', // June
    '#E8D2B0', // Sol (new month)
    '#E6B8A2', // July
    '#D8A7A7', // August
    '#E4BFC3', // September
    '#B7D3CF', // October
    '#C9D6E3', // November
    '#C7C3D9', // December
  ],
}

interface RadialWheelProps {
  date: Date
  calendarSystem: CalendarSystem
  cycleDay?: number | null
  cycleLength?: number
  periodLength?: number
  onDateSelect?: (date: Date) => void
  onToggleCalendar?: () => void
}

export function RadialWheel({
  date,
  calendarSystem,
  cycleDay = null,
  cycleLength = 28,
  periodLength = 5,
  onDateSelect,
  onToggleCalendar,
}: RadialWheelProps) {
  const [mounted, setMounted] = useState(false)
  const [moonPhase, setMoonPhase] = useState<MoonPhaseData>(DEFAULT_MOON_DATA)
  
  // Only calculate moon phase on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setMoonPhase(getMoonPhase(date))
  }, [date])
  
  const ifcDate = useMemo(() => gregorianToIFC(date), [date])
  
  const monthCount = calendarSystem === 'gregorian' ? 12 : 13
  const monthNames = calendarSystem === 'gregorian' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Sol', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const currentMonth = calendarSystem === 'gregorian' 
    ? date.getMonth() 
    : ifcDate.month - 1
  
  const currentDay = calendarSystem === 'gregorian'
    ? date.getDate()
    : ifcDate.day
  
  const currentYear = date.getFullYear()
  
  const displayMonth = calendarSystem === 'gregorian'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]
    : ifcDate.monthName
  
  // Calculate cycle phase
  const currentPhase: CyclePhase | null = cycleDay 
    ? getCyclePhase(cycleDay, cycleLength, periodLength)
    : null
  
  const phaseInfo = currentPhase ? getPhaseInfo(currentPhase) : null
  
  // SVG dimensions and calculations
  const size = 340
  const center = size / 2
  const outerRadius = 155
  const innerRadius = 95
  const centerRadius = 75
  
  // Generate wheel segments
  const segments = useMemo(() => {
    const anglePerSegment = 360 / monthCount
    const colors = calendarSystem === 'gregorian' ? WHEEL_COLORS.gregorian : WHEEL_COLORS.ifc
    
    return Array.from({ length: monthCount }, (_, i) => {
      const startAngle = (i * anglePerSegment - 90) * (Math.PI / 180)
      const endAngle = ((i + 1) * anglePerSegment - 90) * (Math.PI / 180)
      
      const x1 = center + outerRadius * Math.cos(startAngle)
      const y1 = center + outerRadius * Math.sin(startAngle)
      const x2 = center + outerRadius * Math.cos(endAngle)
      const y2 = center + outerRadius * Math.sin(endAngle)
      const x3 = center + innerRadius * Math.cos(endAngle)
      const y3 = center + innerRadius * Math.sin(endAngle)
      const x4 = center + innerRadius * Math.cos(startAngle)
      const y4 = center + innerRadius * Math.sin(startAngle)
      
      const largeArc = anglePerSegment > 180 ? 1 : 0
      
      const path = `
        M ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `
      
      // Label position
      const midAngle = ((i + 0.5) * anglePerSegment - 90) * (Math.PI / 180)
      const labelRadius = (outerRadius + innerRadius) / 2
      const labelX = center + labelRadius * Math.cos(midAngle)
      const labelY = center + labelRadius * Math.sin(midAngle)
      
      // Month number position (outside wheel)
      const numberRadius = outerRadius + 12
      const numberX = center + numberRadius * Math.cos(midAngle)
      const numberY = center + numberRadius * Math.sin(midAngle)
      
      return {
        path,
        color: colors[i],
        label: monthNames[i],
        labelX,
        labelY,
        numberX,
        numberY,
        number: i + 1,
        isCurrentMonth: i === currentMonth,
        angle: midAngle,
      }
    })
  }, [monthCount, calendarSystem, currentMonth, monthNames])
  
  // Generate cycle day markers (tick marks around inner circle)
  const cycleMarkers = useMemo(() => {
    if (!cycleDay) return []
    
    const markers = []
    const markerRadius = innerRadius - 8
    const anglePerDay = 360 / cycleLength
    
    for (let day = 1; day <= cycleLength; day++) {
      const angle = ((day - 1) * anglePerDay - 90) * (Math.PI / 180)
      const x1 = center + (markerRadius - 6) * Math.cos(angle)
      const y1 = center + (markerRadius - 6) * Math.sin(angle)
      const x2 = center + markerRadius * Math.cos(angle)
      const y2 = center + markerRadius * Math.sin(angle)
      
      const phase = getCyclePhase(day, cycleLength, periodLength)
      const info = getPhaseInfo(phase)
      
      markers.push({
        x1,
        y1,
        x2,
        y2,
        day,
        isCurrentDay: day === cycleDay,
        color: info.color,
        phase,
      })
    }
    
    return markers
  }, [cycleDay, cycleLength, periodLength])
  
  // Current day indicator position
  const currentDayIndicator = useMemo(() => {
    if (!cycleDay) return null
    
    const anglePerDay = 360 / cycleLength
    const angle = ((cycleDay - 1) * anglePerDay - 90) * (Math.PI / 180)
    const indicatorRadius = innerRadius - 15
    
    return {
      x: center + indicatorRadius * Math.cos(angle),
      y: center + indicatorRadius * Math.sin(angle),
      angle: (cycleDay - 1) * anglePerDay,
    }
  }, [cycleDay, cycleLength])
  
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[340px] h-auto"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))' }}
      >
        {/* Outer wheel segments */}
        <g>
          {segments.map((segment, i) => (
            <g key={i}>
              <path
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="1.5"
                opacity={segment.isCurrentMonth ? 1 : 0.7}
                className="transition-opacity duration-200"
              />
              {/* Month abbreviation inside segment */}
              <text
                x={segment.labelX}
                y={segment.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#2B2B2B"
                fontSize="10"
                fontWeight={segment.isCurrentMonth ? '600' : '400'}
                className="select-none pointer-events-none"
                style={{ 
                  transform: `rotate(${segment.angle * (180 / Math.PI) + 90}deg)`,
                  transformOrigin: `${segment.labelX}px ${segment.labelY}px`,
                }}
              >
                {segment.label}
              </text>
            </g>
          ))}
        </g>
        
        {/* Month numbers around the wheel */}
        {segments.map((segment, i) => (
          <text
            key={`num-${i}`}
            x={segment.numberX}
            y={segment.numberY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={segment.isCurrentMonth ? '#2B2B2B' : '#A0A0A0'}
            fontSize="9"
            fontWeight={segment.isCurrentMonth ? '600' : '400'}
            className="select-none"
          >
            {segment.number}
          </text>
        ))}
        
        {/* Inner cycle phase ring */}
        {cycleDay && (
          <g>
            {/* Phase background arc */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius - 3}
              fill="none"
              stroke={phaseInfo?.colorLight || 'transparent'}
              strokeWidth="12"
            />
            
            {/* Cycle day tick marks */}
            {cycleMarkers.map((marker, i) => (
              <line
                key={i}
                x1={marker.x1}
                y1={marker.y1}
                x2={marker.x2}
                y2={marker.y2}
                stroke={marker.isCurrentDay ? '#2B2B2B' : marker.color}
                strokeWidth={marker.isCurrentDay ? 3 : 1.5}
                strokeLinecap="round"
              />
            ))}
            
            {/* Current cycle day indicator */}
            {currentDayIndicator && (
              <circle
                cx={currentDayIndicator.x}
                cy={currentDayIndicator.y}
                r={4}
                fill={phaseInfo?.color || '#C6B89E'}
                stroke="#2B2B2B"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}
        
        {/* Center circle - moon/date display */}
        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          fill="white"
          stroke="#E8E4DF"
          strokeWidth="2"
        />
        
        {/* Moon phase visualization in center */}
        <g transform={`translate(${center}, ${center - 18})`}>
          <circle
            r="14"
            fill="#E8E4DF"
            stroke="#D9D5D0"
            strokeWidth="0.5"
          />
          {/* Moon illumination */}
          <clipPath id="moonClip">
            <circle r="14" />
          </clipPath>
          <rect
            x={moonPhase.phase.includes('waning') ? -14 + (moonPhase.illumination / 100) * 28 : -14}
            y="-14"
            width={28 * (moonPhase.illumination / 100)}
            height="28"
            fill="#FFFEF8"
            clipPath="url(#moonClip)"
            style={{
              transform: moonPhase.phase.includes('waning') ? 'scaleX(-1)' : 'none',
              transformOrigin: 'center',
            }}
          />
        </g>
        
        {/* Date display in center */}
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#2B2B2B"
          fontSize="11"
          fontWeight="500"
          className="select-none"
        >
          {displayMonth}
        </text>
        <text
          x={center}
          y={center + 24}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#6B6B6B"
          fontSize="18"
          fontWeight="600"
          className="select-none"
        >
          {currentDay}
        </text>
        <text
          x={center}
          y={center + 42}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#A0A0A0"
          fontSize="10"
          className="select-none"
        >
          {currentYear}
        </text>
      </svg>
      
      {/* Calendar system toggle button */}
      <button
        onClick={onToggleCalendar}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 px-3 py-1.5 text-xs font-medium rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
        aria-label={`Switch to ${calendarSystem === 'gregorian' ? '13-month' : 'Gregorian'} calendar`}
      >
        {calendarSystem === 'gregorian' ? '12 months' : '13 months'}
      </button>
      
      {/* Phase indicator */}
      {phaseInfo && (
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full shadow-sm"
          style={{ 
            backgroundColor: phaseInfo.colorLight,
            borderColor: phaseInfo.color,
            borderWidth: 1,
            color: '#2B2B2B',
          }}
        >
          Day {cycleDay} - {phaseInfo.name}
        </div>
      )}
    </div>
  )
}
