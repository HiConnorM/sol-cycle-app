// Calendar System Types
export type CalendarSystem = 'gregorian' | 'international-fixed'

export interface IFCDate {
  year: number
  month: number // 1-13 (plus special days)
  day: number // 1-28
  isYearDay?: boolean
  isLeapDay?: boolean
  monthName: string
}

export interface GregorianDate {
  year: number
  month: number // 1-12
  day: number
}

// IFC Month names
export const IFC_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'Sol', // The 13th month, placed between June and July
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

// Cycle Tracking Types
export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy'
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'

export interface CycleData {
  id: string
  startDate: string // ISO date
  endDate?: string
  cycleLength: number
  periodLength: number
}

export interface CycleLog {
  date: string // ISO date
  flow: FlowLevel
  symptoms: string[]
  moods: string[]
  painLevel: number // 0-10
  energy: number // 0-10
  notes: string
  // Optional fields. Older logs without these are valid; the engine treats
  // missing values as missing (not zero).
  painLocations?: PainLocation[]
  bbt?: number // basal body temperature, °F or °C — unit per user preference
}

export interface CycleSettings {
  averageCycleLength: number
  averagePeriodLength: number
  lastPeriodStart: string | null
  trackingEnabled: boolean
}

// Symptom categories
export const PHYSICAL_SYMPTOMS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Breast tenderness',
  'Back pain',
  'Fatigue',
  'Nausea',
  'Acne',
  'Hot flashes',
  'Insomnia',
  'Constipation',
  'Diarrhea',
] as const

export const EMOTIONAL_SYMPTOMS = [
  'Anxiety',
  'Depression',
  'Mood swings',
  'Irritability',
  'Brain fog',
  'Low motivation',
  'Overwhelmed',
  'Crying spells',
  'Rage',
  'Hopelessness',
] as const

export const PMDD_SYMPTOMS = [
  'Severe mood swings',
  'Extreme irritability',
  'Deep depression',
  'Panic attacks',
  'Suicidal thoughts',
  'Feeling out of control',
  'Physical tension',
  'Food cravings',
  'Social withdrawal',
] as const

export const MOODS = [
  'Happy',
  'Calm',
  'Energetic',
  'Focused',
  'Creative',
  'Social',
  'Neutral',
  'Tired',
  'Anxious',
  'Sad',
  'Angry',
  'Stressed',
] as const

// Task Types
export type TaskFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export interface Task {
  id: string
  title: string
  frequency: TaskFrequency
  category: string
  completed: boolean
  dueDate?: string
  completedAt?: string
}

export const TASK_CATEGORIES = [
  'Home',
  'Grocery',
  'Health',
  'Self-Care',
  'Work',
  'Finance',
  'Social',
  'Care Tasks',
] as const

// Moon Phase Types
export type MoonPhase = 
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent'

export interface MoonPhaseData {
  phase: MoonPhase
  illumination: number // 0-100
  name: string
}

// Event Types for calendar
export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'birthday' | 'appointment' | 'reminder' | 'period' | 'custom'
  color?: string
}

// User Preferences
export interface UserPreferences {
  calendarSystem: CalendarSystem
  theme: 'light' | 'dark' | 'system'
  cycleSettings: CycleSettings
  notificationsEnabled: boolean
}

// Pain locations — used for endometriosis pattern flags. Optional on logs.
export const PAIN_LOCATIONS = [
  'Lower abdomen',
  'Lower back',
  'Pelvic',
  'Leg',
  'Ovary - left',
  'Ovary - right',
  'Bowel',
  'Bladder',
] as const

export type PainLocation = typeof PAIN_LOCATIONS[number]

// Prediction engine types
export type ConfidenceTier = 'learning' | 'low' | 'medium' | 'high'

export interface DateRange {
  earliest: Date | null
  latest: Date | null
}

export interface CyclePrediction {
  nextPeriodStart: Date | null
  nextPeriodRange: DateRange
  nextOvulation: Date | null
  pmddWindowStart: Date | null
  pmddWindowEnd: Date | null
  pmddWindowStartDay: number | null // cycle day
  pmddWindowEndDay: number | null
  confidence: number // 0-100
  confidenceTier: ConfidenceTier
  projectedCycleLength: number
  cycleLengthStdDev: number
  trend: 'regular' | 'irregular' | 'shortening' | 'lengthening'
  reason: string[]
  cycleHistoryCount: number
}

// One detected past cycle, persisted in storage as a derived cache.
export interface CycleHistoryEntry {
  startDate: string // ISO
  length: number
}

export interface SymptomPattern {
  symptom: string
  frequency: number // 0-1, fraction of cycles where this symptom appeared
  avgCycleDay: number
  spread: number // ± days (1 std dev)
  phase: CyclePhase
  occurrences: number
  isLeadIndicator: boolean // appears reliably before period start
  daysBeforePeriod?: number // if lead indicator, average lead time
}

export interface PMDDProfile {
  hasPattern: boolean
  windowStartDay: number | null // cycle day in current/projected cycle
  windowEndDay: number | null
  windowStartDate: Date | null
  windowEndDate: Date | null
  severity: 'mild' | 'moderate' | 'severe' | null
  trend: 'improving' | 'steady' | 'worsening' | null
  cyclesObserved: number
  reason: string[]
}

export type EndoFlagPattern =
  | 'high-pain-recurring'
  | 'pain-outside-bleeding'
  | 'long-bleeding'
  | 'bowel-bladder-pain'

export interface EndoFlag {
  pattern: EndoFlagPattern
  title: string
  description: string
  evidence: string
  cyclesObserved: number
  suggestedAction: string
}
