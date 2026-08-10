#!/usr/bin/env node
/**
 * Draws the site icon and writes it to public/ as PNG.
 *
 * There is no image library here and nothing on the Mac converts SVG to PNG,
 * so this encodes the PNG by hand — which is fine, because the icon is three
 * rectangles: the blue field, the white text box, and the two buttons under
 * it. It is the /draft screen, shrunk.
 *
 * Re-run it after changing the shape or the colours:
 *
 *   node scripts/make-icon.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/', import.meta.url));

const BLUE = [0x45, 0x53, 0x9b];
const WHITE = [0xff, 0xff, 0xff];
const BLACK = [0x00, 0x00, 0x00];

/** Fractions of the icon's width, so one drawing serves every size. */
const BOX = { x0: 0.15, x1: 0.85, y0: 0.17, y1: 0.62 };
const BAR = { y0: 0.69, y1: 0.83, gap: 0.03 };
const STROKE = 0.028;

/**
 * The colour of one pixel. Everything is axis-aligned rectangles, so this is
 * just a handful of range tests rather than any kind of rasteriser.
 *
 * Below 64px the buttons collapse into two grey smudges, so small sizes get
 * the box alone and it stays legible in a browser tab.
 */
function pixel(x, y, size) {
  const u = x / size;
  const v = y / size;
  const s = STROKE;
  const detailed = size >= 64;

  // The text box, and its black rule.
  const inBox = u >= BOX.x0 && u <= BOX.x1 && v >= BOX.y0 && v <= BOX.y1;
  if (inBox) {
    const edge =
      u < BOX.x0 + s || u > BOX.x1 - s || v < BOX.y0 + s || v > BOX.y1 - s;
    return edge ? BLACK : WHITE;
  }

  if (!detailed) return BLUE;

  // Save on the left, Publish on the right — the one that carries weight is
  // the filled one, the same way it is on the page.
  const mid = (BOX.x0 + BOX.x1) / 2;
  const inBarRow = v >= BAR.y0 && v <= BAR.y1;
  if (inBarRow) {
    const left = u >= BOX.x0 && u <= mid - BAR.gap / 2;
    const right = u >= mid + BAR.gap / 2 && u <= BOX.x1;
    if (right) return BLACK;
    if (left) {
      const edge =
        u < BOX.x0 + s ||
        u > mid - BAR.gap / 2 - s ||
        v < BAR.y0 + s ||
        v > BAR.y1 - s;
      return edge ? BLACK : WHITE;
    }
  }

  return BLUE;
}

/** CRC-32, which every PNG chunk has to carry. */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size) {
  // Each scanline is prefixed with a filter byte; 0 means "store as-is",
  // which costs a little size and saves writing four filter heuristics.
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let i = 0;
  for (let y = 0; y < size; y++) {
    raw[i++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      raw[i++] = r;
      raw[i++] = g;
      raw[i++] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  // bytes 10–12 are compression, filter and interlace methods, all 0.

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const FILES = [
  ['favicon-32.png', 32],
  ['favicon-192.png', 192],
  // 180 is the size iOS asks for; anything else gets resampled.
  ['apple-touch-icon.png', 180],
  ['icon-512.png', 512],
];

await mkdir(OUT, { recursive: true });
for (const [name, size] of FILES) {
  const buf = png(size);
  await writeFile(OUT + name, buf);
  console.log(`  + ${name}  ${size}×${size}  ${(buf.length / 1024).toFixed(1)} KB`);
}
