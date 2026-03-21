import type { CycleLog, CycleSettings, CyclePhase } from '@/lib/types'
import { getCyclePhase, getPhaseInfo } from './cycle-calculations'
import { getMoonPhase } from './moon-phases'

export interface CyclePrediction {
  nextPeriodStart: Date | null
  nextOvulation: Date | null
  pmddWindowStart: Date | null
  pmddWindowEnd: Date | null
  confidence: number // 0-100
  projectedCycleLength: number
  trend: 'regular' | 'irregular' | 'shortening' | 'lengthening'
}

export interface PatternInsight {
  title: string
  description: string
  type: 'positive' | 'neutral' | 'attention'
  icon: string
}

export interface SymptomPattern {
  symptom: string
  frequency: number // percentage of cycles
  avgCycleDay: number
  phase: CyclePhase
}

/**
 * Analyze logged cycles and predict future patterns
 */
export function analyzeCyclePatterns(
  logs: CycleLog[],
  settings: CycleSettings
): CyclePrediction {
  // Default prediction based on settings
  let prediction: CyclePrediction = {
    nextPeriodStart: null,
    nextOvulation: null,
    pmddWindowStart: null,
    pmddWindowEnd: null,
    confidence: 0,
    projectedCycleLength: settings.averageCycleLength,
    trend: 'regular',
  }

  if (!settings.lastPeriodStart) {
    return prediction
  }

  // Find period starts (days where flow went from 'none' to something)
  const periodStarts: Date[] = []
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Extract cycle lengths from logs
  const cycleLengths: number[] = []
  let lastPeriodDate: Date | null = null

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i]
    const prevLog = i > 0 ? sortedLogs[i - 1] : null
    
    // Detect period start
    if (log.flow !== 'none' && log.flow !== 'spotting') {
      if (!prevLog || prevLog.flow === 'none' || prevLog.flow === 'spotting') {
        const periodDate = new Date(log.date)
        periodStarts.push(periodDate)
        
        if (lastPeriodDate) {
          const daysDiff = Math.round(
            (periodDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysDiff > 20 && daysDiff < 45) {
            cycleLengths.push(daysDiff)
          }
        }
        lastPeriodDate = periodDate
      }
    }
  }

  // Calculate projections based on historical data
  if (cycleLengths.length > 0) {
    const avgLength = Math.round(
      cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    )
    prediction.projectedCycleLength = avgLength
    
    // Calculate confidence based on consistency
    const variance = cycleLengths.reduce((acc, len) => 
      acc + Math.pow(len - avgLength, 2), 0
    ) / cycleLengths.length
    const stdDev = Math.sqrt(variance)
    
    // Higher confidence for lower standard deviation
    prediction.confidence = Math.max(0, Math.min(100, 
      Math.round(100 - stdDev * 10)
    ))
    
    // Detect trends
    if (cycleLengths.length >= 3) {
      const recent = cycleLengths.slice(-3)
      const trend = recent[2] - recent[0]
      if (trend > 2) prediction.trend = 'lengthening'
      else if (trend < -2) prediction.trend = 'shortening'
      else if (stdDev > 5) prediction.trend = 'irregular'
      else prediction.trend = 'regular'
    }
  } else {
    prediction.projectedCycleLength = settings.averageCycleLength
    prediction.confidence = 30 // Low confidence without data
  }

  // Calculate next dates
  const lastStart = new Date(settings.lastPeriodStart)
  
  prediction.nextPeriodStart = new Date(lastStart)
  prediction.nextPeriodStart.setDate(
    lastStart.getDate() + prediction.projectedCycleLength
  )
  
  prediction.nextOvulation = new Date(lastStart)
  prediction.nextOvulation.setDate(
    lastStart.getDate() + Math.round(prediction.projectedCycleLength / 2)
  )
  
  prediction.pmddWindowStart = new Date(lastStart)
  prediction.pmddWindowStart.setDate(
    lastStart.getDate() + prediction.projectedCycleLength - 10
  )
  
  prediction.pmddWindowEnd = new Date(prediction.nextPeriodStart)

  return prediction
}

/**
 * Generate personalized insights based on patterns
 */
