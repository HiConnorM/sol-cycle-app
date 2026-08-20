/**
 * Native biometric provider — Face ID / Touch ID through Capacitor.
 *
 * Used in the iOS app build. WebAuthn cannot be used there: the web view runs
 * at capacitor://localhost, which is not a registrable relying-party domain,
 * so navigator.credentials.create() has no valid rpId and fails.
 *
 * Nothing is persisted here beyond the "enrolled" flag. The device decides
 * whether the presented face or finger is the enrolled one, and there is no
 * secret for the app to hold — the data it protects is already local.
 */
import {
  BiometricAuth,
  BiometryErrorType,
  isBiometryErrorType,
} from '@aparajita/capacitor-biometric-auth'
import {
  BiometricCancelledError,
  BiometricUnavailableError,
  type BiometricProvider,
} from './types'

/** Errors that mean "the user backed out", not "authentication failed". */
const CANCELLED: readonly BiometryErrorType[] = [
  BiometryErrorType.userCancel,
  BiometryErrorType.appCancel,
  BiometryErrorType.systemCancel,
]

function toDomainError(error: unknown): Error {
  const code = (error as { code?: unknown })?.code
  if (isBiometryErrorType(code)) {
    if (CANCELLED.includes(code)) return new BiometricCancelledError()
    if (
      code === BiometryErrorType.biometryNotAvailable ||
      code === BiometryErrorType.biometryNotEnrolled ||
      code === BiometryErrorType.noDeviceCredential ||
      code === BiometryErrorType.passcodeNotSet
    ) {
      return new BiometricUnavailableError()
    }
  }
  return error instanceof Error ? error : new Error('Authentication failed')
}

async function prompt(reason: string): Promise<void> {
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Cancel',
      // Let the user fall back to the device passcode: if Face ID fails
      // repeatedly they would otherwise be locked out of their own data with
      // no recovery path, since nothing is stored on a server.
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use passcode',
    })
  } catch (error) {
    throw toDomainError(error)
  }
}

export const nativeProvider: BiometricProvider = {
  name: 'native',

  async isSupported() {
    try {
      const { isAvailable } = await BiometricAuth.checkBiometry()
      return isAvailable
    } catch {
      return false
    }
  },

  async register() {
    const { isAvailable } = await BiometricAuth.checkBiometry()
    if (!isAvailable) throw new BiometricUnavailableError()
    // Prompt once at setup, so enabling the lock proves it works before the
    // user is ever locked out by it.
    await prompt('Confirm it is you to turn on app lock for Sol Cycle.')
  },

  async verify() {
    await prompt('Unlock Sol Cycle.')
  },

  clear() {
    // No local enrolment state to discard — the device owns the credential.
  },
}
