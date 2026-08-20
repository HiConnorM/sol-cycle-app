/**
 * Data export tests.
 *
 * The bug these exist to prevent: the original implementation used an anchor
 * with a `download` attribute, which is a no-op inside the iOS web view. It
 * produced no file and no error, so the failure was invisible — the user was
 * told nothing and assumed it had worked. Every path below therefore asserts
 * on the *outcome* the caller gets back, not just that nothing threw.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Both platform detection and the native plugins are mocked, so the two code
// paths can be exercised without a device.
const isNativeShell = vi.fn(() => false)
vi.mock('@/lib/platform', () => ({
  isNativeShell: () => isNativeShell(),
  getPlatform: () => (isNativeShell() ? 'ios' : 'web'),
}))

interface WriteFileOptions {
  path: string
  data: string
  directory: string
  encoding: string
}

const writeFile = vi.fn(async (_options: WriteFileOptions) => ({
  uri: 'file:///cache/sol-cycle-export-2026-08-20.json',
}))
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: (options: WriteFileOptions) => writeFile(options) },
  Directory: { Cache: 'CACHE', Documents: 'DOCUMENTS' },
  Encoding: { UTF8: 'utf8' },
}))

interface ShareOptions {
  title?: string
  text?: string
  url?: string
  dialogTitle?: string
}

const share = vi.fn(async (_options: ShareOptions) => ({
  activityType: 'com.apple.UIKit.activity.SaveToFiles',
}))
vi.mock('@capacitor/share', () => ({
  Share: { share: (options: ShareOptions) => share(options) },
}))

import {
  exportUserData,
  exportFilename,
  buildExportPayload,
  serializeExport,
  exportMessage,
} from '../export-data'

const NOW = new Date(2026, 7, 20, 14, 30) // 20 Aug 2026, local

const PARTS = {
  profile: { name: 'Sam' },
  preferences: { theme: 'dark' },
  cycleSettings: { cycleLength: 28 },
  logs: [{ date: '2026-08-18', flow: 'medium' }],
}

/** Minimal DOM so the browser path can run under the node environment. */
function installDom() {
  const clicked: HTMLAnchorElement[] = []
  const anchor = {
    href: '',
    download: '',
    click() {
      clicked.push(this as unknown as HTMLAnchorElement)
    },
    remove() {},
  }
  vi.stubGlobal('document', {
    createElement: () => anchor,
    body: { appendChild: () => {} },
  })
  vi.stubGlobal('URL', {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {},
  })
  vi.stubGlobal('Blob', class { constructor(public parts: unknown[]) {} })
  return { anchor, clicked }
}

