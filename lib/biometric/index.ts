import { Capacitor } from '@capacitor/core'
import { nativeProvider } from './native'
import { webAuthnProvider } from './webauthn'
import type { BiometricProvider } from './types'

export * from './types'
export { CRED_KEY } from './webauthn'

/**
 * Pick the lock backend for the current runtime: platform biometrics inside
 * the iOS app, WebAuthn in a browser or installed PWA.
 */
export function getBiometricProvider(): BiometricProvider {
  return Capacitor.isNativePlatform() ? nativeProvider : webAuthnProvider
}
