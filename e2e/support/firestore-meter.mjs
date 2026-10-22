// Firestore emülatörünün önüne konan sayaçlı vekil sunucu.
//
// Uygulama E2E derlemesinde emülatöre bu vekil üzerinden bağlanır
// (VITE_FIRESTORE_EMULATOR_PORT). Vekil trafiği olduğu gibi aktarır ve
// faturalanan işlemleri yaklaşık sayar:
//   okuma  = dinleyici (hedef) başına yeni ya da GERÇEKTEN değişmiş belge
//            (updateTime farklı) + batchGet `found` + runQuery `document`.
//            Emülatör bir belge değişince sorgunun bütün sonucunu yeniden
//            gönderiyor; üretim yalnızca değişeni gönderir ve faturalar.
//            Ham sayı `emulatorDocChanges` olarak ayrıca tutulur.
//   yazma  = Write kanalındaki ve :commit isteklerindeki her `writes` öğesi
// Sayaçlar GET /__meter ile okunur, POST /__meter/reset ile sıfırlanır.
import http from "node:http";
import { StringDecoder } from "node:string_decoder";

const LISTEN_PORT = Number(process.env.METER_PORT ?? 8081);
const TARGET_PORT = Number(process.env.FIRESTORE_PORT ?? 8080);
const TARGET_HOST = process.env.FIRESTORE_HOST ?? "127.0.0.1";

const fresh = () => ({
  since: Date.now(),
  reads: 0,
  emulatorDocChanges: 0,
  removes: 0,
  writes: 0,
  deletes: 0,
  listenRequests: 0,
  writeRequests: 0,
  commitRequests: 0,
});
let stats = fresh();

// WebChannel oturumu (SID) + hedef + belge → son görülen updateTime.
const seen = new Map();

function countDocumentChange(sid, change) {
  const name = change?.document?.name;
  const updateTime = change?.document?.updateTime;
  for (const t of change?.targetIds ?? []) {
    stats.emulatorDocChanges++;
    const key = `${sid}|${t}|${name}`;
    if (seen.get(key) !== updateTime) {
      seen.set(key, updateTime);
      stats.reads++;
    }
  }
}

function walk(node, sid) {
  if (Array.isArray(node)) {
    for (const x of node) walk(x, sid);
  } else if (node && typeof node === "object") {
    if (node.documentChange) countDocumentChange(sid, node.documentChange);
    else if (node.documentRemove || node.documentDelete) stats.removes++;
  }
}

/**
 * Listen yanıtı WebChannel çerçeveleri: "<uzunluk>\n<json>" art arda.
 * Doğrusal ayrıştırma: her çerçeve bir kez JSON.parse edilir. (İlk sürüm
 * büyüyen tamponu her parçada regex'le baştan tarıyordu; 20 telefonda vekil
 * tıkanıp tüm Firestore trafiğini yavaşlatıyordu.)
 */
function listenParser(sid) {
  const decoder = new StringDecoder("utf8");
  let buf = "";
  return (chunk) => {
    buf += decoder.write(chunk);
    for (;;) {
      const nl = buf.indexOf("\n");
      if (nl === -1) return;
      const len = Number(buf.slice(0, nl));
      if (!Number.isFinite(len) || len < 0) {
        buf = ""; // beklenmeyen biçim: bu yanıtı saymayı bırak
        return;
      }
      if (buf.length - (nl + 1) < len) return;
      const frame = buf.slice(nl + 1, nl + 1 + len);
      buf = buf.slice(nl + 1 + len);
      try {
        walk(JSON.parse(frame), sid);
      } catch {
        /* sayılamayan çerçeve */
      }
    }
  };
}

function countAll(text, needle) {
  let n = 0;
  let i = text.indexOf(needle);
  while (i !== -1) {
    n++;
    i = text.indexOf(needle, i + needle.length);
  }
  return n;
}

