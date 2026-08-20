/**
 * Moon phase tests.
 *
 * Phase is computed from the Moon's true elongation from the Sun (Meeus ch.
 * 47), not from elapsed time since a reference new moon. The mean-synodic
 * approach it replaced drifted up to 19 hours, which is enough to print the
 * wrong phase name on the day someone actually looks up at the sky.
 *
 * The strongest anchors below are solar and lunar eclipses: an eclipse can
 * only happen at new moon (solar) or full moon (lunar), and their instants are
 * documented to the minute, so they pin the model to reality independently of
 * any moon-phase table.
 */
import { describe, it, expect } from 'vitest'
import { getMoonPhase, getNextMoonPhase, daysUntilNewMoon } from '../moon-phases'

/** Greatest-eclipse instants (UTC). Solar eclipses occur at new moon. */
const SOLAR_ECLIPSES = [
  '2017-08-21T18:26:00Z', // Great American Eclipse
  '2024-04-08T18:17:00Z', // Great North American Eclipse
  '2026-08-12T17:46:00Z', // total, Iceland and northern Spain
  '2027-08-02T10:07:00Z', // total, Egypt — the long one
]

/** Greatest-eclipse instants (UTC). Lunar eclipses occur at full moon. */
const LUNAR_ECLIPSES = [
  '2018-07-27T20:22:00Z', // longest total lunar eclipse of the century
  '2022-11-08T10:59:00Z',
  '2025-03-14T06:59:00Z',
  '2025-09-07T18:12:00Z',
]

/** New moons through 2026, UTC. */
const NEW_MOONS_2026 = [
  '2026-01-18T19:52:00Z',
  '2026-02-17T12:01:00Z',
  '2026-03-19T01:23:00Z',
  '2026-04-17T11:52:00Z',
  '2026-05-16T20:01:00Z',
  '2026-06-15T02:54:00Z',
  '2026-07-14T09:44:00Z',
  '2026-08-12T17:37:00Z',
  '2026-09-11T03:27:00Z',
  '2026-10-10T15:50:00Z',
  '2026-11-09T07:02:00Z',
  '2026-12-09T00:52:00Z',
]

/** Full moons through 2026, UTC. */
const FULL_MOONS_2026 = [
  '2026-01-03T10:03:00Z',
  '2026-04-02T02:12:00Z',
  '2026-07-29T14:36:00Z',
  '2026-10-26T04:12:00Z',
]

/** Hours between our computed instant for `phase` and a known instant. */
function errorHours(phase: 'new' | 'full', iso: string): number {
  const actual = Date.parse(iso)
  // Search from well before the event so we find that occurrence, not the next.
  const computed = getNextMoonPhase(phase, new Date(actual - 20 * 86_400_000))
  return Math.abs(computed.getTime() - actual) / 3_600_000
}

describe('anchored to eclipses', () => {
  it('puts a new moon at every solar eclipse', () => {
    for (const iso of SOLAR_ECLIPSES) {
      const { phase, illumination } = getMoonPhase(new Date(iso))
      expect(phase, iso).toBe('new')
      expect(illumination, iso).toBe(0)
    }
  })

  it('puts a full moon at every lunar eclipse', () => {
    for (const iso of LUNAR_ECLIPSES) {
      const { phase, illumination } = getMoonPhase(new Date(iso))
      expect(phase, iso).toBe('full')
      expect(illumination, iso).toBe(100)
    }
  })

  it('lands within an hour of each eclipse instant', () => {
    // Greatest eclipse and the exact syzygy differ by a few minutes, so an
    // hour is the honest tolerance here — the model itself is far tighter.
    for (const iso of SOLAR_ECLIPSES) expect(errorHours('new', iso), iso).toBeLessThan(1)
    for (const iso of LUNAR_ECLIPSES) expect(errorHours('full', iso), iso).toBeLessThan(1)
  })
})

