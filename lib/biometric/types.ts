/**
 * A device-lock backend. Two exist: platform biometrics via Capacitor on the
 * native iOS build, and WebAuthn in the browser. The hook picks one at runtime
 * and never needs to know which it got.
 */
export interface BiometricProvider {
  /** Human-readable name, used in log messages and tests. */
  readonly name: 'native' | 'webauthn' | 'unsupported'
  /** Whether this device can actually prompt for biometrics right now. */
  isSupported(): Promise<boolean>
  /** Enrol the app on this device. Throws on failure. */
  register(): Promise<void>
  /** Challenge the user. Resolves on success, throws otherwise. */
  verify(): Promise<void>
  /** Forget any local enrolment state. */
  clear(): void
}

/**
 * Thrown when the user dismissed the prompt themselves. The UI treats this as
 * "stay locked, say nothing" rather than as an error worth showing a banner
 * for — being told authentication failed because you tapped Cancel is noise.
 */
export class BiometricCancelledError extends Error {
  constructor(message = 'Authentication cancelled') {
    super(message)
    this.name = 'BiometricCancelledError'
  }
}

/** Thrown when the platform cannot offer biometrics at all. */
export class BiometricUnavailableError extends Error {
  constructor(message = 'Biometric authentication is unavailable') {
    super(message)
    this.name = 'BiometricUnavailableError'
  }
}
