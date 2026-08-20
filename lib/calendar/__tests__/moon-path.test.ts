/**
 * Moon glyph geometry.
 *
 * The lit region is a half-disc joined to a half-ellipse of width
 * `r × |1 − 2k|` — subtracted for a crescent, added for a gibbous. That makes
 * the enclosed area exactly `k × πr²`, so the picture and the percentage
 * printed beside it always agree. These tests measure that area straight off
 * the emitted path.
 */
import { describe, it, expect } from 'vitest'
import { moonPhasePath, isWaning, getMoonPhaseIcon } from '../moon-phases'
import type { MoonPhase } from '../../types'

interface ParsedMoon {
  radius: number
  terminator: number
  limbSweep: number
  terminatorSweep: number
  cx: number
  top: number
  bottom: number
}

/** Pull the geometry back out of the path we emit. */
function parse(path: string): ParsedMoon {
  const move = /^M (-?[\d.]+) (-?[\d.]+)/.exec(path)
  const arcs = [
    ...path.matchAll(/A ([\d.]+) ([\d.]+) 0 0 ([01]) (-?[\d.]+) (-?[\d.]+)/g),
  ]
  expect(move, path).not.toBeNull()
  expect(arcs, path).toHaveLength(2)

  return {
    radius: Number(arcs[0][1]),
    terminator: Number(arcs[1][1]),
    limbSweep: Number(arcs[0][3]),
    terminatorSweep: Number(arcs[1][3]),
    cx: Number(move![1]),
    top: Number(move![2]),
    bottom: Number(arcs[0][5]),
  }
}

/**
 * Area enclosed by the path: a half-disc plus or minus a half-ellipse,
 * depending on which way the terminator bows.
 */
function litArea(path: string): number {
  const { radius, terminator, limbSweep, terminatorSweep } = parse(path)
  const halfDisc = (Math.PI * radius * radius) / 2
  const halfEllipse = (Math.PI * radius * terminator) / 2
  // Same sweep as the limb means the terminator bows away, adding area.
  return terminatorSweep === limbSweep ? halfDisc + halfEllipse : halfDisc - halfEllipse
}

const R = 22
const fullDisc = Math.PI * R * R

describe('lit area matches the stated illumination', () => {
  for (const percent of [0, 1, 10, 25, 40, 50, 60, 75, 90, 99, 100]) {
    it(`encloses ${percent}% of the disc at ${percent}% illuminated`, () => {
      const area = litArea(moonPhasePath(R, percent, false))
      expect(area / fullDisc).toBeCloseTo(percent / 100, 6)
    })
  }

  it('holds for a waning moon too', () => {
    for (const percent of [0, 25, 50, 75, 100]) {
      const area = litArea(moonPhasePath(R, percent, true))
      expect(area / fullDisc).toBeCloseTo(percent / 100, 6)
    }
  })

  it('grows without reversing as the moon fills', () => {
    let previous = -1
    for (let percent = 0; percent <= 100; percent++) {
      const area = litArea(moonPhasePath(R, percent, false))
      expect(area).toBeGreaterThan(previous)
      previous = area
    }
  })
})

describe('the shapes that were broken before', () => {
  it('lights nothing at new moon', () => {
    expect(litArea(moonPhasePath(R, 0, false))).toBeCloseTo(0, 6)
  })

  it('lights the whole disc at full moon', () => {
    // The old ellipse lit exactly half the disc here.
    expect(litArea(moonPhasePath(R, 100, false))).toBeCloseTo(fullDisc, 6)
  })

  it('lights exactly half at first quarter', () => {
    // The old ellipse collapsed to rx = 0 and lit nothing at all.
    const path = moonPhasePath(R, 50, false)
    expect(litArea(path)).toBeCloseTo(fullDisc / 2, 6)
    // A straight terminator: edge-on, so it projects to a line.
    expect(parse(path).terminator).toBe(0)
  })

  it('lights exactly half at last quarter', () => {
    expect(litArea(moonPhasePath(R, 50, true))).toBeCloseTo(fullDisc / 2, 6)
  })
})