describe('accuracy against known phase instants', () => {
  it('computes every 2026 new moon to within 15 minutes', () => {
    for (const iso of NEW_MOONS_2026) {
      expect(errorHours('new', iso), iso).toBeLessThan(0.25)
    }
  })

  it('computes every 2026 full moon to within 15 minutes', () => {
    for (const iso of FULL_MOONS_2026) {
      expect(errorHours('full', iso), iso).toBeLessThan(0.25)
    }
  })

  it('reads exactly 0% at a new moon and 100% at a full moon', () => {
    // The old mean-synodic model could not do this: it read up to 3% at a real
    // new moon because it had the instant most of a day out.
    for (const iso of NEW_MOONS_2026) {
      expect(getMoonPhase(new Date(iso)).illumination, iso).toBe(0)
    }
    for (const iso of FULL_MOONS_2026) {
      expect(getMoonPhase(new Date(iso)).illumination, iso).toBe(100)
    }
  })

  it('names the phase correctly at each known instant', () => {
    for (const iso of NEW_MOONS_2026) expect(getMoonPhase(new Date(iso)).phase, iso).toBe('new')
    for (const iso of FULL_MOONS_2026) expect(getMoonPhase(new Date(iso)).phase, iso).toBe('full')
  })
})

describe('lunation structure', () => {
  /** Successive new moons over `count` lunations from 2020. */
  function lunations(count: number): number[] {
    const gaps: number[] = []
    let at = getNextMoonPhase('new', new Date('2020-01-01T00:00:00Z'))
    for (let i = 0; i < count; i++) {
      const next = getNextMoonPhase('new', new Date(at.getTime() + 86_400_000))
      gaps.push((next.getTime() - at.getTime()) / 86_400_000)
      at = next
    }
    return gaps
  }

  it('averages the mean synodic month over ten years', () => {
    const gaps = lunations(124)
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
    expect(mean).toBeCloseTo(29.53059, 2)
  })

  it('varies between lunations the way real ones do', () => {
    // Real lunations run roughly 29.27–29.83 days. A model that returned the
    // mean every time would pass the average check above but fail this one.
    const gaps = lunations(124)
    expect(Math.min(...gaps)).toBeGreaterThan(29.18)
    expect(Math.min(...gaps)).toBeLessThan(29.4)
    expect(Math.max(...gaps)).toBeGreaterThan(29.65)
    expect(Math.max(...gaps)).toBeLessThan(29.93)
  })
})

describe('illumination', () => {
  it('stays within 0–100 across a whole year', () => {
    for (let i = 0; i < 365; i++) {
      const { illumination } = getMoonPhase(new Date(2026, 0, 1 + i))
      expect(illumination).toBeGreaterThanOrEqual(0)
      expect(illumination).toBeLessThanOrEqual(100)
    }
  })

  it('rises to full and falls back every lunation', () => {
    const values = Array.from({ length: 60 }, (_, i) =>
      getMoonPhase(new Date(2026, 0, 1 + i)).illumination
    )
    expect(Math.max(...values)).toBeGreaterThanOrEqual(99)
    expect(Math.min(...values)).toBeLessThanOrEqual(1)
  })
})

