/**
 * support.ts
 *
 * The one place the support address lives. It appears in the privacy policy,
 * the terms, and the Help menu, and App Review checks that the contact route
 * actually works — so it must not drift between them.
 */

/** Monitored mailbox for support, privacy requests, and bug reports. */
export const CONTACT_EMAIL = 'privacy@solcycle.app'

/** Shown in the menu footer and included in bug reports. */
export const APP_VERSION = '1.0'

/**
 * Build a `mailto:` link with a prefilled subject and body.
 *
 * Everything is encoded — an unencoded newline or ampersand silently truncates
 * the message in some mail clients.
 */
export function mailtoLink(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject })
  if (body) params.set('body', body)
  // URLSearchParams encodes spaces as '+', which mail clients render literally.
  return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`
}

/**
 * A bug report opens with the details we would otherwise have to ask for.
 *
 * Deliberately no cycle data, no symptoms, no dates — only the app version and
 * the device string the browser already exposes. A support email should never
 * be a side channel for health data.
 */
export function bugReportLink(): string {
  const platform =
    typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : 'unknown'

  return mailtoLink(
    'Sol Cycle — bug report',
    [
      'What happened:',
      '',
      'What you expected instead:',
      '',
      'Steps to reproduce:',
      '1. ',
      '',
      '---',
      `App version: ${APP_VERSION}`,
      `Device: ${platform}`,
    ].join('\n')
  )
}

export function supportLink(): string {
  return mailtoLink('Sol Cycle — support')
}

export function featureRequestLink(): string {
  return mailtoLink(
    'Sol Cycle — feature request',
    ['What you would like to see:', '', 'Why it would help:', ''].join('\n')
  )
}
