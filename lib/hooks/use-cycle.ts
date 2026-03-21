'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CycleLog, CycleSettings, CyclePhase } from '@/lib/types'
import { 
  getCycleLogs, 
  saveCycleLog, 
  getCycleSettings, 
  saveCycleSettings,
  deleteCycleLog,
} from '@/lib/storage/cycle-storage'
import { 
  getCurrentCycleDay, 
  getCyclePhase, 
  getPhaseInfo,
  predictNextPeriod,
  daysUntilNextPeriod,
  isInPMDDWindow,
} from '@/lib/calendar/cycle-calculations'

export function useCycle() {
  const [logs, setLogs] = useState<CycleLog[]>([])
  const [settings, setSettings] = useState<CycleSettings>({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStart: null,
    trackingEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Load data on mount
  useEffect(() => {
    setLogs(getCycleLogs())
    setSettings(getCycleSettings())
    setIsLoading(false)
  }, [])
  
  // Current cycle day
  const cycleDay = getCurrentCycleDay(settings.lastPeriodStart)
  
  // Current phase
  const currentPhase: CyclePhase | null = cycleDay 
    ? getCyclePhase(cycleDay, settings.averageCycleLength, settings.averagePeriodLength)
    : null
  
  // Phase info
  const phaseInfo = currentPhase ? getPhaseInfo(currentPhase) : null
  
  // Predictions
  const nextPeriod = predictNextPeriod(settings.lastPeriodStart, settings.averageCycleLength)
  const daysUntil = daysUntilNextPeriod(settings.lastPeriodStart, settings.averageCycleLength)
  const inPMDDWindow = cycleDay ? isInPMDDWindow(cycleDay, settings.averageCycleLength) : false
  
  // Log a day
  const logDay = useCallback((log: CycleLog) => {
    saveCycleLog(log)
    setLogs(getCycleLogs())
    
    // If this is a flow day and it's before the current last period start,
    // check if we should update the last period start
    if (log.flow !== 'none') {
      const logDate = new Date(log.date)
      const lastStart = settings.lastPeriodStart ? new Date(settings.lastPeriodStart) : null
      
      // If no last period or this is a new period (more than 20 days from last start)
      if (!lastStart || (logDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24) > 20) {
        // Check if this is the start of a new period
        const prevDayLog = logs.find(l => {
          const prevDate = new Date(l.date)
          const diffDays = (logDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          return diffDays === 1
        })
        
        if (!prevDayLog || prevDayLog.flow === 'none') {
          // This is the start of a new period
          updateSettings({ lastPeriodStart: log.date })
        }
      }
    }
  }, [logs, settings.lastPeriodStart])
  
  // Delete a log
  const removeLog = useCallback((date: string) => {
    deleteCycleLog(date)
    setLogs(getCycleLogs())
  }, [])
  
  // Update settings
  const updateSettings = useCallback((updates: Partial<CycleSettings>) => {
    saveCycleSettings(updates)
    setSettings(getCycleSettings())
  }, [])
  
  // Get log for a specific date
  const getLogForDate = useCallback((date: string): CycleLog | undefined => {
    return logs.find(l => l.date === date)
  }, [logs])
  
  // Start new period
  const startNewPeriod = useCallback((date: string = new Date().toISOString().split('T')[0]) => {
    updateSettings({ lastPeriodStart: date })
    
    // Also log the day if not already logged
    const existingLog = getLogForDate(date)
    if (!existingLog) {
      logDay({
        date,
        flow: 'medium',
        symptoms: [],
        moods: [],
        painLevel: 0,
        energy: 5,
        notes: '',
      })
    } else if (existingLog.flow === 'none') {
      logDay({
        ...existingLog,
        flow: 'medium',
      })
    }
  }, [updateSettings, getLogForDate, logDay])
  
  return {
    // Data
    logs,
    settings,
    isLoading,
    
    // Current state
    cycleDay,
    currentPhase,
    phaseInfo,
    
    // Predictions
    nextPeriod,
    daysUntil,
    inPMDDWindow,
    
    // Actions
    logDay,
    removeLog,
    updateSettings,
    getLogForDate,
    startNewPeriod,
  }
}
