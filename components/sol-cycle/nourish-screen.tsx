'use client'

import { useMemo } from 'react'
import { Apple, Dumbbell, Heart, Sparkles, Coffee, Moon } from 'lucide-react'
import { InsightCard } from './insight-card'
import { useCycle } from '@/lib/hooks/use-cycle'
import { getPhaseRecommendations } from '@/lib/content/phase-recommendations'
import { getPhaseInfo } from '@/lib/calendar/cycle-calculations'

export function NourishScreen() {
  const { currentPhase, phaseInfo, inPMDDWindow, cycleDay } = useCycle()
  
  const recommendations = useMemo(() => {
    return getPhaseRecommendations(currentPhase, inPMDDWindow)
  }, [currentPhase, inPMDDWindow])
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Nourish</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Support your body through every phase
          </p>
        </div>
      </header>
      
      {/* Phase banner */}
      {phaseInfo && (
        <div 
          className="px-5 py-3 text-center"
          style={{ backgroundColor: phaseInfo.colorLight }}
        >
          <p className="text-sm font-medium text-foreground">
            {phaseInfo.name} Phase {cycleDay && `(Day ${cycleDay})`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {phaseInfo.description}
          </p>
        </div>
      )}
      
      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        {/* Phase insight */}
        <InsightCard
          title="Your Body Right Now"
          phase={currentPhase}
          variant="highlight"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <p>{recommendations.insight}</p>
        </InsightCard>
        
        {/* Foods section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Apple className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Foods to Focus On</h2>
          </div>
          
          <div className="space-y-3">
            {recommendations.foods.map((food, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <span 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: phaseInfo?.colorLight || 'var(--secondary)' }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{food}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Exercise section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Movement Ideas</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {recommendations.exercises.map((exercise, i) => (
              <div 
                key={i}
                className="p-3 bg-card rounded-xl border border-border"
              >
                <p className="text-sm text-foreground">{exercise}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Self-care rituals */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Self-Care Rituals</h2>
          </div>
          
          <div className="space-y-3">
            {recommendations.rituals.map((ritual, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border"
              >
                <span className="text-primary mt-0.5">
                  <Heart className="w-4 h-4" />
                </span>
                <p className="text-sm text-foreground leading-relaxed">{ritual}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Quick tips by phase */}
        <section className="bg-secondary/50 rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Quick Tips</h3>
          
          {currentPhase === 'menstrual' && (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Coffee className="w-4 h-4 mt-0.5 text-primary" />
                <span>Reduce caffeine to help with cramps</span>
              </li>
              <li className="flex items-start gap-2">
                <Moon className="w-4 h-4 mt-0.5 text-primary" />
                <span>Aim for 8+ hours of sleep</span>
              </li>
            </ul>
          )}
          
          {currentPhase === 'follicular' && (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 text-primary" />
                <span>Your energy is rising - take on new challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <Dumbbell className="w-4 h-4 mt-0.5 text-primary" />
                <span>Great time to start a new workout routine</span>
              </li>
            </ul>
          )}
          
          {currentPhase === 'ovulatory' && (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 text-primary" />
                <span>Peak energy - schedule important meetings</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="w-4 h-4 mt-0.5 text-primary" />
                <span>Social connection is especially fulfilling now</span>
              </li>
            </ul>
          )}
          
          {currentPhase === 'luteal' && (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Moon className="w-4 h-4 mt-0.5 text-primary" />
                <span>Honor your need for more rest</span>
              </li>
              <li className="flex items-start gap-2">
                <Apple className="w-4 h-4 mt-0.5 text-primary" />
                <span>Complex carbs help with serotonin production</span>
              </li>
            </ul>
          )}
          
          {!currentPhase && (
            <p className="text-sm text-muted-foreground">
              Start tracking your cycle to receive personalized tips for each phase.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
