'use client'

import { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { CalendarSystem, CycleLog } from '@/lib/types'
import {
  gregorianToIFC,
  ifcToGregorian,
  getDaysInMonth,
  getGregorianMonthName,
  isLeapYear,
} from '@/lib/calendar/international-fixed-calendar'
import { getCyclePhase, getPhaseInfo } from '@/lib/calendar/cycle-calculations'
import { daysBetween, toDateKey, todayKey } from '@/lib/utils/date-keys'

interface MonthGridProps {
  date: Date
  calendarSystem: CalendarSystem
  cycleDay?: number | null
  cycleLength?: number
  periodLength?: number
  cycleLogs?: CycleLog[]
  onDateSelect?: (date: Date) => void
  compact?: boolean
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
  compact = false,
}: MonthGridProps) {
  const ifcDate = useMemo(() => gregorianToIFC(date), [date])
  
  const currentYear = date.getFullYear()
  const currentMonth = calendarSystem === 'gregorian' 
    ? date.getMonth() + 1 
    : ifcDate.month
  
  const monthName = calendarSystem === 'gregorian'
    ? getGregorianMonthName(currentMonth)
    : ifcDate.monthName
  
  /**
   * The real Gregorian date a grid cell stands for.
   *
   * IFC months are 28-day blocks that don't line up with Gregorian months, so
   * an IFC cell has to be converted rather than read off the grid position.
   */
  const gregorianDateForCell = useCallback(
    (day: number, special?: 'year-day' | 'leap-day'): Date => {
      if (calendarSystem === 'gregorian') {
        return new Date(currentYear, currentMonth - 1, day)
      }
      return ifcToGregorian({
        year: currentYear,
        month: currentMonth,
        day,
        isYearDay: special === 'year-day',
        isLeapDay: special === 'leap-day',
        monthName: '',
      })
    },
    [calendarSystem, currentYear, currentMonth]
  )

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const todayKeyValue = todayKey()

    /**
     * Cycle day for an arbitrary date, projected from today's.
     *
     * The old version offset from whichever date the component was handed and
     * blanked anything past one cycle length, so a month other than the
     * current one showed either the wrong cycle days or none at all. Wrapping
     * modulo the cycle length projects correctly in both directions.
     */
    const cycleDayFor = (cellDate: Date): number | null => {
      if (!cycleDay || cycleLength <= 0) return null
      const offset = daysBetween(new Date(), cellDate)
      const zeroBased = (((cycleDay - 1 + offset) % cycleLength) + cycleLength) % cycleLength
      return zeroBased + 1
    }

    const makeDay = (day: number, special?: 'year-day' | 'leap-day', label?: string) => {
      const cellDate = gregorianDateForCell(day, special)
      const thisCycleDay = cycleDayFor(cellDate)
      return {
        day,
        label,
        isToday: toDateKey(cellDate) === todayKeyValue,
        isCurrentMonth: true,
        special: special ?? null,
        cycleDay: thisCycleDay,
        phase: thisCycleDay ? getCyclePhase(thisCycleDay, cycleLength, periodLength) : null,
      }
    }

    if (calendarSystem === 'international-fixed') {
      // Every IFC month is exactly 28 days and starts on a Sunday, so the grid
      // is always a clean 4 x 7 with no leading blanks.
      const days = Array.from({ length: 28 }, (_, i) => makeDay(i + 1))

      // Year Day and Leap Day sit outside the week and belong to no month, but
      // they are real days a user can log. Showing them at the foot of the
      // month they follow is what makes the 13-month year add up to 365 or 366
      // — previously they were unreachable in this view entirely.
      if (currentMonth === 13) {
        days.push(makeDay(29, 'year-day', 'Year Day'))
      }
      if (currentMonth === 6 && isLeapYear(currentYear)) {
        days.push(makeDay(29, 'leap-day', 'Leap Day'))
      }

      return { days, startOffset: 0 }
    }

    // Gregorian calendar
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()

    const days: ReturnType<typeof makeDay>[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: 0,
        label: undefined,
        isToday: false,
        isCurrentMonth: false,
        special: null,
        cycleDay: null,
        phase: null,
      })
    }
    for (let day = 1; day <= daysInMonth; day++) days.push(makeDay(day))

    return { days, startOffset: firstDayOfMonth }
  }, [
    calendarSystem,
    currentYear,
    currentMonth,
    cycleDay,
    cycleLength,
    periodLength,
    gregorianDateForCell,
  ])

  // Check if a date has a log
  const getLogForDay = (day: number, special?: 'year-day' | 'leap-day' | null) => {
    const dateStr = toDateKey(gregorianDateForCell(day, special ?? undefined))
    return cycleLogs.find(log => log.date === dateStr)
  }
  
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Month header - hide in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            {monthName}
          </h3>
          <span className="text-sm text-muted-foreground">
            {currentYear}
          </span>
        </div>
      )}
      
      {/* Weekday headers */}
      <div className={cn("grid grid-cols-7 gap-1", compact ? "mb-1" : "mb-2")}>
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
          
          const log = getLogForDay(dayInfo.day, dayInfo.special)
          const hasFlow = log && log.flow !== 'none'
          const phaseInfo = dayInfo.phase ? getPhaseInfo(dayInfo.phase) : null
          
          return (
            <button
              key={index}
              onClick={() =>
                onDateSelect?.(gregorianDateForCell(dayInfo.day, dayInfo.special ?? undefined))
              }
              aria-label={dayInfo.label ?? undefined}
              title={dayInfo.label ?? undefined}
              className={cn(
                'flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                dayInfo.special ? 'py-2 mt-1' : 'aspect-square',
                'hover:bg-secondary/50',
                dayInfo.isToday && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                !dayInfo.isToday && dayInfo.isCurrentMonth && 'text-foreground',
                !dayInfo.isCurrentMonth && 'text-muted-foreground/50',
              )}
              style={{
                // Year Day and Leap Day belong to no week, so they span the
                // full row rather than sitting in a weekday column.
                gridColumn: dayInfo.special ? '1 / -1' : undefined,
                backgroundColor: dayInfo.isToday
                  ? undefined
                  : hasFlow
                    ? 'var(--phase-menstrual-light)'
                    : phaseInfo?.colorLight || undefined,
              }}
              disabled={!dayInfo.isCurrentMonth}
            >
              <span className="relative">
                {dayInfo.special ? dayInfo.label : dayInfo.day}
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
      
      {/* Phase legend - hide in compact mode */}
      {!compact && (
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
      )}
    </div>
  )
}