export function generateInsights(
  logs: CycleLog[],
  settings: CycleSettings,
  prediction: CyclePrediction
): PatternInsight[] {
  const insights: PatternInsight[] = []

  if (logs.length < 7) {
    insights.push({
      title: 'Keep logging',
      description: 'Log at least 7 days to start seeing patterns.',
      type: 'neutral',
      icon: 'calendar',
    })
    return insights
  }

  // Analyze symptom patterns
  const symptomCounts: Record<string, number> = {}
  const symptomDays: Record<string, number[]> = {}
  
  logs.forEach((log, index) => {
    log.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
      if (!symptomDays[symptom]) symptomDays[symptom] = []
      symptomDays[symptom].push(index % settings.averageCycleLength)
    })
  })

  // Most common symptom
  const topSymptom = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)[0]
  
  if (topSymptom && topSymptom[1] >= 3) {
    const avgDay = Math.round(
      symptomDays[topSymptom[0]].reduce((a, b) => a + b, 0) / 
      symptomDays[topSymptom[0]].length
    )
    const phase = getCyclePhase(avgDay || 1, settings.averageCycleLength)
    const phaseInfo = getPhaseInfo(phase)
    
    insights.push({
      title: `${topSymptom[0]} patterns`,
      description: `${topSymptom[0]} appears most often during your ${phaseInfo.name.toLowerCase()} phase (around day ${avgDay}).`,
      type: 'neutral',
      icon: 'activity',
    })
  }

  // Energy pattern
  const avgEnergy = logs.reduce((acc, log) => acc + log.energy, 0) / logs.length
  if (avgEnergy < 4) {
    insights.push({
      title: 'Low energy trend',
      description: 'Your average energy is below 4. Consider adding more iron-rich foods and rest.',
      type: 'attention',
      icon: 'battery-low',
    })
  } else if (avgEnergy >= 7) {
    insights.push({
      title: 'Great energy levels',
      description: 'Your energy has been consistently high. Keep doing what works!',
      type: 'positive',
      icon: 'zap',
    })
  }

  // Pain patterns
  const highPainDays = logs.filter(log => log.painLevel >= 6).length
  if (highPainDays > logs.length * 0.3) {
    insights.push({
      title: 'Pain patterns detected',
      description: `High pain (6+) on ${Math.round(highPainDays / logs.length * 100)}% of logged days. Consider tracking triggers.`,
      type: 'attention',
      icon: 'alert-circle',
    })
  }

  // PMDD indicators
  const pmddSymptomsFound = logs.some(log => 
    log.symptoms.some(s => 
      s.includes('Severe') || s.includes('Extreme') || s.includes('Panic')
    )
  )
  if (pmddSymptomsFound) {
    insights.push({
      title: 'PMDD symptoms logged',
      description: 'You\'ve logged severe symptoms. Track consistently to identify your personal PMDD window.',
      type: 'attention',
      icon: 'heart',
    })
  }

  // Prediction confidence
  if (prediction.confidence >= 70) {
    insights.push({
      title: 'Reliable predictions',
      description: `${prediction.confidence}% confidence in your cycle predictions based on consistent patterns.`,
      type: 'positive',
      icon: 'check-circle',
    })
  }

  // Cycle regularity
  if (prediction.trend === 'irregular') {
    insights.push({
      title: 'Variable cycles',
      description: 'Your cycle length varies. This is normal, but tracking helps predict better.',
      type: 'neutral',
      icon: 'trending-up',
    })
  }

  return insights.slice(0, 5) // Max 5 insights
}

/**
 * Get moon-cycle correlation insights
 */
export function getMoonCycleCorrelation(
  logs: CycleLog[],
  settings: CycleSettings
): { correlation: string; insight: string } | null {
  if (logs.length < 28) return null

  // Find period starts and check moon phase alignment
  const periodStartsWithMoon: { date: Date; moonPhase: string }[] = []
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i]
    const prevLog = i > 0 ? sortedLogs[i - 1] : null
    
    if (log.flow !== 'none' && log.flow !== 'spotting') {
      if (!prevLog || prevLog.flow === 'none' || prevLog.flow === 'spotting') {
        const date = new Date(log.date)
        const moon = getMoonPhase(date)
        periodStartsWithMoon.push({ date, moonPhase: moon.phase })
      }
    }
  }

  if (periodStartsWithMoon.length < 2) return null

  // Check for new moon or full moon alignment
  const newMoonAligned = periodStartsWithMoon.filter(
    p => p.moonPhase === 'new' || p.moonPhase === 'waxing-crescent'
  ).length
  const fullMoonAligned = periodStartsWithMoon.filter(
    p => p.moonPhase === 'full' || p.moonPhase === 'waning-gibbous'
  ).length

  const total = periodStartsWithMoon.length

  if (newMoonAligned / total >= 0.5) {
    return {
      correlation: 'White Moon Cycle',
      insight: 'Your period tends to align with the new moon - traditionally associated with fertility and outward expression.',
    }
  } else if (fullMoonAligned / total >= 0.5) {
    return {
      correlation: 'Red Moon Cycle',
      insight: 'Your period tends to align with the full moon - traditionally associated with healing and inner wisdom.',
    }
  }

  return null
}

/**
 * Generate season for a given month
 */
export function getSeasonForMonth(month: number): 'winter' | 'spring' | 'summer' | 'autumn' {
  // Northern hemisphere seasons
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

/**
 * Get seasonal colors for the wheel
 */
export function getSeasonalColors(): Record<string, { primary: string; secondary: string; accent: string }> {
  return {
    winter: {
      primary: '#C9D6E3', // Pale Blue
      secondary: '#C7C3D9', // Lavender Gray  
      accent: '#B7D3CF', // Misty Teal
    },
    spring: {
      primary: '#BFD8C2', // Sage Green
      secondary: '#AFC3A4', // Soft Olive
      accent: '#E4BFC3', // Blush Pink
    },
    summer: {
      primary: '#EAD9A0', // Muted Gold
      secondary: '#E8D2B0', // Warm Sand
      accent: '#E6B8A2', // Soft Peach
    },
    autumn: {
      primary: '#D8A7A7', // Dusty Rose
      secondary: '#BFA8C9', // Soft Plum
      accent: '#E6B8A2', // Soft Peach
    },
  }
}
