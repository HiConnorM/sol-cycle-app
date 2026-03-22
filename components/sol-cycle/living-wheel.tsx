'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarSystem, CyclePhase, CycleLog, MoonPhaseData } from '@/lib/types'
import { gregorianToIFC, IFC_MONTHS, getGregorianMonthName } from '@/lib/calendar/international-fixed-calendar'
import { getMoonPhase, getNextMoonPhase } from '@/lib/calendar/moon-phases'
import { getCyclePhase, getPhaseInfo } from '@/lib/calendar/cycle-calculations'
import { getZodiacSign, getElementColor, getCycleAstroInsight } from '@/lib/calendar/astrology'
import { getSeasonForMonth, getSeasonalColors } from '@/lib/calendar/cycle-predictions'
import { MonthGrid } from './month-grid'

// Default moon data for SSR
const DEFAULT_MOON_DATA: MoonPhaseData = {
  phase: 'waxing-crescent',
  illumination: 25,
  name: 'Waxing Crescent',
}

// Seasonal wheel colors with smooth transitions
const SEASONAL_WHEEL_COLORS = {
  gregorian: [
    '#C9D6E3', // Jan - Winter Blue
    '#C9D6E3', // Feb - Winter Blue
    '#BFD8C2', // Mar - Spring Green
    '#BFD8C2', // Apr - Spring Green
    '#AFC3A4', // May - Spring Olive
    '#EAD9A0', // Jun - Summer Gold
    '#E8D2B0', // Jul - Summer Sand
    '#E6B8A2', // Aug - Summer Peach
    '#D8A7A7', // Sep - Autumn Rose
    '#BFA8C9', // Oct - Autumn Plum
    '#C7C3D9', // Nov - Late Autumn Lavender
    '#C9D6E3', // Dec - Winter Blue
  ],
  ifc: [
    '#C9D6E3', // Jan
    '#C9D6E3', // Feb
    '#BFD8C2', // Mar
    '#BFD8C2', // Apr
    '#AFC3A4', // May
    '#EAD9A0', // Jun
    '#EAD9A0', // Sol - Summer
    '#E8D2B0', // Jul
    '#E6B8A2', // Aug
    '#D8A7A7', // Sep
    '#BFA8C9', // Oct
    '#C7C3D9', // Nov
    '#C9D6E3', // Dec
  ],
}

interface LivingWheelProps {
  date: Date
  calendarSystem: CalendarSystem
  cycleDay?: number | null
  cycleLength?: number
  periodLength?: number
  cycleLogs?: CycleLog[]
  onDateSelect?: (date: Date) => void
  onToggleCalendar?: () => void
}

