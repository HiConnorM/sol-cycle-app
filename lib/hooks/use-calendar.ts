'use client'

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react'
import type { CalendarSystem, MoonPhaseData } from'@/lib/types'
import {
  getUserPreferences,
  saveUserPreferences,
  subscribeToCycleData,
} from '@/lib/storage/cycle-storage'
import { useHydrated, useNow } from './use-hydration'
import { gregorianToIFC, formatIFCDate, formatGregorianDate } from '@/lib/calendar/international-fixed-calendar'
import { getMoonPhase } from '@/lib/calendar/moon-phases'

// Stable default date for SSR (Jan 1, 2025 - avoids hydration mismatch)
const STABLE_DEFAULT_DATE = new Date(2025, 0, 1)

// Default moon data for SSR (must match what STABLE_DEFAULT_DATE would produce)
const DEFAULT_MOON_DATA: MoonPhaseData = {
  phase: 'waxing-crescent',
  illumination: 25,
  name: 'Waxing Crescent',
}

/** The calendar system is stored, so it's read straight from the store. */
function getCalendarSystem(): CalendarSystem {
  return getUserPreferences().calendarSystem
}

function getServerCalendarSystem(): CalendarSystem {
  return 'gregorian'
}

export function useCalendar() {
  // A user-navigable date, when the user has moved off "now".
  const [pinnedDate, setPinnedDate] = useState<Date | null>(null)

  // Ticks once a minute; STABLE_DEFAULT_DATE during SSR and hydration so the
  // server and client markup agree.
  const now = useNow(STABLE_DEFAULT_DATE)
  const currentDate = pinnedDate ?? now

  const calendarSystem = useSyncExternalStore(
    subscribeToCycleData,
    getCalendarSystem,
    getServerCalendarSystem
  )

  const hydrated = useHydrated()

  // Derived, not stored: recomputing is far cheaper than an effect + setState.
  const moonPhase: MoonPhaseData = useMemo(
    () => (hydrated ? getMoonPhase(currentDate) : DEFAULT_MOON_DATA),
    [hydrated, currentDate]
  )

  const isLoading = !hydrated

  // IFC date conversion
  const ifcDate = useMemo(() => gregorianToIFC(currentDate), [currentDate])

  // Toggle calendar system — the store notifies every subscriber, so no
  // local state to keep in step.
  const toggleCalendarSystem = useCallback(() => {
    saveUserPreferences({
      calendarSystem:
        getCalendarSystem() === 'gregorian' ? 'international-fixed' : 'gregorian',
    })
  }, [])

  // Set specific calendar system
  const setSystem = useCallback((system: CalendarSystem) => {
    saveUserPreferences({ calendarSystem: system })
  }, [])
  
  // Format current date based on system
  const formattedDate = useMemo(() => {
    if (calendarSystem === 'international-fixed') {
      return formatIFCDate(ifcDate)
    }
    return formatGregorianDate(currentDate)
  }, [calendarSystem, currentDate, ifcDate])
  
  // Navigate to specific date
  const goToDate = useCallback((date: Date) => {
    setPinnedDate(date)
  }, [])

  // Navigate by offset (days)
  const navigateByDays = useCallback((days: number) => {
    setPinnedDate(prev => {
      const next = new Date(prev ?? new Date())
      next.setDate(next.getDate() + days)
      return next
    })
  }, [])

  // Navigate by months
  const navigateByMonths = useCallback((months: number) => {
    setPinnedDate(prev => {
      const next = new Date(prev ?? new Date())
      next.setMonth(next.getMonth() + months)
      return next
    })
  }, [])

  // Go to today — unpin and follow the clock again.
  const goToToday = useCallback(() => {
    setPinnedDate(null)
  }, [])
  
  return {
    // State
    currentDate,
    calendarSystem,
    isLoading,
    
    // Derived
    ifcDate,
    moonPhase,
    formattedDate,
    
    // Actions
    toggleCalendarSystem,
    setSystem,
    goToDate,
    navigateByDays,
    navigateByMonths,
    goToToday,
  }
}
