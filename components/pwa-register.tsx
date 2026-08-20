'use client'

import { useEffect } from 'react'
import { isNativeShell } from '@/lib/platform'

/**
 * Registers the service worker for offline-first PWA support on the web.
 *
 * Deliberately skipped inside the native iOS shell. There the assets already
 * live in the app bundle, so the worker buys nothing — and its cache-first
 * strategy is actively harmful: after an App Store update it would keep serving
 * the previous version's assets out of a cache that nothing invalidates. Any
 * worker left over from a web visit is unregistered for the same reason.
 */
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (isNativeShell()) {
      navigator.serviceWorker
        .getRegistrations()
        .then(registrations => registrations.forEach(r => r.unregister()))
        .catch(() => {
          /* nothing registered — nothing to undo */
        })
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .catch(err => console.warn('SW registration failed:', err))
  }, [])

  return null
}
