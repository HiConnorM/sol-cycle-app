'use client'

import { useEffect } from 'react'
import { isNativeShell } from '@/lib/platform'
import { getStoredTheme, resolveTheme, watchSystemTheme } from '@/lib/theme'

/**
 * Native-shell startup: dismiss the launch splash and keep the status bar in
 * step with the app's theme. A no-op in the browser.
 *
 * The splash is configured with `launchAutoHide: false` in capacitor.config.ts
 * so it stays up until React has actually painted — otherwise it disappears on
 * a timer and the user sees a blank web view while the bundle boots. Something
 * therefore has to hide it, and that something is this component.
 *
 * The status bar overlays the web view, so its *background* is just the app's
 * own background showing through. Only the text colour needs setting, and it
 * has to be re-set whenever the theme changes or the light text ends up on a
 * light background.
 */
export function NativeShell() {
  useEffect(() => {
    if (!isNativeShell()) return

    let cancelled = false
    let unwatch = () => {}

    ;(async () => {
      const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
        // Dynamic imports: these plugins only exist in the native build, and
        // this keeps them out of the web bundle entirely.
        import('@capacitor/splash-screen'),
        import('@capacitor/status-bar'),
      ])
      if (cancelled) return

      // Style.Dark means light text (for a dark background), Style.Light means
      // dark text — named for the background they sit on, not the text colour.
      const applyStatusBar = async () => {
        const resolved = resolveTheme(getStoredTheme())
        try {
          await StatusBar.setStyle({
            style: resolved === 'dark' ? Style.Dark : Style.Light,
          })
        } catch {
          // Not fatal — a mis-tinted status bar shouldn't block the app.
        }
      }

      try {
        await StatusBar.setOverlaysWebView({ overlay: true })
      } catch {
        /* older iOS versions may refuse; the layout still works */
      }
      await applyStatusBar()

      // Follow OS appearance changes while the preference is 'system'.
      unwatch = watchSystemTheme(getStoredTheme)
      const query = window.matchMedia('(prefers-color-scheme: dark)')
      query.addEventListener('change', applyStatusBar)
      const stopStatusBarWatch = () => query.removeEventListener('change', applyStatusBar)

      await SplashScreen.hide()

      if (cancelled) {
        stopStatusBarWatch()
        return
      }
      const previous = unwatch
      unwatch = () => {
        previous()
        stopStatusBarWatch()
      }
    })().catch(() => {
      // Never let a plugin failure strand the user on the splash screen.
      import('@capacitor/splash-screen')
        .then(({ SplashScreen }) => SplashScreen.hide())
        .catch(() => {})
    })

    return () => {
      cancelled = true
      unwatch()
    }
  }, [])

  return null
}
