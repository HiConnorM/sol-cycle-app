/**
 * Runtime platform checks.
 *
 * The same bundle runs in three places — a browser tab, an installed PWA, and
 * the Capacitor iOS shell — and a few behaviours have to differ between them.
 */
import { Capacitor } from '@capacitor/core'

/** True inside the Capacitor native shell rather than a browser. */
export function isNativeShell(): boolean {
  return Capacitor.isNativePlatform()
}

/** The platform Capacitor reports: 'ios', 'android', or 'web'. */
export function getPlatform(): string {
  return Capacitor.getPlatform()
}
