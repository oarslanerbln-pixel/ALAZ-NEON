#!/usr/bin/env node
/**
 * Çok mekan yönetim ve göç betiği (docs/design/3.1-cok-mekan.md, §6).
 * Mekan açmak, sahip atamak ve tek mekandan çok mekana geçiş istemciden
 * yapılamaz (kurallar yalnızca HENGAME ekibine açık); bu betik Admin SDK
 * ile kuralları atlayarak yapar.
 *
 * Varsayılan KURU ÇALIŞMA: ne yazılacağını listeler, yazmaz. Yazmak için
 * `--apply`. Önce emulator'de dene:
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/venue-admin.mjs migrate --project demo-hengame
 *
 * Yayında servis hesabı ortam değişkeninden okunur
 * (`FIREBASE_SERVICE_ACCOUNT_JSON`, dosya içeriği). Anahtar repoya, komut
 * satırına ve sohbete girmez; betik onu hiçbir yerde yazdırmaz.
 *
 * Komutlar:
 *   create-venue <id> --name "Ad" [--from-legacy]   mekan belgesi (marka eski tek belgeden kopyalanabilir)
 *   add-owner <id> <uid>                            mekana sahip atar
 *   add-platform-admin <uid>                        HENGAME ekibine hesap ekler
 *   migrate [--owner <uid>]                         aşama A: venues/default + global personeli kopyala
 *   backfill                                        aşama B: mekansız kayıtlara venue_id: "default"
 */
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_VENUE_ID = "default";
const VENUE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,39}$/;
const BACKFILL_COLLECTIONS = ["rooms", "rewards", "events", "ad_impressions"];
const BATCH_LIMIT = 400;
const ACTOR = "platform-script";

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return { command: positional[0], args: positional.slice(1), flags };
}

function fail(message) {
  console.error(`hata: ${message}`);
  process.exit(1);
}

function connect(flags) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId = flags.project || process.env.GCLOUD_PROJECT;
    if (!projectId) fail("emulator için --project gerekli");
    initializeApp({ projectId });
    return { db: getFirestore(), target: `emulator ${process.env.FIRESTORE_EMULATOR_HOST} (${projectId})` };
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) fail("FIREBASE_SERVICE_ACCOUNT_JSON tanımlı değil (ortam ayarlarından eklenir; sohbete yapıştırılmaz)");
  let account;
  try {
    account = JSON.parse(raw);
  } catch {
    fail("FIREBASE_SERVICE_ACCOUNT_JSON geçerli JSON değil");
  }
  initializeApp({ credential: cert(account), projectId: account.project_id });
  return { db: getFirestore(), target: `YAYIN ${account.project_id}` };
}

/** Yazmaları toplar; kuru çalışmada yalnızca listeler. */
function writer(db, apply) {
  const ops = [];
  return {
    set(ref, data, options) {
      ops.push({ kind: "set", ref, data, options });
    },
    update(ref, data) {
      ops.push({ kind: "update", ref, data });
    },
    async flush() {
      for (const op of ops) console.log(`  ${op.kind.padEnd(6)} ${op.ref.path} ${JSON.stringify(op.data)}`);
      if (!apply) {
        console.log(`\nKURU ÇALIŞMA: ${ops.length} yazma yapılmadı. Yazmak için --apply.`);
        return;
      }
      for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
        const batch = db.batch();
        for (const op of ops.slice(i, i + BATCH_LIMIT)) {
          if (op.kind === "set") batch.set(op.ref, op.data, op.options ?? {});
          else batch.update(op.ref, op.data);
        }
        await batch.commit();
      }
      console.log(`\n${ops.length} yazma uygulandı.`);
    },
  };
}

function requireVenueId(id) {
  if (!id || (id !== DEFAULT_VENUE_ID && !VENUE_ID_PATTERN.test(id))) {
    fail(`geçersiz mekan kimliği "${id ?? ""}" (küçük harf, rakam, tire; 2-40 karakter)`);
  }
  return id;
}

