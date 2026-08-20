import type { MoonPhase, MoonPhaseData } from '@/lib/types'

/**
 * Mean synodic month — the average time from one new moon to the next.
 *
 * Used for stepping and searching, never for reporting a phase: real lunations
 * run anywhere from about 29.27 to 29.83 days, so the mean alone drifts.
 */
const LUNAR_CYCLE_DAYS = 29.53058867

/** Julian Day for the Unix epoch, for converting a JS timestamp to JD. */
const UNIX_EPOCH_JD = 2440587.5

/** Julian Day of J2000.0, the epoch the polynomials below are built around. */
const J2000_JD = 2451545.0

const DAY_MS = 86_400_000
const DEG = Math.PI / 180

/**
 * Half-width of the four principal phases, as a fraction of the cycle.
 *
 * New, first quarter, full and last quarter are astronomical *instants*, not
 * stretches. Splitting the cycle into eight equal segments — the original
 * approach — labelled everything from 32% to 65% illuminated as "First
 * Quarter", which reads as plainly wrong beside the illumination figure. A
 * roughly one-day window each keeps the label and the percentage consistent.
 */
const PRINCIPAL_HALF_WIDTH = 0.5 / LUNAR_CYCLE_DAYS // ≈ half a day either side

/** Where in the cycle each phase is centred. */
const NEW = 0
const FIRST_QUARTER = 0.25
const FULL = 0.5
const LAST_QUARTER = 0.75

const PHASE_NAMES: Record<MoonPhase, string> = {
  new: 'New Moon',
  'waxing-crescent': 'Waxing Crescent',
  'first-quarter': 'First Quarter',
  'waxing-gibbous': 'Waxing Gibbous',
  full: 'Full Moon',
  'waning-gibbous': 'Waning Gibbous',
  'last-quarter': 'Last Quarter',
  'waning-crescent': 'Waning Crescent',
}

/** Centre position of each phase, for searching forward to the next one. */
const PHASE_POSITIONS: Record<MoonPhase, number> = {
  new: NEW,
  'waxing-crescent': 0.125,
  'first-quarter': FIRST_QUARTER,
  'waxing-gibbous': 0.375,
  full: FULL,
  'waning-gibbous': 0.625,
  'last-quarter': LAST_QUARTER,
  'waning-crescent': 0.875,
}

/** Julian centuries from J2000.0 for an absolute instant. */
function julianCenturies(ms: number): number {
  return (ms / DAY_MS + UNIX_EPOCH_JD - J2000_JD) / 36525
}

/** Wrap degrees into [0, 360). */
function wrapDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * The Sun's geometric longitude, in degrees.
 *
 * Meeus, *Astronomical Algorithms* ch. 25, the low-precision form — good to
 * about 0.01°, far finer than anything a phase label depends on.
 */
function sunLongitude(t: number): number {
  const meanLongitude = 280.46646 + 36000.76983 * t + 0.0003032 * t * t
  const meanAnomaly = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * DEG

  const centre =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(meanAnomaly) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * meanAnomaly) +
    0.000289 * Math.sin(3 * meanAnomaly)

  return wrapDegrees(meanLongitude + centre)
}

/**
 * The Moon's apparent longitude, in degrees.
 *
 * Meeus ch. 47, truncated to the largest periodic terms. The Moon's orbit is
 * perturbed enough that the mean rate alone is up to 19 hours out — this
 * brings it back to within minutes, which is what makes the phase *name*
 * land on the right calendar day.
 */
