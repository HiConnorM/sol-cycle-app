'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CalendarSystem, IFCDate, MoonPhaseData } from '@/lib/types'
import { getUserPreferences, saveUserPreferences } from '@/lib/storage/cycle-storage'
import { gregorianToIFC, formatIFCDate, formatGregorianDate } from '@/lib/calendar/international-fixed-calendar'
import { getMoonPhase } from '@/lib/calendar/moon-phases'

// Stable default date for SSR (Jan 1, 2025 - avoids hydration mismatch)
const STABLE_DEFAULT_DATE = new Date(2025, 0, 1)

// Default moon data for SSR
const DEFAULT_MOON_DATA: MoonPhaseData = {
  phase: 'waxing-crescent',
  illumination: 25,
  name: 'Waxing Crescent',
}

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(STABLE_DEFAULT_DATE)
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('gregorian')
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [moonPhase, setMoonPhase] = useState<MoonPhaseData>(DEFAULT_MOON_DATA)
  
  // Initialize on mount with actual current date
  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setCurrentDate(now)
    setMoonPhase(getMoonPhase(now))
    
    const prefs = getUserPreferences()
    setCalendarSystem(prefs.calendarSystem)
    setIsLoading(false)
  }, [])
  
  // Update moon phase when date changes (client-side only)
  useEffect(() => {
    if (mounted) {
      setMoonPhase(getMoonPhase(currentDate))
    }
  }, [currentDate, mounted])
  
  // Update current date every minute (client-side only)
  useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [mounted])
  
  // IFC date conversion
  const ifcDate = useMemo(() => gregorianToIFC(currentDate), [currentDate])
  
  // Toggle calendar system
  const toggleCalendarSystem = useCallback(() => {
    const newSystem = calendarSystem === 'gregorian' ? 'international-fixed' : 'gregorian'
    setCalendarSystem(newSystem)
    saveUserPreferences({ calendarSystem: newSystem })
  }, [calendarSystem])
  
  // Set specific calendar system
  const setSystem = useCallback((system: CalendarSystem) => {
    setCalendarSystem(system)
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
    setCurrentDate(date)
  }, [])
  
  // Navigate by offset (days)
  const navigateByDays = useCallback((days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }, [currentDate])
  
  // Navigate by months
  const navigateByMonths = useCallback((months: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + months)
    setCurrentDate(newDate)
  }, [currentDate])
  
  // Go to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
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
