'use client'

import { Fingerprint, AlertCircle, Loader2 } from 'lucide-react'

interface BiometricLockScreenProps {
  isAuthenticating: boolean
  authError: string | null
  onUnlock: () => void
}

/**
 * Full-screen lock overlay.
 * Shown when biometric lock is enabled and the app is in the locked state.
 * Pressing the unlock button triggers the WebAuthn challenge (Face ID /
 * Touch ID on iOS, fingerprint / PIN on Android, Windows Hello on desktop).
 */
export function BiometricLockScreen({
  isAuthenticating,
  authError,
  onUnlock,
}: BiometricLockScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-8 px-8"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="App locked"
    >
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shadow-inner">
        <Fingerprint
          className="w-12 h-12 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      {/* Copy */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Sol Cycle is locked</h1>
        <p className="text-sm text-muted-foreground">
          Authenticate to access your data.
        </p>
      </div>

      {/* Error */}
      {authError && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 max-w-xs w-full"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{authError}</p>
        </div>
      )}

      {/* Unlock button */}
      <button
        onClick={onUnlock}
        disabled={isAuthenticating}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-base disabled:opacity-50 transition-opacity hover:opacity-90"
        aria-label="Unlock with biometrics"
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Authenticating…</span>
          </>
        ) : (
          <>
            <Fingerprint className="w-5 h-5" aria-hidden="true" />
            <span>Unlock</span>
          </>
        )}
      </button>

      {/* Privacy reassurance */}
      <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
        Biometric data is handled entirely by your device. Sol Cycle never receives or stores it.
      </p>
    </div>
  )
}
