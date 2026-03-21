'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthGrid } from './month-grid'
import { CalendarToggle } from './calendar-toggle'
import { useCalendar } from '@/lib/hooks/use-calendar'
import { useCycle } from '@/lib/hooks/use-cycle'
import { getDaysInMonth, getGregorianMonthName } from '@/lib/calendar/international-fixed-calendar'

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const { currentDate, calendarSystem, setSystem, navigateByMonths, goToToday, ifcDate } = useCalendar()
  const { settings, cycleDay, logs } = useCycle()
  
  const [viewDate, setViewDate] = useState(new Date())
  
  const monthName = calendarSystem === 'gregorian'
    ? getGregorianMonthName(viewDate.getMonth() + 1)
    : ifcDate.monthName
  
  const year = viewDate.getFullYear()
  
  const navigateMonth = (direction: number) => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setViewDate(newDate)
  }
  
  const isCurrentMonth = useMemo(() => {
    const now = new Date()
    return viewDate.getMonth() === now.getMonth() && 
           viewDate.getFullYear() === now.getFullYear()
  }, [viewDate])
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
            {!isCurrentMonth && (
              <button
                onClick={() => setViewDate(new Date())}
                className="text-sm text-primary font-medium"
              >
                Today
              </button>
            )}
          </div>
          
          {/* Calendar system toggle */}
          <div className="flex justify-center">
            <CalendarToggle 
              value={calendarSystem}
              onChange={setSystem}
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="px-5 py-6 max-w-md mx-auto">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
            <p className="text-sm text-muted-foreground">{year}</p>
          </div>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Calendar grid */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <MonthGrid
            date={viewDate}
            calendarSystem={calendarSystem}
            cycleDay={cycleDay}
            cycleLength={settings.averageCycleLength}
            periodLength={settings.averagePeriodLength}
            cycleLogs={logs}
            onDateSelect={onDateSelect}
          />
        </div>
        
        {/* Info about 13-month calendar */}
        {calendarSystem === 'international-fixed' && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
            <h3 className="font-medium text-foreground mb-2">About the 13-Month Calendar</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The International Fixed Calendar has 13 months of exactly 28 days each. 
              Every month starts on Sunday and ends on Saturday. 
              The 13th month is called "Sol" and falls between June and July.
              {' '}
              <span className="font-medium">Year Day</span> (December 29) exists outside the weekly cycle.
            </p>
          </div>
        )}
        
        {/* Cycle info */}
        {cycleDay && (
          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <h3 className="font-medium text-foreground mb-3">Your Cycle</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current day</p>
                <p className="font-semibold text-foreground">Day {cycleDay}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cycle length</p>
                <p className="font-semibold text-foreground">{settings.averageCycleLength} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Period length</p>
                <p className="font-semibold text-foreground">{settings.averagePeriodLength} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last period</p>
                <p className="font-semibold text-foreground">
                  {settings.lastPeriodStart 
                    ? new Date(settings.lastPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
