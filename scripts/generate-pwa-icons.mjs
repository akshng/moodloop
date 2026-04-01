import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const BRAND = '#6d5cbf';
const TEXT = '#ffffff';

function svgSquare(size, opts = { maskable: false }) {
  const pad = opts.maskable ? size * 0.12 : 0;
  const inner = size - pad * 2;
  const fontSize = Math.round(inner * 0.28);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND}" rx="${opts.maskable ? size * 0.2 : 0}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="${fontSize}" fill="${TEXT}">ML</text>
</svg>`;
}

async function main() {
  for (const size of [180, 192, 512]) {
    const buf = await sharp(Buffer.from(svgSquare(size))).png().toBuffer();
    const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    writeFileSync(join(publicDir, name), buf);
    console.log(`Wrote ${name}`);
  }
  const maskBuf = await sharp(Buffer.from(svgSquare(512, { maskable: true })))
    .png()
    .toBuffer();
  writeFileSync(join(publicDir, 'icon-512-maskable.png'), maskBuf);
  console.log('Wrote icon-512-maskable.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
