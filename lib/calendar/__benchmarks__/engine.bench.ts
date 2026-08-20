/**
 * Prediction-engine benchmark and performance budget.
 *
 * Run with: pnpm bench
 *
 * Measures a full recompute — what useCycle does whenever the log set changes.
 * A user who logs daily for five years reaches roughly 1800 logs, so the
 * largest case here is the realistic worst case rather than a synthetic one.
 *
 * The assertions are deliberately loose: they exist to catch an accidental
 * quadratic, not to police millisecond drift between machines.
 */
import { describe, it, expect } from 'vitest'
import {
  analyzeCyclePatterns,
  adjustPredictionWithToday,
} from '../cycle-predictions'
import { computeSymptomPatterns, getLeadIndicators } from '../symptom-patterns'
import { computePMDDProfile } from '../pmdd-profile'
import { computeEndoFlags } from '../endo-flags'
import { buildCyclesIndex } from '../../storage/cycle-storage'
import { addDaysToKey } from '../../utils/date-keys'
import type { CycleLog, CycleSettings } from '../../types'

const SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  trackingEnabled: true,
}

const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood swings', 'Breast tenderness']
const MOODS = ['Calm', 'Anxious', 'Irritable', 'Happy', 'Low']

/** Deterministic history: `cycles` cycles of daily logs with realistic jitter. */
export function makeHistory(cycles: number): CycleLog[] {
  const logs: CycleLog[] = []
  let key = '2020-01-01'
  for (let c = 0; c < cycles; c++) {
    const cycleLength = 26 + ((c * 7) % 6) // 26–31 days
    for (let d = 0; d < cycleLength; d++) {
      const bleeding = d < 5
      logs.push({
        date: key,
        flow: bleeding ? (d < 2 ? 'heavy' : 'medium') : 'none',
        symptoms: d % 3 === 0 ? [SYMPTOMS[(c + d) % SYMPTOMS.length]] : [],
        moods: d % 4 === 0 ? [MOODS[(c + d) % MOODS.length]] : [],
        painLevel: bleeding ? 5 : d % 7,
        energy: 5,
        notes: '',
      })
      key = addDaysToKey(key, 1)
    }
  }
  return logs
}

function measure(fn: () => void, iterations: number): number {
  fn() // warm up
  const start = performance.now()
  for (let i = 0; i < iterations; i++) fn()
  return (performance.now() - start) / iterations
}

/** One full recompute of everything useCycle derives from the logs. */
function fullRecompute(logs: CycleLog[]): void {
  const index = buildCyclesIndex(logs)
  const prediction = analyzeCyclePatterns(logs, SETTINGS)
  const patterns = computeSymptomPatterns(logs, index, {
    projectedCycleLength: prediction.projectedCycleLength,
  })
  computePMDDProfile(logs, index, prediction)
  computeEndoFlags(logs, index)
  adjustPredictionWithToday(prediction, null, getLeadIndicators(patterns))
}

describe('prediction engine performance', () => {
  const sizes = [12, 36, 60] // 1, 3 and 5 years of daily logging
  const timings: Record<number, number> = {}

  for (const cycles of sizes) {
    it(`recomputes ${cycles} cycles of history in a reasonable time`, () => {
      const logs = makeHistory(cycles)
      const iterations = cycles > 40 ? 20 : 50
      const each = measure(() => fullRecompute(logs), iterations)
      timings[cycles] = each
       
      console.log(`    ${cycles} cycles (${logs.length} logs): ${each.toFixed(2)} ms/recompute`)

      // A recompute happens on every log write, so it has to stay well inside
      // a frame budget even at five years of history.
      expect(each).toBeLessThan(100)
    })
  }

  it('scales close to linearly, not quadratically', () => {
    // 60 cycles is 5x the work of 12. Quadratic growth would be ~25x; allow
    // generous headroom for constant factors and still catch an O(n²) slip.
    const ratio = timings[60] / Math.max(timings[12], 0.001)
     
    console.log(`    growth 12 → 60 cycles: ${ratio.toFixed(1)}x (linear would be ~5x)`)
    expect(ratio).toBeLessThan(15)
  })
})