function moonLongitude(t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t

  // Mean longitude.
  const L = 218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000
  // Mean elongation from the Sun.
  const D = (297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000) * DEG
  // The Sun's mean anomaly.
  const M = (357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000) * DEG
  // The Moon's mean anomaly.
  const MP = (134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000) * DEG
  // Argument of latitude.
  const F = (93.272095 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000) * DEG

  // Eccentricity of Earth's orbit, which modulates the Sun-dependent terms.
  const E = 1 - 0.002516 * t - 0.0000074 * t2
  const E2 = E * E

  // Σl, in units of 1e-6 degrees.
  const sum =
    6288774 * Math.sin(MP) +
    1274027 * Math.sin(2 * D - MP) +
    658314 * Math.sin(2 * D) +
    213618 * Math.sin(2 * MP) +
    -185116 * E * Math.sin(M) +
    -114332 * Math.sin(2 * F) +
    58793 * Math.sin(2 * D - 2 * MP) +
    57066 * E * Math.sin(2 * D - M - MP) +
    53322 * Math.sin(2 * D + MP) +
    45758 * E * Math.sin(2 * D - M) +
    -40923 * E * Math.sin(M - MP) +
    -34720 * Math.sin(D) +
    -30383 * E * Math.sin(M + MP) +
    15327 * Math.sin(2 * D - 2 * F) +
    -12528 * Math.sin(MP + 2 * F) +
    10980 * Math.sin(MP - 2 * F) +
    10675 * Math.sin(4 * D - MP) +
    10034 * Math.sin(3 * MP) +
    8548 * Math.sin(4 * D - 2 * MP) +
    -7888 * E * Math.sin(2 * D + M - MP) +
    -6766 * E * Math.sin(2 * D + M) +
    -5163 * Math.sin(D - MP) +
    4987 * E * Math.sin(D + M) +
    4036 * E * Math.sin(2 * D - M + MP) +
    3994 * Math.sin(2 * D + 2 * MP) +
    3861 * Math.sin(4 * D) +
    3665 * Math.sin(2 * D - 3 * MP) +
    -2689 * E * Math.sin(M - 2 * MP) +
    -2602 * Math.sin(2 * D - MP + 2 * F) +
    2390 * E * Math.sin(2 * D - M - 2 * MP) +
    -2348 * Math.sin(D + MP) +
    2236 * E2 * Math.sin(2 * D - 2 * M) +
    -2120 * E * Math.sin(M + 2 * MP) +
    -2069 * E2 * Math.sin(2 * M) +
    2048 * E2 * Math.sin(2 * D - 2 * M - MP) +
    -1773 * Math.sin(2 * D + MP - 2 * F) +
    -1595 * Math.sin(2 * D + 2 * F) +
    1215 * E * Math.sin(4 * D - M - MP) +
    -1110 * Math.sin(2 * MP + 2 * F) +
    -892 * Math.sin(3 * D - MP)

  return wrapDegrees(L + sum / 1e6)
}

/**
 * Position in the current lunation, 0 (new) to 1 (next new).
 *
 * This is the Moon's true elongation from the Sun, not an elapsed-time
 * estimate — so it stays locked to the sky rather than drifting through it.
 */
function cyclePosition(date: Date): number {
  const t = julianCenturies(date.getTime())
  return wrapDegrees(moonLongitude(t) - sunLongitude(t)) / 360
}

/** Distance between two positions on a wrapping 0–1 cycle. */
function cycleDistance(a: number, b: number): number {
  const raw = Math.abs(a - b)
  return Math.min(raw, 1 - raw)
}

function phaseFor(position: number): MoonPhase {
  // Principal phases first — each a narrow window around its instant.
  if (cycleDistance(position, NEW) < PRINCIPAL_HALF_WIDTH) return 'new'
  if (cycleDistance(position, FIRST_QUARTER) < PRINCIPAL_HALF_WIDTH) return 'first-quarter'
  if (cycleDistance(position, FULL) < PRINCIPAL_HALF_WIDTH) return 'full'
  if (cycleDistance(position, LAST_QUARTER) < PRINCIPAL_HALF_WIDTH) return 'last-quarter'

  // Everything else is one of the four intermediate phases.
  if (position < FIRST_QUARTER) return 'waxing-crescent'
  if (position < FULL) return 'waxing-gibbous'
  if (position < LAST_QUARTER) return 'waning-gibbous'
  return 'waning-crescent'
}

/**
 * Moon phase and illumination for a given date.
 *
 * Illumination is the standard fraction lit: 0% at new, 100% at full, 50% at
 * each quarter, derived from the elongation rather than assumed from elapsed
 * days.
 */
export function getMoonPhase(date: Date): MoonPhaseData {
  const position = cyclePosition(date)
  const illumination = Math.round(((1 - Math.cos(position * 2 * Math.PI)) / 2) * 100)
  const phase = phaseFor(position)

  return { phase, illumination, name: PHASE_NAMES[phase] }
}

