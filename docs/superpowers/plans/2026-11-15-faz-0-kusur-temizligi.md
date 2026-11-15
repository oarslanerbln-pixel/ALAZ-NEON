# Faz 0 — Kusur Temizliği Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bugün "hata gibi görünen" kusurları, görünümü en az değiştirerek gidermek.

**Architecture:** Yeni soyutlama yok. Tek yeni saf modül `lib/lobbyWall` (lobide hangi isimler görünür); geri kalanı sabit metinlerin `t()`'ye taşınması, bir token değeri, statik varlıklar ve belgeler.

**Tech Stack:** React 19, TypeScript, Tailwind 4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-15-lounge-yon-design.md`

## Global Constraints

- Kullanıcıya görünen her metin `t()` ile; her anahtar tr/de/en üçünde (`i18nKeys.test.ts`).
- Yeni metinlerde savaş/siber dili yok (yön: Lounge); mevcut anahtarların tonu Faz 2'de yazılır, burada dokunulmaz.
- Animasyon yalnız `transform`/`opacity`, süre ≤ 250 ms, sonsuz döngü yok.
- TV'de en küçük yazı 24 px (`.tv-canvas`), telefonda 14 px.
- Logo, yazı tipi ve yerleşimler Faz 1–2'ye kadar değişmez; ikon yalnız gradyan ve parlamadan arındırılır.
- Commit mesajları Türkçe, `tip(kapsam): özet`.

## Review Focus

1. Lobide 0 ve 40 oyuncu: duvar boşken yer kaplamaz, doluyken taşmaz → Görev 1 birim testi.
2. Emoji ile başlayan ya da çok uzun takma ad: baş harfler bozuk karakter üretmez, rozet taşmaz → Görev 1 birim testi + ekran görüntüsü.
3. Arena lobisi (kategori paneli açık) 1080 tuvale sığar → Görev 1 ekran görüntüsü (`game=arena&status=lobby`).
4. Almanca/İngilizce uzun metin: oda kodu kartı, 404 düğmesi, personel uyarısı taşmaz → Görev 2 ekran görüntüsü.
5. Mekân rengi (`primary_color`) vurguyu ezdiğinde `ink-*` kontrastı etkilenmez (yalnız nötr tokenlar sınanır) → Görev 5 testi.

---

### Görev 1: Lobi — oyuncu duvarı, ortalama, çeviriler

**Files:**
- Create: `src/lib/lobbyWall.ts`
- Test: `src/lib/__tests__/lobbyWall.test.ts`
- Modify: `src/pages/host/views/HostLobby.tsx`, `src/lib/i18n.ts`, `src/dev/ScreenPreview.tsx`

**Interfaces:**
- Produces: `LOBBY_WALL_SLOTS = 10`;
  `lobbyWall<T extends { created_at: number }>(players: readonly T[], slots: number): { shown: T[]; hidden: number }`;
  `initialsOf(nickname: string): string`.

- [ ] **Step 1: Başarısız testi yaz**

```ts
const p = (id: string, at: number) => ({ id, created_at: at });
expect(lobbyWall([], 10)).toEqual({ shown: [], hidden: 0 });
expect(lobbyWall([p("b", 2), p("a", 1)], 10).shown.map((x) => x.id)).toEqual(["a", "b"]); // katılım sırası
const forty = Array.from({ length: 40 }, (_, i) => p(`p${i}`, i));
const wall = lobbyWall(forty, 10);
expect(wall.shown.map((x) => x.id)).toEqual(["p31", "p32", "p33", "p34", "p35", "p36", "p37", "p38", "p39"]); // en yeni 9
expect(wall.hidden).toBe(31);
expect(lobbyWall(forty.slice(0, 10), 10).hidden).toBe(0); // tam sığan liste kesilmez
expect(initialsOf("ayşe")).toBe("AY");
expect(initialsOf("ilk")).toBe("İL"); // Türkçe büyük harf (upperTL)
expect(initialsOf("🔥x")).toBe("🔥X"); // vekil çift bölünmez
expect(initialsOf(" ")).toBe("?");
```

- [ ] **Step 2:** `npx vitest run src/lib/__tests__/lobbyWall.test.ts` → FAIL (modül yok).
- [ ] **Step 3:** `lobbyWall`, `initialsOf`, `LOBBY_WALL_SLOTS` uygula. Girdi dizisi değiştirilmez.
- [ ] **Step 4:** Aynı komut → PASS.
- [ ] **Step 5:** `HostLobby.tsx`: `fixed inset-0` yörünge katmanını ve "Oyuncu Bağlandı" hapını kaldır; kök `flex flex-col gap-6 mx-auto`; kartların altına `grid grid-cols-5 gap-4` duvar (iki satır; taşma `common.morePlayers`). Sabit metinler: `hostLobby.waitingRoom` (yeni), `lobby.roomCode`, `dashboard.joinBody`, `lobby.quickPresets` (yeni), `hostLobby.minutes` (yeni, `(n) => …`); `alt=""`.
- [ ] **Step 6:** `ScreenPreview.tsx`: `game=arena&status=lobby` Arena lobisini üretimdeki kapla (`px-24 py-12` + `HostHeader`) çizer.
- [ ] **Step 7:** `/__screens` ile quiz, bomb, arena lobisi `n=0`, `n=8`, `n=40` ekran görüntüsü: rozet içeriğe binmiyor, tuval taşmıyor.
- [ ] **Step 8:** Commit `fix(lobby): isim rozetleri içeriğin üstüne binmesin, sabit metinler çevrilsin`.

### Görev 2: Sabit metinler — bomba etiketi, 404, personel uyarısı

**Files:**
- Modify: `src/pages/host/bomb/Cyber3DBomb.tsx:89`, `src/pages/NotFoundPage.tsx`, `src/components/StaffAccessNotice.tsx`, `src/pages/admin/{VenueSettings,RewardVerify,NightlyReport}.tsx` (yalnız `title`), `src/lib/i18n.ts`
- Test: `src/pages/__tests__/NotFoundPage.test.tsx`

**Interfaces:**
- Produces (yeni anahtarlar): `bomb.fuse`, `notFound.title`, `notFound.body`, `staff.loginRequired`, `staff.notStaff` (`(email) => …`), `staff.thisAccount`, `staff.ownerHint`, `admin.venueTitle`, `admin.rewardsTitle`, `admin.reportTitle`. Yeniden kullanılan: `game.backHome`, `host.login`, `profile.logout`.

- [ ] **Step 1:** Test: `setLocale("de")` → `NotFoundPage` "Seite nicht gefunden" gösterir, "Sinyal" içermez; `setLocale("tr")` → "Sayfa bulunamadı".
- [ ] **Step 2:** Çalıştır → FAIL.
- [ ] **Step 3:** Anahtarları ekle, üç bileşeni `useLocale().t` ile yaz.
- [ ] **Step 4:** Test + `npx vitest run src/lib/__tests__/i18nKeys.test.ts` → PASS.
- [ ] **Step 5:** Commit `fix(i18n): bomba etiketi, 404 ve personel uyarısı üç dilde`.

### Görev 3: Telefon oyun girişi — oyuna göre ipucu

**Files:**
- Modify: `src/pages/player/components/PlayerIntroVideo.tsx`, `src/pages/player/quiz/PlayerQuizController.tsx:204`, `src/pages/player/bomb/PlayerBombController.tsx:150`, `src/pages/player/PlayerGame.tsx:298`, `src/lib/i18n.ts`
- Test: `src/pages/player/components/__tests__/PlayerIntroVideo.test.tsx`

**Interfaces:**
- Produces: `PlayerIntroVideoProps.tip: string` (zorunlu). Quiz → `intro.quizTip` (yeni), Bomb → `bomb.typeAndThrow`, Arena → `intro.arenaTip`. Ses düğmesi `aria-label`: `common.soundOn` / `common.soundOff`.

- [ ] **Step 1:** Test: `tip="X"` verilince "X" görünür; Arena ipucu metni görünmez.
- [ ] **Step 2:** FAIL → **Step 3:** uygula → **Step 4:** PASS.
- [ ] **Step 5:** Commit `fix(player): oyun girişinde her modda Arena ipucu çıkıyordu`.

### Görev 4: Önizleme aracı — Arena ekranı üretimdeki kapla

**Files:**
- Modify: `src/dev/ScreenPreview.tsx`

- [ ] **Step 1:** Arena `playing` de Görev 1'deki kap içinde çizilsin (şimdi kapsız çizildiği için alt satır kenara yapışık görünüyor; üretimde 48 px pay var).
- [ ] **Step 2:** Ekran görüntüsü: alt satır kenardan 48 px içeride.
- [ ] **Step 3:** Commit `chore(dev): Arena önizlemesi üretimdeki kenar payıyla çizilsin`.

### Görev 5: `ink-3` kontrastı

**Files:**
- Modify: `src/index.css` (`--color-ink-3: #8a8a93`), `docs/motion-system.md` (§6 token tablosu)
- Test: `src/lib/__tests__/designTokens.test.ts`

