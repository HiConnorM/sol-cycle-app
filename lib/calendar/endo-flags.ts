import type {
  CycleLog,
  CycleHistoryEntry,
  EndoFlag,
  PainLocation,
} from'@/lib/types'
import { buildCycleIndex, logsInCycle, type AnnotatedLog, type CycleIndex } from './cycle-index'

/**
 * Deterministic soft heuristics for endometriosis-adjacent pain patterns.
 *
 * Safety rules (hard-coded, never negotiable):
 * - Language is always descriptive, never diagnostic.
 * - Minimum 2 completed cycles of evidence required per flag.
 * - The suggestedAction is always "consider talking to a clinician."
 * - No flag mentions "endometriosis" as a diagnosis.
 */

const BOWEL_BLADDER_LOCATIONS: PainLocation[] = ['Bowel', 'Bladder']

const MIN_CYCLES = 2




/** Check: high pain (≥7) recurring across ≥2 completed cycles. */
function checkHighPainRecurring(
  annotated: AnnotatedLog[],
  completed: CycleHistoryEntry[]
): EndoFlag | null {
  if (completed.length < MIN_CYCLES) return null

  const cyclesWithHighPain = new Set<string>()
  for (const log of annotated) {
    if (log.painLevel >= 7 && completed.some(c => c.startDate === log.cycleStart)) {
      cyclesWithHighPain.add(log.cycleStart)
    }
  }
  if (cyclesWithHighPain.size < MIN_CYCLES) return null

  return {
    pattern: 'high-pain-recurring',
    title: 'Recurring high pain',
    description:
      'Pain levels of 7 or above have appeared across multiple cycles.',
    evidence: `High pain logged in ${cyclesWithHighPain.size} of ${completed.length} completed cycles.`,
    cyclesObserved: cyclesWithHighPain.size,
    suggestedAction:
      'Tracking pain patterns over time can be useful to share with a clinician.',
  }
}

/** Check: pain logged on days without active flow (pain outside bleeding). */
function checkPainOutsideBleeding(
  annotated: AnnotatedLog[],
  completed: CycleHistoryEntry[]
): EndoFlag | null {
  if (completed.length < MIN_CYCLES) return null

  const cyclesWithOutsidePain = new Set<string>()
  for (const log of annotated) {
    if (!completed.some(c => c.startDate === log.cycleStart)) continue
    if (log.painLevel < 4) continue
    const bleeding =
      log.flow !== 'none' &&
      log.flow !== 'spotting' &&
      log.flow !== undefined
    if (!bleeding && log.painLevel >= 4) {
      cyclesWithOutsidePain.add(log.cycleStart)
    }
  }
  if (cyclesWithOutsidePain.size < MIN_CYCLES) return null

  return {
    pattern: 'pain-outside-bleeding',
    title: 'Pain on non-period days',
    description:
      'Moderate to high pain has been logged on days without active bleeding across multiple cycles.',
    evidence: `Pain outside bleeding in ${cyclesWithOutsidePain.size} of ${completed.length} cycles.`,
    cyclesObserved: cyclesWithOutsidePain.size,
    suggestedAction:
      'Consider noting the pain location and sharing this log with a clinician.',
  }
}

/** Check: bleeding duration > 7 days across ≥2 completed cycles. */
function checkLongBleeding(
  index: CycleIndex,
  completed: CycleHistoryEntry[]
): EndoFlag | null {
  if (completed.length < MIN_CYCLES) return null

  const longCycles = new Set<string>()

  for (const cycle of completed) {
    const bleedingDays = logsInCycle(index, cycle.startDate).filter(
      l => l.flow !== 'none' && l.flow !== undefined
    ).length
    if (bleedingDays > 7) longCycles.add(cycle.startDate)
  }

  if (longCycles.size < MIN_CYCLES) return null

  return {
    pattern: 'long-bleeding',
    title: 'Prolonged bleeding',
    description:
      'Bleeding has been logged for more than 7 days in multiple cycles.',
    evidence: `Bleeding > 7 days in ${longCycles.size} of ${completed.length} completed cycles.`,
    cyclesObserved: longCycles.size,
    suggestedAction:
      'Prolonged bleeding is worth discussing with a clinician.',
  }
}

/** Check: bowel or bladder pain locations logged during cycle phase across ≥2 cycles. */
function checkBowelBladderPain(
  annotated: AnnotatedLog[],
  completed: CycleHistoryEntry[]
): EndoFlag | null {
  if (completed.length < MIN_CYCLES) return null

  const cyclesWithBBPain = new Set<string>()
  for (const log of annotated) {
    if (!completed.some(c => c.startDate === log.cycleStart)) continue
    if (!log.painLocations || log.painLocations.length === 0) continue
    if (log.painLevel < 4) continue
    const hasBB = log.painLocations.some((loc: PainLocation) =>
      BOWEL_BLADDER_LOCATIONS.includes(loc)
    )
    if (hasBB) cyclesWithBBPain.add(log.cycleStart)
  }
  if (cyclesWithBBPain.size < MIN_CYCLES) return null

  return {
    pattern: 'bowel-bladder-pain',
    title: 'Bowel or bladder pain pattern',
    description:
      'Pain in the bowel or bladder area has been logged across multiple cycles.',
    evidence: `Bowel/bladder pain in ${cyclesWithBBPain.size} of ${completed.length} cycles.`,
    cyclesObserved: cyclesWithBBPain.size,
    suggestedAction:
      'This location pattern is worth mentioning to a clinician.',
  }
}

/**
 * Run all heuristics and return active flags.
 * Returns an empty array if no patterns meet the evidence threshold.
 */
export function computeEndoFlags(
  logs: CycleLog[],
  cyclesIndex: CycleHistoryEntry[]
): EndoFlag[] {
  const completed = cyclesIndex.filter(c => c.length > 0)
  // One shared pass instead of each check re-deriving cycle membership.
  const index = buildCycleIndex(logs, cyclesIndex)
  const annotated = index.annotated
  const flags: EndoFlag[] = []

  const high = checkHighPainRecurring(annotated, completed)
  if (high) flags.push(high)

  const outside = checkPainOutsideBleeding(annotated, completed)
  if (outside) flags.push(outside)

  const long = checkLongBleeding(index, completed)
  if (long) flags.push(long)

  const bb = checkBowelBladderPain(annotated, completed)
  if (bb) flags.push(bb)

  return flags
}