export function LivingWheel({
  date,
  calendarSystem,
  cycleDay = null,
  cycleLength = 28,
  periodLength = 5,
  cycleLogs = [],
  onDateSelect,
  onToggleCalendar,
}: LivingWheelProps) {
  const [expandedView, setExpandedView] = useState<'center' | 'month' | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [expandedMonthDate, setExpandedMonthDate] = useState<Date>(date)
  const [moonPhase, setMoonPhase] = useState<MoonPhaseData>(DEFAULT_MOON_DATA)
  const [mounted, setMounted] = useState(false)
  
  // Only calculate moon phase on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setMoonPhase(getMoonPhase(date))
  }, [date])
  const ifcDate = useMemo(() => gregorianToIFC(date), [date])
  const zodiac = useMemo(() => getZodiacSign(date), [date])
  
  const monthCount = calendarSystem === 'gregorian' ? 12 : 13
  const monthNames = calendarSystem === 'gregorian' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Sol', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Use stable values for SSR (January 1st), then real values on client
  const currentMonth = mounted
    ? (calendarSystem === 'gregorian' ? date.getMonth() : ifcDate.month - 1)
    : 0 // January for SSR
  
  const currentDay = mounted
    ? (calendarSystem === 'gregorian' ? date.getDate() : ifcDate.day)
    : 1 // 1st for SSR
  
  const currentYear = mounted ? date.getFullYear() : 2025 // Stable year for SSR
  
  const displayMonth = mounted
    ? (calendarSystem === 'gregorian'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]
      : ifcDate.monthName)
    : 'January' // Stable for SSR
  
  const currentPhase: CyclePhase | null = cycleDay 
    ? getCyclePhase(cycleDay, cycleLength, periodLength)
    : null
  
  const phaseInfo = currentPhase ? getPhaseInfo(currentPhase) : null
  const astroInsight = getCycleAstroInsight(zodiac, currentPhase)
  
  // SVG dimensions
  const size = 340
  const center = size / 2
  const outerRadius = 155
  const innerRadius = 95
  const centerRadius = 75
  
  // Handle month segment click
  const handleMonthClick = useCallback((monthIndex: number) => {
    setSelectedMonth(monthIndex)
    // Create date for the selected month
    const newDate = new Date(date)
    newDate.setMonth(monthIndex)
    newDate.setDate(1)
    setExpandedMonthDate(newDate)
    setExpandedView('month')
  }, [date])
  
  // Handle center moon click
  const handleCenterClick = useCallback(() => {
    setExpandedView('center')
  }, [])
  
  // Navigate expanded month
  const navigateExpandedMonth = useCallback((direction: number) => {
    const newDate = new Date(expandedMonthDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setExpandedMonthDate(newDate)
    setSelectedMonth(newDate.getMonth())
  }, [expandedMonthDate])
  
  // Generate wheel segments with seasonal colors
  const segments = useMemo(() => {
    const anglePerSegment = 360 / monthCount
    const colors = calendarSystem === 'gregorian' 
      ? SEASONAL_WHEEL_COLORS.gregorian 
      : SEASONAL_WHEEL_COLORS.ifc
    
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
      
      const midAngle = ((i + 0.5) * anglePerSegment - 90) * (Math.PI / 180)
      const labelRadius = (outerRadius + innerRadius) / 2
      const labelX = center + labelRadius * Math.cos(midAngle)
      const labelY = center + labelRadius * Math.sin(midAngle)
      
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
        season: getSeasonForMonth(i + 1),
      }
    })
  }, [monthCount, calendarSystem, currentMonth, monthNames])
  
  // Generate cycle day markers
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
        x1, y1, x2, y2,
        day,
        isCurrentDay: day === cycleDay,
        color: info.color,
        phase,
      })
    }
    
    return markers
  }, [cycleDay, cycleLength, periodLength])
  
  // Upcoming moon phases for center expanded view
  const upcomingMoons = useMemo(() => {
    return [
      { phase: 'new' as const, date: getNextMoonPhase('new', date), name: 'New Moon' },
      { phase: 'first-quarter' as const, date: getNextMoonPhase('first-quarter', date), name: 'First Quarter' },
      { phase: 'full' as const, date: getNextMoonPhase('full', date), name: 'Full Moon' },
      { phase: 'last-quarter' as const, date: getNextMoonPhase('last-quarter', date), name: 'Last Quarter' },
    ].sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [date])
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Main Wheel */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] h-auto"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))' }}
        >
          {/* Outer wheel segments - clickable */}
          <g>
            {segments.map((segment, i) => (
              <g 
                key={i} 
                onClick={() => handleMonthClick(i)}
                className="cursor-pointer"
              >
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="1.5"
                  opacity={segment.isCurrentMonth ? 1 : 0.75}
                  className="transition-all duration-200 hover:opacity-100"
                  style={{
                    filter: segment.isCurrentMonth ? 'brightness(1.05)' : 'none',
                  }}
                />
                <text
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#2B2B2B"
                  fontSize="10"
                  fontWeight={segment.isCurrentMonth ? '600' : '400'}
                  className="select-none pointer-events-none"
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
              <circle
                cx={center}
                cy={center}
                r={innerRadius - 3}
                fill="none"
                stroke={phaseInfo?.colorLight || 'transparent'}
                strokeWidth="12"
              />
              
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
            </g>
          )}
          
          {/* Dial arrow pointing to current month */}
          {(() => {
            const anglePerSegment = 360 / monthCount
            const arrowAngle = ((currentMonth + 0.5) * anglePerSegment - 90) * (Math.PI / 180)
            const arrowInnerRadius = centerRadius + 4
            const arrowOuterRadius = innerRadius - 16
            const arrowTipX = center + arrowOuterRadius * Math.cos(arrowAngle)
            const arrowTipY = center + arrowOuterRadius * Math.sin(arrowAngle)
            const arrowBaseX = center + arrowInnerRadius * Math.cos(arrowAngle)
            const arrowBaseY = center + arrowInnerRadius * Math.sin(arrowAngle)
            
            // Arrow head points
            const headSize = 6
            const perpAngle = arrowAngle + Math.PI / 2
            const headLeft1X = arrowTipX - headSize * Math.cos(arrowAngle) + (headSize / 2) * Math.cos(perpAngle)
            const headLeft1Y = arrowTipY - headSize * Math.sin(arrowAngle) + (headSize / 2) * Math.sin(perpAngle)
            const headRight1X = arrowTipX - headSize * Math.cos(arrowAngle) - (headSize / 2) * Math.cos(perpAngle)
            const headRight1Y = arrowTipY - headSize * Math.sin(arrowAngle) - (headSize / 2) * Math.sin(perpAngle)
            
            return (
              <g className="pointer-events-none">
                {/* Arrow shaft */}
                <line
                  x1={arrowBaseX}
                  y1={arrowBaseY}
                  x2={arrowTipX - headSize * 0.7 * Math.cos(arrowAngle)}
                  y2={arrowTipY - headSize * 0.7 * Math.sin(arrowAngle)}
                  stroke="#D8A7A7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Arrow head */}
                <polygon
                  points={`${arrowTipX},${arrowTipY} ${headLeft1X},${headLeft1Y} ${headRight1X},${headRight1Y}`}
                  fill="#D8A7A7"
                />
                {/* Arrow base circle */}
                <circle
                  cx={arrowBaseX}
                  cy={arrowBaseY}
                  r="3"
                  fill="#D8A7A7"
                />
              </g>
            )
          })()}
          
          {/* Center circle - clickable moon */}
          <g 
            onClick={handleCenterClick} 
            className="cursor-pointer"
          >
            <circle
              cx={center}
              cy={center}
              r={centerRadius}
              fill="#1a1a2e"
              stroke="#E8E4DF"
              strokeWidth="2"
              className="transition-all duration-200"
            />
            
            {/* Moon phase visualization */}
            <g transform={`translate(${center}, ${center - 15})`}>
              {/* Moon base */}
              <circle
                r="22"
                fill="#2a2a3e"
                stroke="#3a3a4e"
                strokeWidth="0.5"
              />
              {/* Illuminated portion - use stable values on SSR, dynamic on client */}
              <clipPath id="moonClipLiving">
                <circle r="22" />
              </clipPath>
              {mounted ? (
                <ellipse
                  cx={moonPhase.phase.includes('waning') 
                    ? 22 - (moonPhase.illumination / 100) * 44 
                    : -22 + (moonPhase.illumination / 100) * 44}
                  cy="0"
                  rx={Math.abs(22 - (moonPhase.illumination / 100) * 44)}
                  ry="22"
                  fill="#f5f5dc"
                  clipPath="url(#moonClipLiving)"
                />
              ) : (
                <ellipse
                  cx={-11}
                  cy="0"
                  rx={11}
                  ry="22"
                  fill="#f5f5dc"
                  clipPath="url(#moonClipLiving)"
                />
              )}
              {/* Moon texture overlay */}
              <circle
                r="22"
                fill="url(#moonTexture)"
                opacity="0.1"
              />
            </g>
            
            {/* Date display */}
            <text
              x={center}
              y={center + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFEF8"
              fontSize="10"
              className="select-none"
            >
              {displayMonth}
            </text>
            <text
              x={center}
              y={center + 36}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFEF8"
              fontSize="20"
              fontWeight="600"
              className="select-none"
            >
              {currentDay}
            </text>
            <text
              x={center}
              y={center + 52}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#a0a0b0"
              fontSize="9"
              className="select-none"
            >
              {currentYear}
            </text>
          </g>
          
          {/* Moon texture gradient */}
          <defs>
            <radialGradient id="moonTexture" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
        
        {/* Calendar toggle */}
        <button
          onClick={onToggleCalendar}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 px-3 py-1.5 text-xs font-medium rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
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
      
      {/* Expanded Center View - Moon, Star Chart, Calendar */}
      <AnimatePresence>
        {expandedView === 'center' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                <h2 className="text-lg font-semibold text-foreground">Cosmic View</h2>
                <button 
                  onClick={() => setExpandedView(null)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Moon Phase */}
                <div className="text-center">
                  <div className="inline-block p-6 rounded-full bg-[#1a1a2e] mb-4">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="#2a2a3e" stroke="#3a3a4e" strokeWidth="1" />
                      <clipPath id="moonClipExpanded">
                        <circle cx="40" cy="40" r="35" />
                      </clipPath>
                      <ellipse
                        cx={moonPhase.phase.includes('waning') 
                          ? 40 + 35 - (moonPhase.illumination / 100) * 70
                          : 40 - 35 + (moonPhase.illumination / 100) * 70}
                        cy="40"
                        rx={Math.abs(35 - (moonPhase.illumination / 100) * 70)}
                        ry="35"
                        fill="#f5f5dc"
                        clipPath="url(#moonClipExpanded)"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{moonPhase.name}</h3>
                  <p className="text-muted-foreground">{moonPhase.illumination}% illuminated</p>
                </div>
                
                {/* Upcoming Moon Phases */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Phases</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {upcomingMoons.map((moon, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-xl bg-secondary/50 text-center"
                      >
                        <p className="text-xs text-muted-foreground">{moon.name}</p>
                        <p className="text-sm font-medium text-foreground">
                          {moon.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Zodiac */}
                <div className="p-4 rounded-xl border border-border" style={{ backgroundColor: `${getElementColor(zodiac.element)}15` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{zodiac.symbol}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">{zodiac.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{zodiac.element} sign</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{astroInsight}</p>
                </div>
                
                {/* Mini Calendar */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">This Month</h4>
                  <div className="bg-secondary/30 rounded-xl p-3">
                    <MonthGrid
                      date={date}
                      calendarSystem={calendarSystem}
                      cycleDay={cycleDay}
                      cycleLength={cycleLength}
                      periodLength={periodLength}
                      cycleLogs={cycleLogs}
                      onDateSelect={(d) => {
                        onDateSelect?.(d)
                        setExpandedView(null)
                      }}
                      compact
                    />
                  </div>
                </div>
                
                {/* Cycle Phase Indicator */}
                {phaseInfo && (
                  <div 
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: phaseInfo.colorLight }}
                  >
                    <p className="text-sm font-medium text-foreground">Cycle Day {cycleDay}</p>
                    <p className="text-lg font-semibold text-foreground">{phaseInfo.name} Phase</p>
                    <p className="text-sm text-muted-foreground mt-1">{phaseInfo.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expanded Month View */}
      <AnimatePresence>
        {expandedView === 'month' && selectedMonth !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Header with navigation */}
              <div 
                className="flex items-center justify-between p-4 border-b border-border"
                style={{ backgroundColor: `${segments[selectedMonth]?.color}30` }}
              >
                <button 
                  onClick={() => navigateExpandedMonth(-1)}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    {getGregorianMonthName(expandedMonthDate.getMonth() + 1)}
                  </h2>
                  <p className="text-sm text-muted-foreground">{expandedMonthDate.getFullYear()}</p>
                </div>
                
                <button 
                  onClick={() => navigateExpandedMonth(1)}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setExpandedView(null)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Full calendar grid */}
                <MonthGrid
                  date={expandedMonthDate}
                  calendarSystem={calendarSystem}
                  cycleDay={cycleDay}
                  cycleLength={cycleLength}
                  periodLength={periodLength}
                  cycleLogs={cycleLogs}
                  onDateSelect={(d) => {
                    onDateSelect?.(d)
                    setExpandedView(null)
                  }}
                />
                
                {/* Season indicator */}
                <div className="mt-4 p-3 rounded-xl bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground capitalize">
                    {getSeasonForMonth(expandedMonthDate.getMonth() + 1)} season
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
