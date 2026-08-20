/**
 * cycle-index.ts — one pass over the logs, shared by every analysis module.
 *
 * Symptom patterns, the PMDD profile and the endo flags all need the same two
 * things: which cycle each log belongs to, and which logs fall inside a given
 * cycle. Each module used to work that out for itself, and each did it the
 * quadratic way — scanning every period start for every log, and re-filtering
 * the whole log list once per cycle. At five years of daily logging that cost
 * roughly 0.4s per recompute, and a recompute happens on every save.
 *
 * Both structures are built here in a single sorted walk: O(n log n) for the
 * sort, O(n + m) for the walk.
 */
import type { CycleHistoryEntry, CycleLog } from '@/lib/types'
import { daysBetweenKeys, isValidDateKey } from '@/lib/utils/date-keys'

export interface AnnotatedLog extends CycleLog {
  /** 1-based day within the cycle this log falls in. */
  cycleDay: number
  /** Date key of the period start that opened that cycle. */
  cycleStart: string
}

export interface CycleIndex {
  /** Every log that falls on or after the first known period start. */
  annotated: AnnotatedLog[]
  /**
   * Logs grouped by the cycle that contains them, bounded by that cycle's
   * recorded length. Cycles of unknown length (the trailing one) collect
   * every log from their start onwards.
   */
  byCycleStart: Map<string, AnnotatedLog[]>
}

const EMPTY_INDEX: CycleIndex = { annotated: [], byCycleStart: new Map() }

/**
 * Annotate and group `logs` against the known cycles.
 *
 * Logs before the first period start are dropped: there is no cycle to
 * measure them against.
 */
export function buildCycleIndex(
  logs: CycleLog[],
  cyclesIndex: CycleHistoryEntry[]
): CycleIndex {
  if (cyclesIndex.length === 0 || logs.length === 0) return EMPTY_INDEX

  // Date keys are zero-padded, so lexical order is calendar order.
  const cycles = [...cyclesIndex]
    .filter(c => isValidDateKey(c.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  if (cycles.length === 0) return EMPTY_INDEX

  const sortedLogs = [...logs]
    .filter(l => isValidDateKey(l.date))
    .sort((a, b) => a.date.localeCompare(b.date))

  const annotated: AnnotatedLog[] = []
  const byCycleStart = new Map<string, AnnotatedLog[]>()
  for (const cycle of cycles) byCycleStart.set(cycle.startDate, [])

  // Two-pointer walk: both lists are sorted, so the cursor only moves forward.
  let cursor = 0
  for (const log of sortedLogs) {
    while (cursor + 1 < cycles.length && cycles[cursor + 1].startDate <= log.date) {
      cursor++
    }
    const cycle = cycles[cursor]
    if (log.date < cycle.startDate) continue // predates all known cycles

    const offset = daysBetweenKeys(cycle.startDate, log.date)
    const entry: AnnotatedLog = {
      ...log,
      cycleDay: offset + 1, // day 1 is the period start itself
      cycleStart: cycle.startDate,
    }
    annotated.push(entry)

    // length 0 means "still open" — collect everything from the start onwards.
    if (cycle.length === 0 || offset < cycle.length) {
      byCycleStart.get(cycle.startDate)!.push(entry)
    }
  }

  return { annotated, byCycleStart }
}

/** Logs inside `cycleStart`'s cycle, or an empty array if there are none. */
export function logsInCycle(index: CycleIndex, cycleStart: string): AnnotatedLog[] {
  return index.byCycleStart.get(cycleStart) ?? []
}