function requireUid(uid) {
  if (!uid || !/^[A-Za-z0-9_-]{6,128}$/.test(uid)) fail(`geçersiz hesap kimliği "${uid ?? ""}"`);
  return uid;
}

function staffDoc(uid, role) {
  return { uid, role, added_by: ACTOR, added_at: Date.now() };
}

async function legacyBranding(db) {
  const snap = await db.doc("app_config/active_venue").get();
  if (!snap.exists) return {};
  const data = snap.data();
  delete data.updated_at;
  return data;
}

const commands = {
  async "create-venue"(db, out, [id], flags) {
    requireVenueId(id);
    const ref = db.doc(`venues/${id}`);
    if ((await ref.get()).exists) fail(`venues/${id} zaten var`);
    const branding = flags["from-legacy"] ? await legacyBranding(db) : {};
    const name = typeof flags.name === "string" ? flags.name : branding.name;
    if (!name) fail("--name gerekli");
    out.set(ref, { ...branding, name, created_at: Date.now() });
  },

  async "add-owner"(db, out, [id, uid]) {
    requireVenueId(id);
    requireUid(uid);
    if (!(await db.doc(`venues/${id}`).get()).exists) fail(`venues/${id} yok; önce create-venue`);
    out.set(db.doc(`venues/${id}/staff/${uid}`), staffDoc(uid, "owner"));
  },

  async "add-platform-admin"(db, out, [uid]) {
    requireUid(uid);
    out.set(db.doc(`platform_admins/${uid}`), { added_at: Date.now(), added_by: ACTOR });
  },

  /** Aşama A: varsayılan mekan belgesi ve global personelin mekan listesine kopyası. */
  async migrate(db, out, _args, flags) {
    const venueRef = db.doc(`venues/${DEFAULT_VENUE_ID}`);
    if (!(await venueRef.get()).exists) {
      const branding = await legacyBranding(db);
      out.set(venueRef, { ...branding, name: branding.name || "HENGAME", created_at: Date.now() });
    } else {
      console.log(`venues/${DEFAULT_VENUE_ID} zaten var; marka kopyalanmadı.`);
    }
    const owner = typeof flags.owner === "string" ? requireUid(flags.owner) : null;
    const legacyStaff = await db.collection("staff").get();
    const existing = new Set((await venueRef.collection("staff").get()).docs.map((d) => d.id));
    for (const d of legacyStaff.docs) {
      if (existing.has(d.id)) continue;
      out.set(venueRef.collection("staff").doc(d.id), staffDoc(d.id, d.id === owner ? "owner" : "staff"));
    }
    if (owner && !legacyStaff.docs.some((d) => d.id === owner) && !existing.has(owner)) {
      out.set(venueRef.collection("staff").doc(owner), staffDoc(owner, "owner"));
    }
  },

  /** Aşama B: mekansız kayıt `default` mekanındır; raporun süzgeçli sorgusu onları da bulsun. */
  async backfill(db, out) {
    for (const name of BACKFILL_COLLECTIONS) {
      const snap = await db.collection(name).get();
      const missing = snap.docs.filter((d) => d.get("venue_id") === undefined);
      console.log(`${name}: ${snap.size} kayıt, ${missing.length} mekansız`);
      for (const d of missing) out.update(d.ref, { venue_id: DEFAULT_VENUE_ID });
    }
  },
};

async function main() {
  const { command, args, flags } = parseArgs(process.argv.slice(2));
  const run = commands[command];
  if (!run) fail(`bilinmeyen komut "${command ?? ""}". Komutlar: ${Object.keys(commands).join(", ")}`);
  const apply = flags.apply === true;
  const { db, target } = connect(flags);
  console.log(`Hedef: ${target}${apply ? "" : " — kuru çalışma"}\n`);
  const out = writer(db, apply);
  await run(db, out, args, flags);
  await out.flush();
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