- [ ] **Step 1:** Test: `src/index.css` içinden `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-ink`, `--color-ink-2`, `--color-ink-3` okunur; her `ink-*` her yüzeyde WCAG kontrastı ≥ 4.5.
- [ ] **Step 2:** FAIL (`ink-3`: 4,06 / 3,76 / 3,42) → **Step 3:** değeri değiştir → **Step 4:** PASS (5,74 / 5,31 / 4,83).
- [ ] **Step 5:** Commit `fix(ui): üçüncü metin tonu AA kontrastını tutsun`.

### Görev 6: Marka kalıntıları

**Files:**
- Modify: `index.html`, `public/manifest.json`, `public/icon.svg`, `.env.example`
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (180 px)

- [ ] **Step 1:** `icon.svg`: zemin `#0b0b10`, "H" düz `#f5a524`; gradyan, parlama ve çerçeve yok. PNG'ler bu SVG'den üretilir.
- [ ] **Step 2:** `index.html`: `og:description`'tan "14 oyun modu" çıkar; `apple-touch-icon` PNG. `manifest.json`: "neon" çıkar, renkler `#0b0b10`, 192/512 PNG ikon. `.env.example`: kullanılmayan `VITE_APP_TITLE` çıkar.
- [ ] **Step 3:** `identify public/*.png` → 192×192, 512×512, 180×180; `npm run build` → PASS.
- [ ] **Step 4:** Commit `chore(brand): eski neon kalıntıları meta, manifest ve ikondan çıktı`.