/** Akış parçalarında, parça sınırına denk gelen eşleşmeleri kaçırmadan sayar. */
function streamCounter(needles, onCount) {
  let tail = "";
  return (chunk) => {
    const text = tail + chunk.toString("utf8");
    for (const needle of needles) {
      const n = countAll(text, needle);
      // Kuyruktaki (bir önceki parçadan taşınan) eşleşmeyi iki kez sayma.
      const dup = countAll(tail, needle);
      if (n - dup > 0) onCount(needle, n - dup);
    }
    tail = text.slice(-64);
  };
}

/** WebChannel gövdesi: count=..&req0___data__=<json>&req1___data__=<json> */
function webChannelPayloads(body) {
  const out = [];
  for (const part of body.split("&")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (!/^req\d+___data__$/.test(part.slice(0, eq))) continue;
    try {
      out.push(JSON.parse(decodeURIComponent(part.slice(eq + 1).replace(/\+/g, " "))));
    } catch {
      /* bozuk parça: sayma */
    }
  }
  return out;
}

function countWrites(writes) {
  for (const w of writes ?? []) {
    if (w.delete) stats.deletes++;
    else stats.writes++;
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/__meter") {
    res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
    res.end(JSON.stringify({ ...stats, elapsedMs: Date.now() - stats.since }));
    return;
  }
  if (req.url === "/__meter/reset") {
    // Görülen belgeler sıfırlanmaz: sıfırlamadan sonraki ilk değişiklik
    // de gerçek bir değişiklik olarak sayılsın, eski sonuçların yeniden
    // gönderimi değil.
    stats = fresh();
    res.writeHead(204, { "access-control-allow-origin": "*" });
    res.end();
    return;
  }

  const url = req.url ?? "";
  const isListen = url.includes("/Listen/channel");
  const isWrite = url.includes("/Write/channel");
  const isCommit = url.includes(":commit");
  const isBatchGet = url.includes(":batchGet");
  const isRunQuery = url.includes(":runQuery");

  const reqChunks = [];
  req.on("data", (c) => reqChunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(reqChunks);
    if (req.method === "POST" && body.length > 0) {
      const text = body.toString("utf8");
      if (isWrite) {
        stats.writeRequests++;
        for (const p of webChannelPayloads(text)) countWrites(p.writes);
      } else if (isCommit) {
        stats.commitRequests++;
        try {
          countWrites(JSON.parse(text).writes);
        } catch {
          /* yoksay */
        }
      } else if (isListen) {
        stats.listenRequests++;
      }
    }

    const upstream = http.request(
      {
        host: TARGET_HOST,
        port: TARGET_PORT,
        method: req.method,
        path: url,
        headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
      },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers);
        const sid = new URL(url, "http://x").searchParams.get("SID") ?? "init";
        const onData = isListen
          ? listenParser(sid)
          : isBatchGet
            ? streamCounter(['"found"'], (_n, n) => (stats.reads += n))
            : isRunQuery
              ? streamCounter(['"document"'], (_n, n) => (stats.reads += n))
              : null;
        up.on("data", (chunk) => {
          if (onData) onData(chunk);
          res.write(chunk);
        });
        up.on("end", () => res.end());
        up.on("error", () => res.destroy());
      },
    );
    upstream.on("error", (err) => {
      console.error(`[firestore-meter] upstream ${req.method} ${url.slice(0, 80)}: ${err.message}`);
      // CORS başlığı olmadan dönen hata tarayıcıda "CORS" diye görünüp asıl
      // sebebi gizliyordu.
      if (!res.headersSent) {
        res.writeHead(502, {
          "access-control-allow-origin": req.headers.origin ?? "*",
          "access-control-allow-credentials": "true",
        });
      }
      res.end();
    });
    upstream.end(body);
  });
  res.on("close", () => req.destroy());
});

server.keepAliveTimeout = 120_000;
server.listen(LISTEN_PORT, "127.0.0.1", () => {
  console.log(`[firestore-meter] 127.0.0.1:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
