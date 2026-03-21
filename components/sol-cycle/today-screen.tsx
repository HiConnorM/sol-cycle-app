'use client'

import { useMemo, useState, useEffect } from 'react'
import { Sun, Moon, Sparkles, Heart, Utensils, Dumbbell } from 'lucide-react'
import { LivingWheel } from './living-wheel'
import { InsightCard } from './insight-card'
import { TaskCard } from './task-card'
import { MoonPhaseDisplay } from './moon-phase-display'
import { useCycle } from '@/lib/hooks/use-cycle'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useCalendar } from '@/lib/hooks/use-calendar'
import { getPhaseRecommendations } from '@/lib/content/phase-recommendations'

interface TodayScreenProps {
  onDateSelect?: (date: Date) => void
}

export function TodayScreen({ onDateSelect }: TodayScreenProps) {
  const { cycleDay, currentPhase, phaseInfo, daysUntil, inPMDDWindow, settings, logs } = useCycle()
  const { tasks, toggleTask, addTask, tasksByFrequency } = useTasks()
  const { currentDate, calendarSystem, toggleCalendarSystem, moonPhase } = useCalendar()
  const [mounted, setMounted] = useState(false)
  
  // Track mount state for hydration-safe rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const recommendations = useMemo(() => {
    return getPhaseRecommendations(currentPhase, inPMDDWindow)
  }, [currentPhase, inPMDDWindow])
  
  const dailyTasks = tasksByFrequency('daily')
  const weeklyTasks = tasksByFrequency('weekly')
  
  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])
  
  // Status text
  const statusText = useMemo(() => {
    if (!cycleDay) return 'Start tracking your cycle'
    if (daysUntil && daysUntil <= 3) return `Period expected in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
    if (inPMDDWindow) return 'PMDD window - take extra care'
    return phaseInfo?.description || ''
  }, [cycleDay, daysUntil, inPMDDWindow, phaseInfo])
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-4 max-w-md mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">Sol Cycle</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{greeting}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <MoonPhaseDisplay date={currentDate} size="sm" showLabel={false} />
            {cycleDay && (
              <div 
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: phaseInfo?.colorLight,
                  color: 'var(--foreground)',
                }}
              >
                Day {cycleDay}
              </div>
            )}
          </div>
        </div>
        
        {/* Status banner */}
        {statusText && (
          <div 
            className="px-5 py-2 text-center text-sm font-medium"
            style={{ 
              backgroundColor: inPMDDWindow ? 'var(--phase-luteal-light)' : 'var(--secondary)',
              color: 'var(--foreground)',
            }}
          >
            {statusText}
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        {/* Living Wheel - Clickable calendar with expandable center and segments */}
        <section className="py-4">
          <LivingWheel
            date={currentDate}
            calendarSystem={calendarSystem}
            cycleDay={cycleDay}
            cycleLength={settings.averageCycleLength}
            periodLength={settings.averagePeriodLength}
            cycleLogs={logs}
            onDateSelect={onDateSelect}
            onToggleCalendar={toggleCalendarSystem}
          />
        </section>
        
        {/* Moon Phase Card - only show real data after mount to avoid hydration mismatch */}
        {mounted && (
          <InsightCard
            title="Moon Phase"
            label={moonPhase.name}
            icon={<Moon className="w-4 h-4" />}
            variant="subtle"
          >
            <p>
              {moonPhase.illumination}% illuminated. 
              {moonPhase.phase === 'new' && ' A time for new beginnings and setting intentions.'}
              {moonPhase.phase === 'full' && ' Peak energy - a powerful time for manifestation.'}
              {moonPhase.phase === 'waxing-crescent' && ' Building energy - take action on your goals.'}
              {moonPhase.phase === 'waning-crescent' && ' Time to release and let go.'}
            </p>
          </InsightCard>
        )}
        
        {/* Phase Insight */}
        {recommendations && (
          <>
            <InsightCard
              title="Today's Insight"
              label={phaseInfo?.name}
              phase={currentPhase}
              variant="highlight"
              icon={<Sparkles className="w-4 h-4" />}
            >
              <p>{recommendations.insight}</p>
            </InsightCard>
            
            {/* Nourishment */}
            <InsightCard
              title="Nourishment"
              icon={<Utensils className="w-4 h-4" />}
            >
              <ul className="space-y-1">
                {recommendations.foods.slice(0, 3).map((food, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
            
            {/* Movement */}
            <InsightCard
              title="Movement"
              icon={<Dumbbell className="w-4 h-4" />}
            >
              <ul className="space-y-1">
                {recommendations.exercises.slice(0, 3).map((exercise, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{exercise}</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
            
            {/* Self-Care */}
            <InsightCard
              title="Self-Care"
              icon={<Heart className="w-4 h-4" />}
            >
              <ul className="space-y-1">
                {recommendations.rituals.slice(0, 3).map((ritual, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{ritual}</span>
                  </li>
                ))}
              </ul>
            </InsightCard>
          </>
        )}
        
        {/* PMDD Support */}
        {inPMDDWindow && recommendations?.pmddSupport && (
          <InsightCard
            title="PMDD Support"
            label="Priority"
            phase="luteal"
            variant="highlight"
            icon={<Heart className="w-4 h-4" />}
          >
            <p className="mb-2">{recommendations.pmddSupport.message}</p>
            <ul className="space-y-1">
              {recommendations.pmddSupport.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </InsightCard>
        )}
        
        {/* Tasks Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Today's Tasks</h2>
          
          <div className="grid gap-4">
            <TaskCard
              title="Daily"
              tasks={dailyTasks}
              frequency="daily"
              onToggleTask={toggleTask}
              onAddTask={(title) => addTask(title, 'daily', 'General')}
            />
            
            {weeklyTasks.length > 0 && (
              <TaskCard
                title="Weekly"
                tasks={weeklyTasks}
                frequency="weekly"
                onToggleTask={toggleTask}
                onAddTask={(title) => addTask(title, 'weekly', 'General')}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