### Görev 7: Eskimiş belgeler ve ölü ses anahtarları

**Files:**
- Modify: `.claude/skills/alaz-neon-architecture/SKILL.md`, `.claude/skills/alaz-neon-debugging/SKILL.md`, `public/audio/README.md`, `src/lib/audio.ts`, `CLAUDE.md`

- [ ] **Step 1:** Mimari yetenek paketi: §2 tasarım dili v3'e ve bu yöne göre; §2.1 (kaldırılan `data-tension`) çıkar; §3 mod ekleme adımları `CLAUDE.md`'deki kayıt defteri düzenine göre.
- [ ] **Step 2:** Hata ayıklama paketi: kaldırılan modlara ve efektlere atıflar güncel örneklerle.
- [ ] **Step 3:** `audio.ts`: hiçbir yerde çalınmayan `SIREN`, `CYBER_GLITCH` anahtarları, yedek eşlemeleri ve `synth:siren` / `synth:glitch` dalları çıkar; ses README'si buna göre.
- [ ] **Step 4:** `CLAUDE.md`: tasarım belgesine tek satır işaretçi.
- [ ] **Step 5:** Commit `docs: yetenek paketleri ve ses notları güncel görsel dile göre`.

### Son doğrulama

- [ ] `npm run typecheck && npm run lint && npm run test:run && npm run build` → hepsi PASS.
- [ ] Önce/sonra ekran görüntüleri: quiz lobisi, 404 (de), telefon Quiz girişi.
