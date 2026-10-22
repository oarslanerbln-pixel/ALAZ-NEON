import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Testlerin ürettiği ölçümler e2e-results/metrics.json'a birikir
 * (docs/audit-2026-10.md'deki tablolar buradan doldu).
 */
const FILE = "e2e-results/metrics.json";

export function recordMetric(name: string, value: unknown): void {
  let all: Record<string, unknown> = {};
  try {
    all = JSON.parse(readFileSync(FILE, "utf8")) as Record<string, unknown>;
  } catch {
    /* ilk kayıt */
  }
  all[name] = value;
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(all, null, 2));
}

export function summarize(xs: number[]): { n: number; min: number; p50: number; p95: number; max: number } {
  const s = [...xs].sort((a, b) => a - b);
  const at = (q: number) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
  return { n: s.length, min: s[0], p50: at(0.5), p95: at(0.95), max: s[s.length - 1] };
}

/** E2E_DEBUG=1 iken adım adım ilerleme (takılan adımı bulmak için). */
export function trace(msg: string): void {
  if (process.env.E2E_DEBUG) console.log(`[e2e ${new Date().toISOString().slice(11, 23)}] ${msg}`);
}
