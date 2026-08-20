/**
 * export-data.ts
 *
 * Data export, which has to work differently in the two places this bundle
 * runs.
 *
 * In a browser, an anchor with a `download` attribute and a synthetic click
 * saves a file. Inside the iOS web view it does nothing at all — no file, no
 * error, no feedback — so the original implementation left users believing
 * they had exported their data when nothing had happened. On native we write
 * the file to the app's cache directory and hand it to the iOS share sheet
 * instead, which is the only route that actually produces a file the user
 * can keep.
 *
 * This is also the app's data-portability mechanism under GDPR and CCPA — the
 * privacy policy names it as the way to obtain your data — so it silently
 * failing was a compliance problem as much as a bug.
 */

import { isNativeShell } from '@/lib/platform'
import { toDateKey } from '@/lib/utils/date-keys'

/** Everything the export contains. Shape is the file format — change with care. */
export interface ExportPayload {
  profile: unknown
  preferences: unknown
  cycleSettings: unknown
  logs: unknown
  exportDate: string
}

export type ExportOutcome =
  | { status: 'saved'; filename: string }
  | { status: 'shared'; filename: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string }

/** Deterministic, sortable, and safe as a filename on every platform. */
export function exportFilename(today: string = toDateKey(new Date())): string {
  return `sol-cycle-export-${today}.json`
}

export function buildExportPayload(
  parts: Omit<ExportPayload, 'exportDate'>,
  now: Date = new Date()
): ExportPayload {
  return { ...parts, exportDate: now.toISOString() }
}

/** Pretty-printed so a user opening the file can actually read it. */
export function serializeExport(payload: ExportPayload): string {
  return JSON.stringify(payload, null, 2)
}

/**
 * Browser path: a blob URL and a synthetic click. Works in a real browser and
 * an installed PWA.
 */
async function saveViaDownload(json: string, filename: string): Promise<ExportOutcome> {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    // Firefox needs the anchor in the document before a click registers.
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    return { status: 'saved', filename }
  } finally {
    // Revoking synchronously can cancel the download in some browsers; a tick
    // is enough for the click to have been handled.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

/**
 * Native path: write into the cache directory, then present the share sheet
 * so the user can save to Files, mail it to themselves, or send it on.
 *
 * Cache rather than Documents deliberately — the file is a hand-off, not
 * something the app should retain a second copy of. iOS reclaims it later.
 */
async function saveViaShareSheet(json: string, filename: string): Promise<ExportOutcome> {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])

  const written = await Filesystem.writeFile({
    path: filename,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  })

  try {
    await Share.share({
      title: 'Sol Cycle export',
      // No `text`: on some targets it is appended as a message body, and this
      // file is the whole point of the share.
      url: written.uri,
      dialogTitle: 'Save or send your Sol Cycle data',
    })
    return { status: 'shared', filename }
  } catch (error) {
    // Dismissing the share sheet is a normal choice, not a failure worth
    // reporting. Capacitor surfaces it as a plain Error with this message.
    if (isShareDismissal(error)) return { status: 'cancelled' }
    throw error
  }
}

function isShareDismissal(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /cancel/i.test(message) || /abort/i.test(message)
}

/**
 * Export the user's data, choosing the mechanism the current platform can
 * actually complete. Never throws — the caller gets an outcome to show.
 */
export async function exportUserData(
  parts: Omit<ExportPayload, 'exportDate'>,
  now: Date = new Date()
): Promise<ExportOutcome> {
  const filename = exportFilename(toDateKey(now))
  const json = serializeExport(buildExportPayload(parts, now))

  try {
    return isNativeShell()
      ? await saveViaShareSheet(json, filename)
      : await saveViaDownload(json, filename)
  } catch (error) {
    return {
      status: 'failed',
      message:
        error instanceof Error && error.message
          ? `Could not export your data: ${error.message}`
          : 'Could not export your data. Please try again.',
    }
  }
}

/** What to tell the user after an export attempt. */
export function exportMessage(outcome: ExportOutcome): string {
  switch (outcome.status) {
    case 'shared':
      return `${outcome.filename} is ready — choose where to keep it.`
    case 'saved':
      return `Saved ${outcome.filename} to your downloads.`
    case 'failed':
      return outcome.message
    case 'cancelled':
      return ''
  }
}
