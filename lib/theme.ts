/**
 * theme.ts — single source of truth for applying the colour theme.
 *
 * The user's choice lives in `sol-cycle-preferences.theme` alongside the rest
 * of the settings, which is why this doesn't use next-themes' own storage.
 *
 * Note: the pre-hydration snippet in app/layout.tsx duplicates the read-and-
 * apply logic in plain inline JS, because it has to run before any bundle
 * loads to avoid a flash of the wrong theme. Keep the two in step.
 */

export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'sol-cycle-preferences'

/** Background colours, kept in step with :root / .dark in app/globals.css. */
export const THEME_BACKGROUND = {
  light: '#F7F5F2',
  dark: '#1A1918',
} as const

export function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** The stored preference, defaulting to 'system' when absent or unreadable. */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return 'system'
    const theme = JSON.parse(raw)?.theme
    return theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'
  } catch {
    return 'system'
  }
}

/** Whether `theme` resolves to dark right now. */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return prefersDark() ? 'dark' : 'light'
  return theme
}

/**
 * Apply a theme to the document: toggles the `.dark` class the Tailwind
 * variant keys off, and keeps the browser/status-bar chrome colour in step.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(theme)

  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.style.colorScheme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_BACKGROUND[resolved])
}

/**
 * Re-apply on OS appearance changes while the preference is 'system'.
 * Returns an unsubscribe function.
 */
export function watchSystemTheme(getTheme: () => Theme): () => void {
  if (typeof window === 'undefined') return () => {}
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getTheme() === 'system') applyTheme('system')
  }
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}
