'use client'

import { useMemo, useSyncExternalStore } from 'react'

/**
 * Hydration-safe primitives.
 *
 * The app renders a static HTML shell at build time, so anything that depends
 * on the browser — localStorage, the current time — has to be absent from the
 * first client render and appear only after hydration. The usual way to do
 * that is `useState(false)` plus an effect that sets it true, but that calls
 * setState during an effect and costs an extra render on every mount.
 *
 * useSyncExternalStore does the same job as a first-class API: React uses the
 * server snapshot while hydrating and the client snapshot afterwards.
 */

/** Never fires — these snapshots change exactly once, at hydration. */
const noopSubscribe = () => () => {}

const clientTrue = () => true
const serverFalse = () => false

/**
 * False during server render and the hydration pass, true afterwards.
 * Use to gate anything that would otherwise cause a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, clientTrue, serverFalse)
}

// ---------- Ticking clock ----------

/** Minute index since the epoch — stable for the whole minute. */
const MINUTE_MS = 60_000

function subscribeToMinute(onChange: () => void): () => void {
  const id = setInterval(onChange, MINUTE_MS)
  return () => clearInterval(id)
}

function getMinuteSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS)
}

/** Server renders a fixed value so the markup is deterministic. */
function getServerMinute(): number {
  return 0
}

/**
 * The current time, re-rendering once a minute.
 *
 * Returns `fallback` during server render and hydration. The snapshot is the
 * minute index rather than a Date so it stays referentially stable within the
 * minute — returning `new Date()` would make useSyncExternalStore re-render
 * without end.
 */
export function useNow(fallback: Date): Date {
  const minute = useSyncExternalStore(subscribeToMinute, getMinuteSnapshot, getServerMinute)
  return useMemo(
    () => (minute === 0 ? fallback : new Date(minute * MINUTE_MS)),
    [minute, fallback]
  )
}
