'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { CalendarSystem, CycleLog } from '@/lib/types'
import { gregorianToIFC, getDaysInMonth, getGregorianMonthName } from '@/lib/calendar/international-fixed-calendar'
import { getCyclePhase, getPhaseInfo } from '@/lib/calendar/cycle-calculations'

interface MonthGridProps {
  date: Date
  calendarSystem: CalendarSystem
  cycleDay?: number | null
  cycleLength?: number
  periodLength?: number
  cycleLogs?: CycleLog[]
  onDateSelect?: (date: Date) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MonthGrid({
  date,
  calendarSystem,
  cycleDay = null,
  cycleLength = 28,
  periodLength = 5,
  cycleLogs = [],
  onDateSelect,
}: MonthGridProps) {
  const ifcDate = useMemo(() => gregorianToIFC(date), [date])
  
  const currentYear = date.getFullYear()
  const currentMonth = calendarSystem === 'gregorian' 
    ? date.getMonth() + 1 
    : ifcDate.month
  
  const currentDay = calendarSystem === 'gregorian'
    ? date.getDate()
    : ifcDate.day
  
  const monthName = calendarSystem === 'gregorian'
    ? getGregorianMonthName(currentMonth)
    : ifcDate.monthName
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (calendarSystem === 'international-fixed') {
      // IFC: Every month has exactly 28 days, starting on Sunday
      // So the grid is always a perfect 4 rows x 7 columns
      const days = []
      for (let day = 1; day <= 28; day++) {
        const isToday = day === currentDay
        
        // Calculate which cycle day this would be
        const dayOffset = day - currentDay
        const thisCycleDay = cycleDay ? cycleDay + dayOffset : null
        const normalizedCycleDay = thisCycleDay && thisCycleDay > 0 && thisCycleDay <= cycleLength
          ? thisCycleDay
          : null
        
        const phase = normalizedCycleDay 
          ? getCyclePhase(normalizedCycleDay, cycleLength, periodLength)
          : null
        
        days.push({
          day,
          isToday,
          isCurrentMonth: true,
          cycleDay: normalizedCycleDay,
          phase,
        })
      }
      return { days, startOffset: 0 }
    } else {
      // Gregorian calendar
      const daysInMonth = getDaysInMonth(currentYear, currentMonth)
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
      
      const days = []
      
      // Add empty cells for days before the 1st
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: 0, isToday: false, isCurrentMonth: false, cycleDay: null, phase: null })
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === date.getDate() && 
          currentMonth === date.getMonth() + 1 && 
          currentYear === date.getFullYear()
        
        // Calculate cycle day for this date
        const dayOffset = day - date.getDate()
        const thisCycleDay = cycleDay ? cycleDay + dayOffset : null
        const normalizedCycleDay = thisCycleDay && thisCycleDay > 0 && thisCycleDay <= cycleLength
          ? thisCycleDay
          : null
        
        const phase = normalizedCycleDay 
          ? getCyclePhase(normalizedCycleDay, cycleLength, periodLength)
          : null
        
        days.push({
          day,
          isToday,
          isCurrentMonth: true,
          cycleDay: normalizedCycleDay,
          phase,
        })
      }
      
      return { days, startOffset: firstDayOfMonth }
    }
  }, [calendarSystem, currentYear, currentMonth, currentDay, date, cycleDay, cycleLength, periodLength])
  
  // Check if a date has a log
  const getLogForDay = (day: number) => {
    const dateStr = calendarSystem === 'gregorian'
      ? new Date(currentYear, currentMonth - 1, day).toISOString().split('T')[0]
      : new Date(currentYear, currentMonth - 1, day).toISOString().split('T')[0] // Simplified
    
    return cycleLogs.find(log => log.date === dateStr)
  }
  
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">
          {monthName}
        </h3>
        <span className="text-sm text-muted-foreground">
          {currentYear}
        </span>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day.charAt(0)}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.days.map((dayInfo, index) => {
          if (dayInfo.day === 0) {
            return <div key={index} className="aspect-square" />
          }
          
          const log = getLogForDay(dayInfo.day)
          const hasFlow = log && log.flow !== 'none'
          const phaseInfo = dayInfo.phase ? getPhaseInfo(dayInfo.phase) : null
          
          return (
            <button
              key={index}
              onClick={() => {
                if (onDateSelect && calendarSystem === 'gregorian') {
                  const selectedDate = new Date(currentYear, currentMonth - 1, dayInfo.day)
                  onDateSelect(selectedDate)
                }
              }}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                'hover:bg-secondary/50',
                dayInfo.isToday && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                !dayInfo.isToday && dayInfo.isCurrentMonth && 'text-foreground',
                !dayInfo.isCurrentMonth && 'text-muted-foreground/50',
              )}
              style={{
                backgroundColor: dayInfo.isToday 
                  ? undefined 
                  : hasFlow 
                    ? 'var(--phase-menstrual-light)'
                    : phaseInfo?.colorLight || undefined,
              }}
              disabled={!dayInfo.isCurrentMonth}
            >
              <span className="relative">
                {dayInfo.day}
                {/* Flow indicator dot */}
                {hasFlow && (
                  <span 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--phase-menstrual)' }}
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Phase legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--phase-menstrual)' }} />
          <span className="text-muted-foreground">Menstrual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--phase-follicular)' }} />
          <span className="text-muted-foreground">Follicular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--phase-ovulatory)' }} />
          <span className="text-muted-foreground">Ovulatory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--phase-luteal)' }} />
          <span className="text-muted-foreground">Luteal</span>
        </div>
      </div>
    </div>
  )
}
