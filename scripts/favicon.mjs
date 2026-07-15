// Generate the site favicons + an ink-tinted logo variant from the real
// brand asset (public/brand/ab-logo.png - white "AB / INTERIOR DESIGN" on
// transparent). Run: node scripts/favicon.mjs
//
// Outputs:
//   public/favicon-32.png / favicon-512.png / apple-touch-icon.png
//     - the AB monogram (cropped, white) centered on an ink #141414 square,
//       so the icon reads on light AND dark browser tabs.
//   public/brand/ab-logo-ink.png
//     - the full lockup recolored to ink (for light backgrounds: footer etc.)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'public', 'brand', 'ab-logo.png');
const INK = { r: 20, g: 20, b: 20 }; // #141414

// --- ink variant: recolor every pixel to ink, keep the original alpha ------
{
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = INK.r;
    data[i + 1] = INK.g;
    data[i + 2] = INK.b;
  }
  await sharp(data, { raw: info }).png().toFile(path.join(root, 'public', 'brand', 'ab-logo-ink.png'));
}

// --- favicons: crop the AB monogram, center on an ink square ---------------
// The lockup is 1000x1000: monogram ~y60..760, "INTERIOR DESIGN" ~y780..870
// (too small to read at icon sizes - cropped out).
const monogram = await sharp(SRC)
  .extract({ left: 20, top: 50, width: 960, height: 720 })
  .toBuffer();

async function icon(size, out) {
  const inner = Math.round(size * 0.72);
  const mark = await sharp(monogram)
    .resize(inner, inner, { fit: 'inside' })
    .toBuffer();
  const meta = await sharp(mark).metadata();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { ...INK, alpha: 1 } },
  })
    .composite([
      {
        input: mark,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toFile(path.join(root, 'public', out));
}

await icon(32, 'favicon-32.png');
await icon(180, 'apple-touch-icon.png');
await icon(512, 'favicon-512.png');

for (const f of ['favicon-32.png', 'apple-touch-icon.png', 'favicon-512.png', 'brand/ab-logo-ink.png']) {
  const m = await sharp(path.join(root, 'public', f)).metadata();
  console.log(`${f}: ${m.width}x${m.height} ${m.format}`);
}
console.log('done');
