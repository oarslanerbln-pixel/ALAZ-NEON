#!/usr/bin/env node
/**
 * Copies tesseract.js's worker/core scripts and the Turkish traineddata from
 * node_modules into public/, so OCR (Rapor Tara) can run without hitting a
 * CDN at scan time — required for the PWA's offline goal, since the
 * default `createWorker()` fetches these from cdn.jsdelivr.net otherwise
 * (see .Jules/palette.md, 2026-07-22 entry).
 *
 * These are build artifacts, not source: the public/tesseract-* directories
 * are gitignored.
 * Runs automatically via `postinstall` (see package.json); re-run manually
 * with `pnpm vendor:ocr` after bumping the tesseract.js/-core/-data versions.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const nodeModules = path.join(root, 'node_modules');

function copy(src, destDir) {
  if (!existsSync(src)) {
    console.warn(`vendor-ocr-assets: kaynak bulunamadı, atlanıyor: ${src}`);
    return;
  }
  mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(src));
  copyFileSync(src, dest);
  console.log(`vendored ${path.relative(root, dest)}`);
}

// tesseract.js'in kendi worker script'i (createWorker'ın workerPath'i).
copy(
  path.join(nodeModules, 'tesseract.js', 'dist', 'worker.min.js'),
  path.join(root, 'public', 'tesseract')
);

// OCR motoru (WASM). Hangi varyantın kullanılacağına tarayıcı SIMD desteğine
// göre çalışma zamanında tesseract.js karar veriyor (bkz. corePath'in bir
// dizin olarak verilmesi) — üç varyantı da barındırıyoruz, kullanıcının
// tarayıcısı yalnızca kendine uyanı indirir. LSTM-only varyantlar yeterli
// çünkü UploadDocument.tsx OEM.LSTM_ONLY (1) ile çalışıyor.
const coreDir = path.join(nodeModules, 'tesseract.js-core');
for (const file of [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm.js',
]) {
  copy(path.join(coreDir, file), path.join(root, 'public', 'tesseract-core'));
}

// Türkçe eğitilmiş dil verisi (LSTM/"best_int" varyantı — küçük ve LSTM-only
// kullanım için yeterli doğrulukta).
copy(
  path.join(nodeModules, '@tesseract.js-data', 'tur', '4.0.0_best_int', 'tur.traineddata.gz'),
  path.join(root, 'public', 'tesseract-lang')
);
