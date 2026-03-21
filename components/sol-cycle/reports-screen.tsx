'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  Moon, 
  Heart, 
  Activity,
  AlertCircle,
  CheckCircle,
  Zap,
  Battery,
  Info,
  ChevronRight,
} from 'lucide-react'
import { useCycle } from '@/lib/hooks/use-cycle'
import { useCalendar } from '@/lib/hooks/use-calendar'
import { 
  analyzeCyclePatterns, 
  generateInsights, 
  getMoonCycleCorrelation,
  type PatternInsight,
} from '@/lib/calendar/cycle-predictions'
import { getPhaseInfo, getCyclePhase } from '@/lib/calendar/cycle-calculations'
import { getMoonPhase } from '@/lib/calendar/moon-phases'

const iconMap: Record<string, typeof Activity> = {
  'calendar': Calendar,
  'activity': Activity,
  'battery-low': Battery,
  'zap': Zap,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
  'heart': Heart,
  'trending-up': TrendingUp,
}

function InsightIcon({ icon, type }: { icon: string; type: PatternInsight['type'] }) {
  const Icon = iconMap[icon] || Info
  const colors = {
    positive: 'text-green-600 bg-green-50',
    neutral: 'text-blue-600 bg-blue-50',
    attention: 'text-amber-600 bg-amber-50',
  }
  
  return (
    <div className={`p-2 rounded-lg ${colors[type]}`}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export function ReportsScreen() {
  const { cycleDay, settings, logs, currentPhase, phaseInfo, inPMDDWindow } = useCycle()
  const { currentDate, moonPhase } = useCalendar()
  
  // Analyze patterns and generate predictions
  const prediction = useMemo(() => {
    return analyzeCyclePatterns(logs, settings)
  }, [logs, settings])
  
  const insights = useMemo(() => {
    return generateInsights(logs, settings, prediction)
  }, [logs, settings, prediction])
  
  const moonCorrelation = useMemo(() => {
    return getMoonCycleCorrelation(logs, settings)
  }, [logs, settings])
  
  // Calculate cycle progress
  const cycleProgress = cycleDay && settings.averageCycleLength 
    ? Math.round((cycleDay / settings.averageCycleLength) * 100)
    : 0
  
  // Recent symptom summary
  const recentSymptoms = useMemo(() => {
    const recent = logs.slice(-7)
    const symptoms: Record<string, number> = {}
    recent.forEach(log => {
      log.symptoms.forEach(s => {
        symptoms[s] = (symptoms[s] || 0) + 1
      })
    })
    return Object.entries(symptoms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }, [logs])
  
  // Average stats from recent logs
  const recentStats = useMemo(() => {
    const recent = logs.slice(-14)
    if (recent.length === 0) return null
    
    const avgEnergy = recent.reduce((a, l) => a + l.energy, 0) / recent.length
    const avgPain = recent.reduce((a, l) => a + l.painLevel, 0) / recent.length
    
    return {
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgPain: Math.round(avgPain * 10) / 10,
      daysLogged: recent.length,
    }
  }, [logs])
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your cycle patterns and predictions
          </p>
        </div>
      </header>
      
      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        {/* Cycle Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-sm border border-border"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Current Cycle</h2>
          
          {cycleDay ? (
            <>
              {/* Progress ring */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="var(--secondary)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={phaseInfo?.color || 'var(--primary)'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - cycleProgress / 100)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{cycleDay}</span>
                    <span className="text-xs text-muted-foreground">day</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div 
                    className="px-3 py-1.5 rounded-full text-sm font-medium inline-block"
                    style={{ backgroundColor: phaseInfo?.colorLight, color: '#2B2B2B' }}
                  >
                    {phaseInfo?.name} Phase
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {phaseInfo?.description}
                  </p>
                  {prediction.nextPeriodStart && (
                    <p className="text-xs text-muted-foreground">
                      Next period: {prediction.nextPeriodStart.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              {/* PMDD Warning */}
              {inPMDDWindow && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">PMDD Window</p>
                      <p className="text-xs text-amber-700">Extra self-care recommended</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Log your period to see cycle predictions
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Prediction Stats */}
        {prediction.confidence > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Avg Cycle</p>
              <p className="text-xl font-semibold text-foreground">
                {prediction.projectedCycleLength} days
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Prediction Confidence</p>
              <p className="text-xl font-semibold text-foreground">{prediction.confidence}%</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Cycle Pattern</p>
              <p className="text-lg font-semibold text-foreground capitalize">{prediction.trend}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Days Logged</p>
              <p className="text-xl font-semibold text-foreground">{logs.length}</p>
            </div>
          </motion.div>
        )}
        
        {/* Moon Correlation */}
        {moonCorrelation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5" />
              <h3 className="font-semibold">{moonCorrelation.correlation}</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {moonCorrelation.insight}
            </p>
          </motion.div>
        )}
        
        {/* Pattern Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Your Patterns</h2>
          
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div 
                  key={i}
                  className="bg-card rounded-xl p-4 border border-border flex items-start gap-3"
                >
                  <InsightIcon icon={insight.icon} type={insight.type} />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Keep logging to discover your patterns
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Recent Stats */}
        {recentStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl p-5 border border-border"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Last 14 Days
            </h3>
            
            <div className="space-y-4">
              {/* Energy meter */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Avg Energy
                  </span>
                  <span className="font-medium text-foreground">{recentStats.avgEnergy}/10</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${recentStats.avgEnergy * 10}%`,
                      backgroundColor: recentStats.avgEnergy >= 6 ? '#BFD8C2' : '#E6B8A2',
                    }}
                  />
                </div>
              </div>
              
              {/* Pain meter */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> Avg Pain
                  </span>
                  <span className="font-medium text-foreground">{recentStats.avgPain}/10</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${recentStats.avgPain * 10}%`,
                      backgroundColor: recentStats.avgPain <= 4 ? '#BFD8C2' : '#D8A7A7',
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Common symptoms */}
            {recentSymptoms.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Most frequent symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {recentSymptoms.map(([symptom, count]) => (
                    <span 
                      key={symptom}
                      className="px-2 py-1 rounded-full bg-secondary text-xs text-foreground"
                    >
                      {symptom} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Upcoming Predictions */}
        {(prediction.nextPeriodStart || prediction.nextOvulation) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Upcoming</h3>
            </div>
            
            <div className="divide-y divide-border">
              {prediction.nextOvulation && prediction.nextOvulation > currentDate && (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#EAD9A0]/20">
                      <Activity className="w-4 h-4 text-[#c4a52d]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Ovulation Window</p>
                      <p className="text-xs text-muted-foreground">Peak fertility</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {prediction.nextOvulation.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              
              {prediction.pmddWindowStart && prediction.pmddWindowStart > currentDate && (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#D8A7A7]/20">
                      <AlertCircle className="w-4 h-4 text-[#D8A7A7]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">PMDD Window</p>
                      <p className="text-xs text-muted-foreground">Prepare for extra care</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {prediction.pmddWindowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              
              {prediction.nextPeriodStart && (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#C7C3D9]/20">
                      <Calendar className="w-4 h-4 text-[#9992b8]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Next Period</p>
                      <p className="text-xs text-muted-foreground">Estimated start</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {prediction.nextPeriodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Tips for Better Predictions */}
        {logs.length < 60 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-xl bg-primary/5 border border-primary/10"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Improve Your Predictions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Log daily for 2-3 cycles to get more accurate predictions. 
                  The more data Sol Cycle has, the better it can understand your patterns.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
