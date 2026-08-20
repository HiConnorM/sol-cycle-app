'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Honour the OS "Reduce Motion" setting for every framer-motion animation in
 * the app.
 *
 * The CSS media query in globals.css only reaches CSS transitions and
 * keyframes; framer-motion drives its animations from JavaScript and ignores
 * it. `reducedMotion="user"` makes motion components skip straight to their
 * target values — transforms and opacity fades are dropped, while layout and
 * colour changes still apply — which is what iOS users who enable Reduce
 * Motion expect from a native app.
 */
export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
