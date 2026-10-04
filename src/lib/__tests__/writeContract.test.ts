import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import * as clientWrites from "../clientWrites";

/**
 * Yazma sözleşmesi (docs/roadmap.md, 1.4).
 *
 * Kurallara tabi her yazmanın verisi src/lib/clientWrites.ts'ten gelir ve
 * oradaki her fonksiyon emulator kural testinde kullanılır. Böylece "testte
 * geçiyor, canlıda reddediliyor" kalıbı (answers, overload, echo, çark,
 * unity, emoji…) CI'da yakalanıyor: testi olmayan bir yazma yolu eklenemez.
 */

const SRC = "src";
const RULES_TEST = join("test", "firestore.rules.test.ts");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "__tests__" ? [] : walk(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

/**
 * Sözleşmenin kapsadığı dosyalar: oyuncu telefonunda çalışan her şey ve
 * kuralın alan kısıtı koyduğu host/personel yazmaları.
 */
const SCOPED_FILES = [
  ...walk(join(SRC, "pages", "player")),
  join(SRC, "hooks", "useHeartbeat.ts"),
  join(SRC, "hooks", "useEmojiPulse.ts"),
  join(SRC, "hooks", "useUserProfile.ts"),
  join(SRC, "hooks", "useLifetimeScoreSync.ts"),
  join(SRC, "pages", "host", "HostSetup.tsx"),
  join(SRC, "pages", "admin", "RewardVerify.tsx"),
  join(SRC, "lib", "rewards.ts"),
];

const WRITE_CALL = /\b(?:updateDoc|setDoc|addDoc)\s*\(|\b(?:batch|transaction|tx|\w+Batch)\.(?:update|set)\s*\(/g;

/**
 * Bir yazma çağrısının veri argümanı satır içi bir nesne mi (`{ ... }`).
 * Çağrının ilk üst düzey virgülünü parantez/köşeli/süslü parantez ve
 * dizeleri sayarak buluyor; ikinci argüman `{` ile başlıyorsa ihlal.
 */
export function inlinePayloadCalls(source: string): string[] {
  const offenders: string[] = [];
  for (const match of source.matchAll(WRITE_CALL)) {
    let i = (match.index ?? 0) + match[0].length;
    let depth = 0;
    let quote: string | null = null;
    for (; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if ("([{".includes(ch)) depth++;
      else if (")]}".includes(ch)) {
        if (depth === 0) break; // tek argümanlı çağrı
        depth--;
      } else if (ch === "," && depth === 0) {
        const rest = source.slice(i + 1).trimStart();
        if (rest.startsWith("{")) {
          const line = source.slice(0, match.index).split("\n").length;
          offenders.push(`${line}: ${match[0]}`);
        }
        break;
      }
    }
  }
  return offenders;
}

describe("yazma sözleşmesi", () => {
  it("dedektör satır içi veriyi yakalıyor (test boşa dönmüyor)", () => {
    const sample = [
      'await updateDoc(doc(db, "rooms", room.id), { status: "wheel_spinning" });',
      "batch.update(ref, payload);",
      'transaction.update(roomRef, {\n  status: "x",\n});',
      'await setDoc(doc(db, "a", "b"), fooPayload("c"));',
    ].join("\n");
    expect(inlinePayloadCalls(sample)).toEqual(["1: updateDoc(", "3: transaction.update("]);
  });

  it("kapsamdaki dosyalar yazma verisini clientWrites'tan alıyor", () => {
    const offenders = SCOPED_FILES.flatMap((file) =>
      inlinePayloadCalls(readFileSync(file, "utf8")).map((hit) => `${file}:${hit}`),
    );
    expect(offenders).toEqual([]);
  });

  it("clientWrites'taki her yazma emulator kural testinde kullanılıyor", () => {
    const rulesTest = readFileSync(RULES_TEST, "utf8");
    const builders = Object.entries(clientWrites)
      .filter(([name, value]) => typeof value === "function" && name.endsWith("Payload"))
      .map(([name]) => name);
    expect(builders.length).toBeGreaterThan(0);
    const untested = builders.filter((name) => !new RegExp(`\\b${name}\\(`).test(rulesTest));
    expect(untested).toEqual([]);
  });
});
