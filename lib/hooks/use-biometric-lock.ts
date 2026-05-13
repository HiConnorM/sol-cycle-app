'use client'

/**
 * use-biometric-lock.ts
 *
 * Platform-biometric lock using the WebAuthn PublicKeyCredential API.
 * On iOS Safari / Capacitor WKWebView this surfaces Face ID or Touch ID.
 * On Android it surfaces the device fingerprint or PIN prompt.
 * On desktop browsers with a platform authenticator it uses Windows Hello /
 * Touch ID / etc.  Falls back gracefully when the API is unavailable.
 *
 * Architecture
 * ─────────────
 * • A credential is registered once per device and its credentialId is stored
 *   in localStorage (`sol-cycle-biometric-cred-id`).  The credential itself
 *   lives in the platform's secure enclave — we never store it.
 * • On each lock challenge we call navigator.credentials.get() with the stored
 *   credentialId.  A successful resolve means the user authenticated.
 * • The preference ("biometric lock enabled") is stored separately under
 *   `sol-cycle-biometric-enabled`.
 * • Locking happens on: explicit lock(), visibility change (app backgrounded),
 *   or after an inactivity timeout (default: 5 min, configurable).
 *
 * Limitations
 * ───────────
 * • WebAuthn is not available in http:// contexts; works on https:// and
 *   localhost.  The hook disables itself silently in unsupported environments.
 * • We use `userVerification: 'required'` so the platform always asks for
 *   biometrics, not just presence.
 * • We do NOT persist the authentication state across full page reloads —
 *   that is intentional for a medical-data app.
 */

import { useState, useEffect, useCallback, useRef } from 'react'

const PREF_KEY = 'sol-cycle-biometric-enabled'
const CRED_KEY = 'sol-cycle-biometric-cred-id'

// RP (Relying Party) — must match the origin when registering.
// Using a fixed rpId of '' lets the browser infer it from the current origin.
const RP_NAME = 'Sol Cycle'

// Inactivity timeout in milliseconds (default 5 minutes).
const DEFAULT_INACTIVITY_MS = 5 * 60 * 1000

export interface UseBiometricLockReturn {
  /** Whether the biometric-lock feature is enabled by the user */
  isEnabled: boolean
  /** Whether the app is currently in the locked state */
  isLocked: boolean
  /** Whether the current platform supports WebAuthn platform authenticators */
  isSupported: boolean
  /** Whether an auth challenge is in progress (show a spinner) */
  isAuthenticating: boolean
  /** Error message from the last failed auth attempt */
  authError: string | null
  /** Enable biometric lock: registers a credential if one doesn't exist yet */
  enable: () => Promise<void>
  /** Disable biometric lock and remove stored credential reference */
  disable: () => void
  /** Lock the app immediately */
  lock: () => void
  /** Prompt biometric authentication to unlock */
  unlock: () => Promise<void>
}

function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof window.PublicKeyCredential !== 'undefined'
  )
}

/** Convert a base64url string to Uint8Array */
function base64urlToUint8(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/** Convert Uint8Array / ArrayBuffer to base64url */
function uint8ToBase64url(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf)
  let b64 = btoa(String.fromCharCode(...arr))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** Generate a random 16-byte challenge */
function randomChallenge(): Uint8Array {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return arr
}

export function useBiometricLock(
  inactivityMs: number = DEFAULT_INACTIVITY_MS
): UseBiometricLockReturn {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Initialise state from localStorage ──────────────────────────────────────
  useEffect(() => {
    setIsSupported(isWebAuthnSupported())

    if (typeof window === 'undefined') return
    const enabled = localStorage.getItem(PREF_KEY) === 'true'
    setIsEnabled(enabled)
    // Start locked if the feature is enabled.
    if (enabled) setIsLocked(true)
  }, [])

  // ── Inactivity reset ─────────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (!isEnabled) return
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      setIsLocked(true)
    }, inactivityMs)
  }, [isEnabled, inactivityMs])

  useEffect(() => {
    if (!isEnabled || isLocked) return
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }))
    resetInactivityTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [isEnabled, isLocked, resetInactivityTimer])

  // ── Visibility change → lock when app is backgrounded ───────────────────────
  useEffect(() => {
    if (!isEnabled) return
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setIsLocked(true)
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isEnabled])

  // ── Register (enable) ────────────────────────────────────────────────────────
  const enable = useCallback(async () => {
    if (!isWebAuthnSupported()) return
    setAuthError(null)
    setIsAuthenticating(true)

    try {
      // Create a new platform credential.
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: RP_NAME },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'sol-cycle-user',
            displayName: 'Sol Cycle User',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      })) as PublicKeyCredential | null

      if (!credential) throw new Error('No credential returned')

      // Persist only the credentialId (the key lives in the enclave).
      const credId = uint8ToBase64url(credential.rawId)
      localStorage.setItem(CRED_KEY, credId)
      localStorage.setItem(PREF_KEY, 'true')
      setIsEnabled(true)
      setIsLocked(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      // User cancelled — don't surface as error, just don't enable.
      if (!msg.includes('cancelled') && !msg.includes('abort') && !msg.includes('NotAllowedError')) {
        setAuthError('Could not set up biometric lock. Your device may not support it.')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  // ── Disable ──────────────────────────────────────────────────────────────────
  const disable = useCallback(() => {
    localStorage.removeItem(PREF_KEY)
    localStorage.removeItem(CRED_KEY)
    setIsEnabled(false)
    setIsLocked(false)
    setAuthError(null)
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
  }, [])

  // ── Lock ─────────────────────────────────────────────────────────────────────
  const lock = useCallback(() => {
    if (isEnabled) {
      setIsLocked(true)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [isEnabled])

  // ── Unlock ───────────────────────────────────────────────────────────────────
  const unlock = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      setIsLocked(false)
      return
    }

    const storedCredId = localStorage.getItem(CRED_KEY)
    if (!storedCredId) {
      // No credential registered — just unlock (shouldn't normally happen).
      setIsLocked(false)
      return
    }

    setAuthError(null)
    setIsAuthenticating(true)

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          allowCredentials: [
            {
              id: base64urlToUint8(storedCredId),
              type: 'public-key',
              transports: ['internal'],
            },
          ],
          userVerification: 'required',
          timeout: 60000,
        },
      })

      if (!assertion) throw new Error('Authentication failed')

      setIsLocked(false)
      setAuthError(null)
      resetInactivityTimer()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('cancelled') || msg.includes('abort') || msg.includes('NotAllowedError')) {
        // User dismissed — keep locked, no error banner.
      } else {
        setAuthError('Authentication failed. Please try again.')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }, [resetInactivityTimer])

  return {
    isEnabled,
    isLocked,
    isSupported,
    isAuthenticating,
    authError,
    enable,
    disable,
    lock,
    unlock,
  }
}