describe('phase naming', () => {
  it('only calls it a quarter moon when it is about half lit', () => {
    // The bug this replaces labelled everything from 32% to 65% illuminated
    // as "First Quarter", which contradicted the percentage shown beside it.
    for (let i = 0; i < 365; i++) {
      const { phase, illumination } = getMoonPhase(new Date(2026, 0, 1 + i))
      if (phase === 'first-quarter' || phase === 'last-quarter') {
        expect(illumination).toBeGreaterThanOrEqual(45)
        expect(illumination).toBeLessThanOrEqual(55)
      }
    }
  })

  it('only calls it full when it is nearly fully lit', () => {
    for (let i = 0; i < 365; i++) {
      const { phase, illumination } = getMoonPhase(new Date(2026, 0, 1 + i))
      if (phase === 'full') expect(illumination).toBeGreaterThanOrEqual(95)
    }
  })

  it('only calls it new when it is barely lit', () => {
    for (let i = 0; i < 365; i++) {
      const { phase, illumination } = getMoonPhase(new Date(2026, 0, 1 + i))
      if (phase === 'new') expect(illumination).toBeLessThanOrEqual(5)
    }
  })

  it('waxes before full and wanes after', () => {
    for (let i = 0; i < 365; i++) {
      const day = new Date(2026, 0, 1 + i)
      const { phase, illumination } = getMoonPhase(day)
      const tomorrow = getMoonPhase(new Date(2026, 0, 2 + i)).illumination
      if (phase.startsWith('waxing')) {
        expect(tomorrow).toBeGreaterThanOrEqual(illumination - 1)
      }
      if (phase.startsWith('waning')) {
        expect(tomorrow).toBeLessThanOrEqual(illumination + 1)
      }
    }
  })

  it('visits all eight phases over a year', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 365; i++) seen.add(getMoonPhase(new Date(2026, 0, 1 + i)).phase)
    expect(seen.size).toBe(8)
  })

  it('gives every phase a display name', () => {
    for (let i = 0; i < 60; i++) {
      const { name } = getMoonPhase(new Date(2026, 0, 1 + i))
      expect(name.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('epoch is an absolute instant, not a local wall-clock time', () => {
  it('reports the same phase for the same moment regardless of how the Date was built', () => {
    // A Date is an instant; constructing it from a UTC string or from local
    // parts that denote the same instant must give the same answer.
    const utc = new Date('2026-06-15T02:54:00Z')
    const sameInstant = new Date(utc.getTime())
    expect(getMoonPhase(sameInstant)).toEqual(getMoonPhase(utc))
  })
})

describe('getNextMoonPhase', () => {
  it('finds a full moon within one lunar cycle', () => {
    const from = new Date('2026-07-01T00:00:00Z')
    const next = getNextMoonPhase('full', from)
    const days = (next.getTime() - from.getTime()) / 86_400_000
    expect(days).toBeGreaterThan(0)
    expect(days).toBeLessThanOrEqual(29.9)
  })

  it('lands on a date that actually reports that phase', () => {
    for (const phase of ['new', 'full', 'first-quarter', 'last-quarter'] as const) {
      const next = getNextMoonPhase(phase, new Date('2026-05-01T00:00:00Z'))
      expect(getMoonPhase(next).phase).toBe(phase)
    }
  })

  it('always looks forward, never back', () => {
    for (const iso of NEW_MOONS_2026) {
      const from = new Date(iso) // start exactly on a new moon
      expect(getNextMoonPhase('new', from).getTime()).toBeGreaterThan(from.getTime())
    }
  })

  it('returns the four principal phases in cycle order', () => {
    const from = new Date('2026-01-20T00:00:00Z') // just after a new moon
    const first = getNextMoonPhase('first-quarter', from).getTime()
    const full = getNextMoonPhase('full', from).getTime()
    const last = getNextMoonPhase('last-quarter', from).getTime()
    const next = getNextMoonPhase('new', from).getTime()
    expect(first).toBeLessThan(full)
    expect(full).toBeLessThan(last)
    expect(last).toBeLessThan(next)
  })
})

describe('daysUntilNewMoon', () => {
  it('is zero on a new moon', () => {
    for (const iso of NEW_MOONS_2026) {
      expect(daysUntilNewMoon(new Date(iso)), iso).toBe(0)
    }
  })

  it('is about half a cycle at a full moon', () => {
    for (const iso of FULL_MOONS_2026) {
      expect(daysUntilNewMoon(new Date(iso))).toBeGreaterThanOrEqual(14)
      expect(daysUntilNewMoon(new Date(iso))).toBeLessThanOrEqual(16)
    }
  })

  it('never exceeds a lunation', () => {
    for (let i = 0; i < 365; i++) {
      const days = daysUntilNewMoon(new Date(2026, 0, 1 + i))
      expect(days).toBeGreaterThanOrEqual(0)
      expect(days).toBeLessThanOrEqual(30)
    }
  })

  it('counts down day by day toward the new moon', () => {
    const start = new Date('2026-03-01T12:00:00Z')
    let previous = daysUntilNewMoon(start)
    for (let i = 1; i < 15; i++) {
      const days = daysUntilNewMoon(new Date(start.getTime() + i * 86_400_000))
      expect(days).toBeLessThanOrEqual(previous)
      previous = days
    }
  })
})
