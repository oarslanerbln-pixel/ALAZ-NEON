#!/usr/bin/env node
/**
 * Generates MediSade's PWA icon set as raw PNG files, using only Node's built-in
 * `zlib` module (no image library / native binary dependency — none was available in
 * the environment this was first written in: no ImageMagick, no `sharp`, no rsvg-convert).
 *
 * Design: a minimalist medicine capsule tilted 45°, with a small ascending trend line
 * (two segments + dot markers) beside it — a simplified nod to "medication + health
 * data trending in the right direction". White symbol on a turquoise background (brand
 * colors: turquoise #14B8A6 background, white #FFFFFF symbol).
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

const TURQUOISE = [0x14, 0xb8, 0xa6, 0xff];
const WHITE = [0xff, 0xff, 0xff, 0xff];

function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

/**
 * Draws a tilted capsule (stadium shape) with a small ascending trend line (two
 * segments + dot markers at each vertex) sitting above its upper-right end.
 * @param {number} size canvas size in px (square)
 * @param {[number,number,number,number]} bg
 * @param {[number,number,number,number]} fg
 * @param {number} scale fraction of `size` the whole symbol is allowed to occupy (smaller = more padding, needed for maskable icons)
 */
function drawCapsuleTrend(size, bg, fg, scale) {
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
  const capCx = cx - unit * 0.13;
  const capCy = cy + unit * 0.15;
  const capHalfLen = unit * 0.4;
  const capHalfWidth = unit * 0.145;
  const capStraight = capHalfLen - capHalfWidth; // half-length of the straight section

  // Trend line: two ascending segments with dot markers, kept visually separate
  // from the capsule (a clear gap) so the two elements don't read as one fused shape.
  const lineHalfWidth = unit * 0.045;
  const dotRadius = unit * 0.055;
  const p0x = cx + unit * 0.1;
  const p0y = cy - unit * 0.16;
  const p1x = cx + unit * 0.28;
  const p1y = cy - unit * 0.32;
  const p2x = cx + unit * 0.44;
  const p2y = cy - unit * 0.48;

  const setPixel = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    pixels.set(fg, (y * size + x) * 4);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - capCx;
      const dy = y - capCy;
      const lx = dx * cosT + dy * sinT;
      const ly = -dx * sinT + dy * cosT;

      let inCapsule;
      if (Math.abs(lx) <= capStraight) {
        inCapsule = Math.abs(ly) <= capHalfWidth;
      } else {
        const capCenterX = lx > 0 ? capStraight : -capStraight;
        inCapsule = dist(lx, ly, capCenterX, 0) <= capHalfWidth;
      }

      const inLine =
        distToSegment(x, y, p0x, p0y, p1x, p1y) <= lineHalfWidth ||
        distToSegment(x, y, p1x, p1y, p2x, p2y) <= lineHalfWidth;

      const inDot =
        dist(x, y, p0x, p0y) <= dotRadius ||
        dist(x, y, p1x, p1y) <= dotRadius ||
        dist(x, y, p2x, p2y) <= dotRadius;

      if (inCapsule || inLine || inDot) setPixel(x, y);
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
  const pixels = drawCapsuleTrend(size, TURQUOISE, WHITE, scale);
  const png = encodePng(pixels, size);
  writeFileSync(path.join(publicDir, filename), png);
  console.log(`wrote ${filename} (${size}x${size})`);
}

// Standard icons: symbol can use most of the canvas.
writeIcon('icon-192.png', 192, 0.7);
writeIcon('icon-512.png', 512, 0.7);
// Maskable icon: OS may crop to a circle/rounded-square, so keep content inside
// the ~80% "safe zone" centered on the canvas.
writeIcon('icon-512-maskable.png', 512, 0.48);
// Apple touch icon: iOS rounds the corners itself, no extra safe-zone needed beyond
// a little breathing room.
writeIcon('apple-touch-icon.png', 180, 0.68);
