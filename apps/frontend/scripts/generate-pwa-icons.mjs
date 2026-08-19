#!/usr/bin/env node
/**
 * Generates Netçe's PWA icon set as raw PNG files, using only Node's built-in
 * `zlib` module (no image library / native binary dependency — none was available in
 * the environment this was first written in: no ImageMagick, no `sharp`, no rsvg-convert).
 *
 * Design: a single minimalist medicine capsule, tilted 45°, with a thin center
 * divider line (the standard two-tone-capsule visual cue) cut out of it — no other
 * elements, no symbolic/cultural iconography. White symbol on a navy background
 * (brand colors: navy #0A1F44 background, white #FFFFFF symbol).
 *
 * Re-run with `node scripts/generate-pwa-icons.mjs` from `apps/frontend/` any time the
 * icon design needs to change; it overwrites the PNGs under `public/`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const NAVY = [0x0a, 0x1f, 0x44, 0xff];
const WHITE = [0xff, 0xff, 0xff, 0xff];

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * Draws a single tilted capsule (stadium shape) with a thin center divider line
 * cut across its middle, perpendicular to its long axis.
 * @param {number} size canvas size in px (square)
 * @param {[number,number,number,number]} bg
 * @param {[number,number,number,number]} fg
 * @param {number} scale fraction of `size` the capsule is allowed to occupy (smaller = more padding, needed for maskable icons)
 */
function drawCapsule(size, bg, fg, scale) {
  const pixels = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) pixels.set(bg, i * 4);

  const cx = size / 2;
  const cy = size / 2;
  const unit = size * scale;

  // Capsule: a stadium shape (rectangle + two semicircular caps), tilted 45° so it
  // reads as a classic medicine capsule (bottom-left to top-right).
  const theta = Math.PI / 4;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const capHalfLen = unit * 0.48;
  const capHalfWidth = unit * 0.19;
  const capStraight = capHalfLen - capHalfWidth; // half-length of the straight section

  // Thin divider line across the middle, perpendicular to the long axis — the
  // familiar two-tone-capsule cue, purely graphic.
  const dividerHalfThickness = unit * 0.025;

  const setPixel = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    pixels.set(fg, (y * size + x) * 4);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const lx = dx * cosT + dy * sinT;
      const ly = -dx * sinT + dy * cosT;

      let inCapsule;
      if (Math.abs(lx) <= capStraight) {
        inCapsule = Math.abs(ly) <= capHalfWidth;
      } else {
        const capCenterX = lx > 0 ? capStraight : -capStraight;
        inCapsule = dist(lx, ly, capCenterX, 0) <= capHalfWidth;
      }

      const inDivider = Math.abs(lx) <= dividerHalfThickness;

      if (inCapsule && !inDivider) setPixel(x, y);
    }
  }

  return pixels;
}

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(pixels, size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Each scanline prefixed with a filter-type byte (0 = none).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    raw.set(pixels.subarray(y * size * 4, (y + 1) * size * 4), rowStart + 1);
  }

  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function writeIcon(filename, size, scale) {
  const pixels = drawCapsule(size, NAVY, WHITE, scale);
  const png = encodePng(pixels, size);
  writeFileSync(path.join(publicDir, filename), png);
  console.log(`wrote ${filename} (${size}x${size})`);
}

// Standard icons: symbol can use most of the canvas.
writeIcon('icon-192.png', 192, 0.72);
writeIcon('icon-512.png', 512, 0.72);
// Maskable icon: OS may crop to a circle/rounded-square, so keep content inside
// the ~80% "safe zone" centered on the canvas.
writeIcon('icon-512-maskable.png', 512, 0.5);
// Apple touch icon: iOS rounds the corners itself, no extra safe-zone needed beyond
// a little breathing room.
writeIcon('apple-touch-icon.png', 180, 0.7);
