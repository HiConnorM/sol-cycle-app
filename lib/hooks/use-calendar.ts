'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CalendarSystem, IFCDate } from '@/lib/types'
import { getUserPreferences, saveUserPreferences } from '@/lib/storage/cycle-storage'
import { gregorianToIFC, formatIFCDate, formatGregorianDate } from '@/lib/calendar/international-fixed-calendar'
import { getMoonPhase } from '@/lib/calendar/moon-phases'

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('gregorian')
  const [isLoading, setIsLoading] = useState(true)
  
  // Load preferences on mount
  useEffect(() => {
    const prefs = getUserPreferences()
    setCalendarSystem(prefs.calendarSystem)
    setIsLoading(false)
  }, [])
  
  // Update current date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])
  
  // IFC date conversion
  const ifcDate = useMemo(() => gregorianToIFC(currentDate), [currentDate])
  
  // Moon phase
  const moonPhase = useMemo(() => getMoonPhase(currentDate), [currentDate])
  
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
