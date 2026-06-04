// Rasterizes build/icon.svg into the PNG sizes, a multi-size Windows .ico, and
// the runtime tray/window assets. Run with `npm run icons` whenever icon.svg
// changes. The generated files are committed so a normal build needs no image
// toolchain.
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'build', 'icon.svg'))

const buildIcons = join(root, 'build', 'icons')
const assets = join(root, 'electron', 'assets')
mkdirSync(buildIcons, { recursive: true })
mkdirSync(assets, { recursive: true })

// Render the SVG once at high resolution, then downscale crisply from that.
const base = await sharp(svg, { density: 512 })
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
const png = {}
for (const s of sizes) {
  png[s] = await sharp(base).resize(s, s).png({ compressionLevel: 9 }).toBuffer()
  writeFileSync(join(buildIcons, `${s}.png`), png[s])
}

// electron-builder source icon (>=512 recommended).
writeFileSync(join(root, 'build', 'icon.png'), png[512])

// Multi-resolution Windows .ico for the installer and window/taskbar icon.
const ico = await pngToIco([png[16], png[24], png[32], png[48], png[64], png[128], png[256]])
writeFileSync(join(root, 'build', 'icon.ico'), ico)

// Runtime assets packaged with the app (electron/** is in the build files glob).
writeFileSync(join(assets, 'icon.ico'), ico)
writeFileSync(join(assets, 'icon.png'), png[256])
writeFileSync(join(assets, 'tray.png'), png[32])
writeFileSync(join(assets, 'tray@2x.png'), png[64])

console.log('Generated icons:', sizes.join(', '), '+ icon.ico (16-256) + tray')
