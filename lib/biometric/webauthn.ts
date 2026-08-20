/**
 * WebAuthn biometric provider — the browser / PWA path.
 *
 * A platform credential is registered once per device and its credentialId is
 * kept in localStorage. The key itself lives in the platform's secure enclave;
 * the app never sees it. On each challenge we call navigator.credentials.get()
 * with the stored id, and a successful resolve means the user authenticated.
 *
 * `userVerification: 'required'` makes the platform ask for biometrics rather
 * than mere presence. WebAuthn needs a secure context, so this reports itself
 * unsupported over plain http:// (localhost excepted).
 */
import {
  BiometricCancelledError,
  BiometricUnavailableError,
  type BiometricProvider,
} from './types'

export const CRED_KEY = 'sol-cycle-biometric-cred-id'

const RP_NAME = 'Sol Cycle'

function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof window.PublicKeyCredential !== 'undefined'
  )
}

function base64urlToUint8(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function uint8ToBase64url(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf)
  const b64 = btoa(String.fromCharCode(...arr))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function randomChallenge(): Uint8Array {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return arr
}

/** WebAuthn signals user dismissal as NotAllowedError or AbortError. */
function toDomainError(error: unknown): Error {
  const name = (error as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'AbortError') {
    return new BiometricCancelledError()
  }
  if (name === 'NotSupportedError' || name === 'SecurityError') {
    return new BiometricUnavailableError()
  }
  return error instanceof Error ? error : new Error('Authentication failed')
}

export const webAuthnProvider: BiometricProvider = {
  name: 'webauthn',

  async isSupported() {
    if (!isWebAuthnSupported()) return false
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    } catch {
      return false
    }
  },

  async register() {
    if (!isWebAuthnSupported()) throw new BiometricUnavailableError()

    try {
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
            { type: 'public-key', alg: -7 }, // ES256
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

      localStorage.setItem(CRED_KEY, uint8ToBase64url(credential.rawId))
    } catch (error) {
      throw toDomainError(error)
    }
  },

  async verify() {
    if (!isWebAuthnSupported()) throw new BiometricUnavailableError()

    const storedCredId = localStorage.getItem(CRED_KEY)
    if (!storedCredId) throw new BiometricUnavailableError('No credential registered')

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
    } catch (error) {
      throw toDomainError(error)
    }
  },

  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(CRED_KEY)
  },
}