beforeEach(() => {
  isNativeShell.mockReturnValue(false)
  writeFile.mockClear()
  share.mockClear()
  writeFile.mockResolvedValue({ uri: 'file:///cache/sol-cycle-export-2026-08-20.json' })
  share.mockResolvedValue({ activityType: 'saved' })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('filename', () => {
  it('is dated and sortable', () => {
    expect(exportFilename('2026-08-20')).toBe('sol-cycle-export-2026-08-20.json')
  })

  it('uses the local day, not UTC', async () => {
    // Late evening west of UTC is already tomorrow in UTC. The filename must
    // still say today, matching how every log inside the file is keyed —
    // otherwise an export made at 11pm is dated a day ahead of its contents.
    installDom()
    const lateEvening = new Date(2026, 7, 20, 23, 30)
    const outcome = await exportUserData(PARTS, lateEvening)
    expect(outcome.status).toBe('saved')
    expect(outcome.status === 'saved' && outcome.filename).toBe(
      'sol-cycle-export-2026-08-20.json'
    )
  })

  it('contains no characters that break a filesystem', () => {
    expect(exportFilename('2026-08-20')).not.toMatch(/[/\\:*?"<>|]/)
  })
})

describe('payload', () => {
  it('carries every section of the user’s data', () => {
    const payload = buildExportPayload(PARTS, NOW)
    expect(payload.profile).toEqual(PARTS.profile)
    expect(payload.preferences).toEqual(PARTS.preferences)
    expect(payload.cycleSettings).toEqual(PARTS.cycleSettings)
    expect(payload.logs).toEqual(PARTS.logs)
  })

  it('stamps the export time', () => {
    expect(buildExportPayload(PARTS, NOW).exportDate).toBe(NOW.toISOString())
  })

  it('serializes to readable, valid JSON', () => {
    const json = serializeExport(buildExportPayload(PARTS, NOW))
    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).toContain('\n') // pretty-printed, not one long line
    expect(JSON.parse(json).logs).toEqual(PARTS.logs)
  })

  it('round-trips without losing anything', () => {
    const payload = buildExportPayload(PARTS, NOW)
    expect(JSON.parse(serializeExport(payload))).toEqual(payload)
  })
})

describe('browser path', () => {
  it('saves via a download and reports success', async () => {
    const { clicked } = installDom()
    const outcome = await exportUserData(PARTS, NOW)
    expect(outcome).toEqual({ status: 'saved', filename: 'sol-cycle-export-2026-08-20.json' })
    expect(clicked).toHaveLength(1)
  })

  it('sets the download filename on the anchor', async () => {
    const { anchor } = installDom()
    await exportUserData(PARTS, NOW)
    expect(anchor.download).toBe('sol-cycle-export-2026-08-20.json')
  })

  it('never touches the native plugins', async () => {
    installDom()
    await exportUserData(PARTS, NOW)
    expect(writeFile).not.toHaveBeenCalled()
    expect(share).not.toHaveBeenCalled()
  })
})

describe('native path', () => {
  beforeEach(() => isNativeShell.mockReturnValue(true))

  it('writes a file and opens the share sheet', async () => {
    const outcome = await exportUserData(PARTS, NOW)
    expect(outcome).toEqual({ status: 'shared', filename: 'sol-cycle-export-2026-08-20.json' })
    expect(writeFile).toHaveBeenCalledOnce()
    expect(share).toHaveBeenCalledOnce()
  })

  it('writes the real JSON, not a placeholder', async () => {
    await exportUserData(PARTS, NOW)
    const written = writeFile.mock.calls[0][0]
    expect(JSON.parse(written.data).logs).toEqual(PARTS.logs)
    expect(written.path).toBe('sol-cycle-export-2026-08-20.json')
  })

  it('writes to the cache directory, not Documents', async () => {
    // Documents is user-visible and would leave a second copy of health data
    // sitting in the container; the file is only a hand-off.
    await exportUserData(PARTS, NOW)
    const written = writeFile.mock.calls[0][0]
    expect(written.directory).toBe('CACHE')
  })

  it('shares the URI the filesystem returned', async () => {
    await exportUserData(PARTS, NOW)
    const shared = share.mock.calls[0][0]
    expect(shared.url).toBe('file:///cache/sol-cycle-export-2026-08-20.json')
  })

  it('does not fall back to the anchor trick that silently failed', async () => {
    const { clicked } = installDom()
    await exportUserData(PARTS, NOW)
    expect(clicked).toHaveLength(0)
  })
})

describe('when things go wrong', () => {
  beforeEach(() => isNativeShell.mockReturnValue(true))

  it('treats a dismissed share sheet as a non-event', async () => {
    share.mockRejectedValueOnce(new Error('Share canceled'))
    expect(await exportUserData(PARTS, NOW)).toEqual({ status: 'cancelled' })
  })

  it('also recognises an abort as a dismissal', async () => {
    share.mockRejectedValueOnce(new Error('AbortError: the operation was aborted'))
    expect(await exportUserData(PARTS, NOW)).toEqual({ status: 'cancelled' })
  })

  it('reports a real write failure instead of failing silently', async () => {
    writeFile.mockRejectedValueOnce(new Error('No space left on device'))
    const outcome = await exportUserData(PARTS, NOW)
    expect(outcome.status).toBe('failed')
    expect(outcome.status === 'failed' && outcome.message).toContain('No space left')
  })

  it('never throws, so the caller always has something to show', async () => {
    writeFile.mockRejectedValueOnce('a string, not an Error')
    const outcome = await exportUserData(PARTS, NOW)
    expect(outcome.status).toBe('failed')
    expect(outcome.status === 'failed' && outcome.message.length).toBeGreaterThan(0)
  })
})

describe('messages shown to the user', () => {
  it('names the file on success so it can be found', () => {
    expect(exportMessage({ status: 'shared', filename: 'sol-cycle-export-2026-08-20.json' }))
      .toContain('sol-cycle-export-2026-08-20.json')
    expect(exportMessage({ status: 'saved', filename: 'sol-cycle-export-2026-08-20.json' }))
      .toContain('sol-cycle-export-2026-08-20.json')
  })

  it('passes the failure reason through', () => {
    expect(exportMessage({ status: 'failed', message: 'Disk full' })).toBe('Disk full')
  })

  it('says nothing when the user backed out', () => {
    expect(exportMessage({ status: 'cancelled' })).toBe('')
  })

  it('never blames the user for a failure', () => {
    const text = exportMessage({ status: 'failed', message: 'Could not export your data: x' })
    expect(text.toLowerCase()).not.toContain('you failed')
    expect(text.toLowerCase()).not.toContain('invalid')
  })
})
