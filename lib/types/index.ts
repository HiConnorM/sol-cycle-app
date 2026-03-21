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