describe('which side is lit', () => {
  it('lights the right-hand limb when waxing', () => {
    // Sweep 1 runs top → right → bottom.
    expect(parse(moonPhasePath(R, 30, false)).limbSweep).toBe(1)
  })

  it('lights the left-hand limb when waning', () => {
    expect(parse(moonPhasePath(R, 30, true)).limbSweep).toBe(0)
  })

  it('bows the terminator toward the lit limb for a crescent', () => {
    const { limbSweep, terminatorSweep } = parse(moonPhasePath(R, 20, false))
    expect(terminatorSweep).not.toBe(limbSweep)
  })

  it('bows the terminator away from the lit limb for a gibbous', () => {
    const { limbSweep, terminatorSweep } = parse(moonPhasePath(R, 80, false))
    expect(terminatorSweep).toBe(limbSweep)
  })

  it('mirrors waxing and waning at the same illumination', () => {
    const waxing = parse(moonPhasePath(R, 35, false))
    const waning = parse(moonPhasePath(R, 35, true))
    expect(waning.limbSweep).toBe(1 - waxing.limbSweep)
    expect(waning.terminatorSweep).toBe(1 - waxing.terminatorSweep)
    expect(waning.terminator).toBe(waxing.terminator)
  })
})

describe('isWaning', () => {
  it('is true for the waning phases and last quarter', () => {
    expect(isWaning('waning-gibbous')).toBe(true)
    expect(isWaning('waning-crescent')).toBe(true)
    expect(isWaning('last-quarter')).toBe(true)
  })

  it('is false for the waxing phases and first quarter', () => {
    expect(isWaning('waxing-gibbous')).toBe(false)
    expect(isWaning('waxing-crescent')).toBe(false)
    expect(isWaning('first-quarter')).toBe(false)
  })

  it('is false at new and full, where no side is lit differently', () => {
    expect(isWaning('new')).toBe(false)
    expect(isWaning('full')).toBe(false)
  })
})

describe('geometry basics', () => {
  it('centres the disc where asked', () => {
    const { cx, top, bottom } = parse(moonPhasePath(35, 60, false, 40, 40))
    expect(cx).toBe(40)
    expect(top).toBe(5) // 40 - 35
    expect(bottom).toBe(75) // 40 + 35
  })

  it('defaults to the origin', () => {
    const { cx, top, bottom } = parse(moonPhasePath(22, 60, false))
    expect(cx).toBe(0)
    expect(top).toBe(-22)
    expect(bottom).toBe(22)
  })

  it('clamps illumination outside 0-100', () => {
    expect(litArea(moonPhasePath(R, -20, false))).toBeCloseTo(0, 6)
    expect(litArea(moonPhasePath(R, 140, false))).toBeCloseTo(fullDisc, 6)
  })

  it('closes every path', () => {
    for (const percent of [0, 33, 50, 67, 100]) {
      expect(moonPhasePath(R, percent, false).endsWith('Z')).toBe(true)
    }
  })
})

describe('getMoonPhaseIcon', () => {
  const PHASES: MoonPhase[] = [
    'new',
    'waxing-crescent',
    'first-quarter',
    'waxing-gibbous',
    'full',
    'waning-gibbous',
    'last-quarter',
    'waning-crescent',
  ]

  it('draws every phase inside the 24x24 box', () => {
    for (const phase of PHASES) {
      const { cx, top, bottom } = parse(getMoonPhaseIcon(phase))
      expect(cx, phase).toBe(12)
      expect(top, phase).toBeGreaterThanOrEqual(0)
      expect(bottom, phase).toBeLessThanOrEqual(24)
    }
  })

  it('gives each phase a distinct shape', () => {
    const paths = PHASES.map(getMoonPhaseIcon)
    expect(new Set(paths).size).toBe(PHASES.length)
  })

  it('fills the disc at full and empties it at new', () => {
    const disc = Math.PI * 10 * 10
    expect(litArea(getMoonPhaseIcon('full'))).toBeCloseTo(disc, 6)
    expect(litArea(getMoonPhaseIcon('new'))).toBeCloseTo(0, 6)
  })

  it('half-lights both quarters', () => {
    const disc = Math.PI * 10 * 10
    expect(litArea(getMoonPhaseIcon('first-quarter'))).toBeCloseTo(disc / 2, 6)
    expect(litArea(getMoonPhaseIcon('last-quarter'))).toBeCloseTo(disc / 2, 6)
  })
})