/**
 * The instant the Moon next reaches `targetPosition` in its cycle.
 *
 * Elongation climbs monotonically, but at a rate that swings roughly ±20%
 * around the mean, so a single mean-rate estimate lands up to a day off.
 * Newton's method using the mean rate as the derivative converges in a
 * handful of passes.
 */
function nextPositionTime(targetPosition: number, fromMs: number): number {
  const cycleMs = LUNAR_CYCLE_DAYS * DAY_MS

  let ahead = targetPosition - cyclePosition(new Date(fromMs))
  if (ahead <= 0) ahead += 1
  let ms = fromMs + ahead * cycleMs

  for (let i = 0; i < 6; i++) {
    let delta = targetPosition - cyclePosition(new Date(ms))
    // Take the short way round: we are refining, not advancing a cycle.
    if (delta > 0.5) delta -= 1
    if (delta < -0.5) delta += 1
    ms += delta * cycleMs
  }

  // Refinement can nudge the answer back before `fromMs` when we started
  // within minutes of the phase; step on to the following one if so.
  return ms > fromMs ? ms : nextPositionTime(targetPosition, fromMs + cycleMs / 2)
}

/** Whole days until the next new moon from `date`. Used for cycle overlays. */
export function daysUntilNewMoon(date: Date): number {
  const ms = nextPositionTime(NEW, date.getTime())
  return Math.round((ms - date.getTime()) / DAY_MS)
}

/**
 * SVG path for the lit portion of the Moon.
 *
 * The lit region is bounded by two arcs: the outer limb on the sunlit side,
 * and the terminator — the day/night line, which projects to an ellipse whose
 * half-width is `radius × |1 − 2k|`. It curves *toward* the lit limb for a
 * crescent and *away* from it for a gibbous, flattening to a straight line at
 * exactly half lit.
 *
 * The previous implementation drew a single clipped ellipse instead, which put
 * a zero-width sliver on screen at first quarter (its `rx` collapsed to 0 at
 * 50% lit), lit only half the disc at full moon, and lit half of it at new
 * moon. It was wrong at every phase.
 *
 * @param radius       Radius of the Moon's disc.
 * @param illumination Percentage lit, 0–100.
 * @param waning       True when the Moon is lit on its left-hand side.
 * @param cx           Centre x, defaulting to the origin.
 * @param cy           Centre y, defaulting to the origin.
 */
export function moonPhasePath(
  radius: number,
  illumination: number,
  waning: boolean,
  cx = 0,
  cy = 0
): string {
  const lit = Math.min(Math.max(illumination, 0), 100) / 100

  // Half-width of the terminator ellipse: full at new and full moon, zero at
  // the quarters, where the terminator is edge-on and projects to a line.
  const terminator = radius * Math.abs(1 - 2 * lit)

  // Which side of the disc the sunlight falls on.
  const limbSweep = waning ? 0 : 1
  // Past half lit the terminator bows the other way, widening the lit region.
  const terminatorSweep = lit > 0.5 ? limbSweep : 1 - limbSweep

  const top = `${cx} ${cy - radius}`
  const bottom = `${cx} ${cy + radius}`

  return [
    `M ${top}`,
    `A ${radius} ${radius} 0 0 ${limbSweep} ${bottom}`,
    `A ${terminator} ${radius} 0 0 ${terminatorSweep} ${top}`,
    'Z',
  ].join(' ')
}

/** True when this phase is lit on its left-hand side. */
export function isWaning(phase: MoonPhase): boolean {
  return phase.startsWith('waning') || phase === 'last-quarter'
}

/** Illuminated percentage at the centre of a named phase. */
function illuminationOf(phase: MoonPhase): number {
  return Math.round(((1 - Math.cos(PHASE_POSITIONS[phase] * 2 * Math.PI)) / 2) * 100)
}

/**
 * Get moon phase icon path for SVG, drawn to fill a 24×24 box.
 */
export function getMoonPhaseIcon(phase: MoonPhase): string {
  return moonPhasePath(10, illuminationOf(phase), isWaning(phase), 12, 12)
}

/**
 * Get next occurrence of a specific moon phase
 */
export function getNextMoonPhase(phase: MoonPhase, fromDate: Date = new Date()): Date {
  return new Date(nextPositionTime(PHASE_POSITIONS[phase], fromDate.getTime()))
}
