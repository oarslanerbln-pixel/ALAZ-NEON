// node --test scripts/rules-drift.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchLiveRules, firstDifference, normalizeRules } from "./rules-drift.mjs";

test("satır sonu ve sondaki boşluk farkı kayma sayılmaz", () => {
  assert.equal(normalizeRules("a  \r\nb\r\n\r\n"), "a\nb\n");
  assert.equal(firstDifference("rules {\r\n  allow read;  \r\n}\n", "rules {\n  allow read;\n}"), null);
});

test("ilk farklı satırı iki tarafıyla verir", () => {
  const diff = firstDifference("a\nallow write: if true;\nc", "a\nallow write: if false;\nc");
  assert.deepEqual(diff, { line: 2, live: "allow write: if true;", repo: "allow write: if false;" });
});

test("bir taraf kısaysa eksik satırı gösterir", () => {
  assert.deepEqual(firstDifference("a\n", "a\nb\n"), { line: 2, live: "(dosya bitti)", repo: "b" });
});

test("yayındaki kural setini iki istekte okur", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push([url, init.headers.Authorization]);
    const body = url.endsWith("/releases/cloud.firestore")
      ? { rulesetName: "projects/p/rulesets/abc", updateTime: "2026-10-22T10:00:00Z" }
      : { source: { files: [{ name: "firestore.rules", content: "rules_version = '2';" }] } };
    return new Response(JSON.stringify(body), { status: 200 });
  };
  const live = await fetchLiveRules({ projectId: "p", token: "t", fetchImpl });
  assert.equal(live.content, "rules_version = '2';");
  assert.equal(live.rulesetName, "projects/p/rulesets/abc");
  assert.deepEqual(calls, [
    ["https://firebaserules.googleapis.com/v1/projects/p/releases/cloud.firestore", "Bearer t"],
    ["https://firebaserules.googleapis.com/v1/projects/p/rulesets/abc", "Bearer t"],
  ]);
});

test("API hatası açık mesajla düşer", async () => {
  const fetchImpl = async () => new Response("PERMISSION_DENIED", { status: 403 });
  await assert.rejects(fetchLiveRules({ projectId: "p", token: "t", fetchImpl }), /HTTP 403 PERMISSION_DENIED/);
});
