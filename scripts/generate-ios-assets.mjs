/**
 * Generate the iOS app icon and splash screen from the web icon assets.
 *
 * Run with: pnpm ios:assets
 *
 * Two iOS rules drive what this does:
 *   • App Store Connect rejects app icons that carry an alpha channel, so the
 *     mark is flattened onto the brand background rather than left transparent.
 *   • The icon must be supplied at 1024x1024. The largest source in public/ is
 *     512x512, so it is upscaled 2x with lanczos3 — fine for flat vector-style
 *     wedges, though a native 1024 export from the original design file would
 *     be better if one exists.
 */
import { createRequire } from 'node:module'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const ROOT = process.cwd()
const SOURCE_ICON = path.join(ROOT, 'public/icon-512.png')
const ICON_DIR = path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset')
const SPLASH_DIR = path.join(ROOT, 'ios/App/App/Assets.xcassets/Splash.imageset')

/** --background in app/globals.css. */
const LIGHT_BG = { r: 0xf7, g: 0xf5, b: 0xf2, alpha: 1 }
/** --background in the .dark block. */
const DARK_BG = { r: 0x1a, g: 0x19, b: 0x18, alpha: 1 }

async function writeAppIcon() {
  const size = 1024
  // The wheel sits in a slightly inset square so it doesn't crowd the corner
  // radius iOS applies to every home-screen icon.
  const markSize = Math.round(size * 0.78)

  const mark = await sharp(SOURCE_ICON)
    .resize(markSize, markSize, { kernel: sharp.kernel.lanczos3 })
    .toBuffer()

  const icon = await sharp({
    create: { width: size, height: size, channels: 4, background: LIGHT_BG },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    // flatten() fills transparent pixels but keeps the channel; removeAlpha()
    // is what actually drops it, and App Store Connect rejects an icon that
    // still carries one.
    .flatten({ background: LIGHT_BG })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer()

  await mkdir(ICON_DIR, { recursive: true })
  await writeFile(path.join(ICON_DIR, 'AppIcon-512@2x.png'), icon)

  await writeFile(
    path.join(ICON_DIR, 'Contents.json'),
    JSON.stringify(
      {
        images: [
          {
            filename: 'AppIcon-512@2x.png',
            idiom: 'universal',
            platform: 'ios',
            size: '1024x1024',
          },
        ],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2
    ) + '\n'
  )

  const { channels, hasAlpha, width, height } = await sharp(icon).metadata()
  if (hasAlpha || width !== size || height !== size) {
    throw new Error(
      `App icon must be ${size}x${size} with no alpha channel; got ${width}x${height}, hasAlpha=${hasAlpha}`
    )
  }
  console.log(`app icon:  ${width}x${height}, channels=${channels}, hasAlpha=${hasAlpha}`)
}

async function writeSplash() {
  // Capacitor centres a single square image and crops it to the screen, so the
  // canvas is square and generously sized for the largest device.
  const size = 2732
  const markSize = Math.round(size * 0.22)

  const mark = await sharp(SOURCE_ICON)
    .resize(markSize, markSize, { kernel: sharp.kernel.lanczos3 })
    .toBuffer()

  async function build(background) {
    return sharp({
      create: { width: size, height: size, channels: 4, background },
    })
      .composite([{ input: mark, gravity: 'centre' }])
      .flatten({ background })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer()
  }

  const light = await build(LIGHT_BG)
  const dark = await build(DARK_BG)

  await mkdir(SPLASH_DIR, { recursive: true })
  await writeFile(path.join(SPLASH_DIR, 'splash-light.png'), light)
  await writeFile(path.join(SPLASH_DIR, 'splash-dark.png'), dark)

  // Capacitor's stock imageset names three files that look like appearance
  // variants but are actually 1x/2x/3x scale slots — putting a dark image in
  // one of them shows a dark splash to light-mode users on those devices.
  // These are single-scale universal entries instead, keyed on luminosity, so
  // the appearance is what actually selects the image.
  await writeFile(
    path.join(SPLASH_DIR, 'Contents.json'),
    JSON.stringify(
      {
        images: [
          { idiom: 'universal', filename: 'splash-light.png' },
          {
            idiom: 'universal',
            filename: 'splash-dark.png',
            appearances: [{ appearance: 'luminosity', value: 'dark' }],
          },
        ],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2
    ) + '\n'
  )

  // Remove the stock files so actool doesn't warn about unreferenced assets.
  for (const stale of [
    'splash-2732x2732.png',
    'splash-2732x2732-1.png',
    'splash-2732x2732-2.png',
  ]) {
    await rm(path.join(SPLASH_DIR, stale), { force: true })
  }

  console.log(`splash:    ${size}x${size} (light + dark, appearance-keyed)`)
}

await writeAppIcon()
await writeSplash()
console.log('iOS assets written. Run `npx cap sync ios` to pick them up.')
