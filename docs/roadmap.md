# HENGAME — Analiz ve Yol Haritası (2026 Q4 – 2027 Q1)

> Anlık görüntü: 2026-10-04, `main` @ `f473ac7`. Her bulgu ölçülmüş veriye ve
> `dosya:satır` kanıtına dayanır. Önem ölçeği: **Kritik / Yüksek / Orta / Düşük**.
> Efor: **S** ≤ 1 gün, **M** 2–4 gün, **L** 1–2 hafta.

## 1. Yönetici özeti

Mühendislik tabanı sağlam: typecheck, lint, 247 birim test ve build temiz; CI'da
emulator üzerinde kural testleri koşuyor; oyun ekranları rota ve oyun bazında
`lazy`; saf oyun mantığı `src/lib` altında toplanmış. Ürünün büyümesini
sınırlayan üç yapısal sorun var:

1. **Güven sınırı istemcide.** Para değeri taşıyan iki akış (ödül kuponu, lig
   puanı) herhangi bir anonim oturumdan sahtelenebiliyor; `users` koleksiyonu
   telefon numaralarını herkese okutuyor.
2. **Spark kotası oyuncu sayısının karesiyle tükeniyor.** Lobideki oyuncu
   sayacı + 15 sn heartbeat, 30 kişilik lobide dakikada ~3.700 okuma üretiyor;
   günlük 50.000 okuma ≈ **13 dakikada** biter.
3. **Kural ↔ istemci uyumsuzluğu sessiz kırılma üretiyor.** Kural yorumlarında
   kayıtlı 4 olay (answers, overload, echo, oyuncu sayaçları) aynı kalıptı;
   bugün **emoji tepkileri** kural eksikliği yüzünden çalışmıyor.

Önerilen sıra: **Faz 0** (1 hafta) güvenlik + kırık özellik → **Faz 1** (2–3
hafta) maliyet ve "host tek yazardır" ilkesine dönüş → **Faz 2** (3–4 hafta)
kalite güvencesi, performans, gözlemlenebilirlik → **Faz 3** (2027 Q1) çok
mekanlı B2B ürün.

## 2. Yöntem — kullanılan uzmanlık mercekleri

| Mercek | Veri kaynağı |
|---|---|
| Uygulama güvenliği & gizlilik | `firestore.rules` satır satır; istemcideki tüm yazma yolları (`grep updateDoc/setDoc/addDoc/increment`) |
| Firebase maliyet & ölçek | 14 `onSnapshot` dinleyicisinin envanteri, heartbeat sıklığı, fan-out hesabı |
| Mimari & kod sağlığı | Dosya boyutları; `.claude/skills/alaz-neon-architecture` ilkeleriyle kıyas |
| Kalite güvencesi | Test envanteri, `.github/workflows/ci.yml` |
| Web performansı | `vite build` çıktısı, `public/` varlık boyutları |
| Bağımlılık güvenliği | `npm audit --omit=dev`, `npm outdated` |
| UX / erişilebilirlik / PWA | `public/manifest.json`, aria/role sayımı, Wake Lock kullanımı |
| Ürün & B2B | Mimari skill'deki DOOH/gelir modeli, `app_config/active_venue` tek kiracı yapısı |

### Ölçüm anlık görüntüsü

| Metrik | Değer |
|---|---|
| `src/` TS/TSX satırı | 34.694 (15 oyun modu) |
| Birim test | 26 dosya / 247 test, tamamı geçiyor (~10 sn) |
| Bileşen / hook / E2E testi | 3 / 0 / 0 |
| Kural testi | 842 satır, emulator, CI'da koşuyor |
| typecheck · lint · build | temiz |
| Landing ilk yük (JS, gzip) | ≈ 360 KB (index 125 + firebase 175 + motion 49 + react 13) + CSS 34 KB |
| `public/` | 18 MB; 15 arka plan görseli 0,39–1,07 MB |
| Prod bağımlılık açığı | 7 yüksek (çoğu transitif; firebase/grpc, react-router, vite, postcss) |
| 700+ satırlık bileşen | 3 (`GameSettingsModal` 859, `HostQuizDisplay` 840, `HostDisplay` 717) |
| `console.*` çağrısı | 91 |

## 3. Bulgular

### 3.1 Güvenlik & gizlilik

| # | Önem | Bulgu | Kanıt |
|---|---|---|---|
| S1 | **Kritik** | **Ödül kuponu sahteciliği.** `rewards` create yalnızca `status == 'available'` istiyor; `uid`, `code`, `title` serbest. Anonim bir oturum konsoldan kendine kupon yazar, barda kodla doğrulatır → doğrudan mali kayıp. | `firestore.rules:281`, `src/lib/rewards.ts:42` |
| S2 | **Kritik** | **Lig puanı sahteciliği.** `users/{uid}` create/update alan kısıtsız; `total_lifetime_score` ve `current_league` oyuncu cihazından `increment(delta)` ile yazılıyor. Leaderboard ve sadakat mekaniği güvenilmez. | `firestore.rules:167`, `src/hooks/usePlayer.ts:98` |
| S3 | **Yüksek (KVKK)** | **Telefon numarası sızıntısı.** `users` herkese okunur (`read: if true`) ve telefonla girişte `phone_number` tutuluyor → kayıtlı tüm numaralar listelenebilir. | `firestore.rules:164`, `src/hooks/useUserProfile.ts:47` |
| S4 | **Yüksek** | **Puanlı katılım.** `players` create yalnızca `uid` kontrol ediyor; oyuncu `total_score: 9999` ile katılabilir. Ödül kazananı bu puanla seçildiği için S1 kapatılsa bile ödül alınır. | `firestore.rules:122` |
| S5 | **Yüksek** | **Oda üzerindeki oyuncu istisnaları kimliğe bağlı değil.** Odada olmayan biri bombayı paslayabilir, `sensor_buzzer_player_id` ile başkası adına buzz'a basabilir, `echo_votes`/`pulse_clicks` haritasının tamamını ezebilir, `overload_time_allowed`'ı keyfi ayarlayabilir. | `firestore.rules:44-87` |
| S6 | Orta | `answers` herkese okunur, alan/boyut/oda durumu kısıtı yok: cevap tur bitmeden okunup kopyalanabilir; büyük yazmalarla kota tüketilebilir. | `firestore.rules:206-214` |
| S7 | Orta | Oda açmak yetki istemiyor (her anonim oturum host olabilir) ve App Check yok → kota/spam saldırı yüzeyi. | `firestore.rules:94` |
| S8 | Düşük | 7 yüksek seviye bağımlılık açığı. Tarayıcıda pratik istismar olasılığı düşük (react-router açığı SSR/turbo-stream, grpc Node tarafı) ama yamalar sürüm içi. | `npm audit --omit=dev` |

**Kök neden:** Spark planında güvenilir sunucu yok; "kim kime puan/ödül
yazabilir" sorusu yalnızca kurallarla çözülmek zorunda ve şu an her anonim
oturum potansiyel host. Kural tarafında yapılabilecek çok şey var (Faz 0);
kalıcı çözüm için **D1** ve **D2** karar noktalarına bakın.

### 3.2 Firebase maliyet & ölçek

Her oyuncu 15 sn'de bir `players/{id}.last_active` yazıyor
(`src/lib/liveness.ts:23`, `src/pages/player/PlayerGame.tsx:81`). Lobideki her
telefon yalnızca oyuncu **sayısını** göstermek için odanın tüm `players`
sorgusunu dinliyor (`src/pages/player/views/PlayerLobby.tsx:45-46`). Her
heartbeat N+1 dinleyiciye okuma olarak düşer:

```
lobi okuma/dk ≈ N × 4 × (N + 1)
```

| Oyuncu (N) | Okuma/dk | Spark günlük 50k okuma ne kadar dayanır |
|---|---|---|
| 10 | 440 | ~1 sa 54 dk |
| 20 | 1.680 | ~30 dk |
| 30 | 3.720 | ~13 dk |

| # | Önem | Bulgu |
|---|---|---|
| M1 | **Kritik** | Lobi sayacı için tüm `players` sorgusu dinleniyor (yukarıdaki N² fan-out). |
| M2 | Yüksek | Oyun sırasında da host dinleyicisi heartbeat başına okuma alıyor: 30 oyuncu × 4/dk × 240 dk ≈ **28.800 okuma** — 4 saatlik bir gecede tek başına günlük kotanın %58'i. |
| M3 | Yüksek | `echo_votes`, `pulse_clicks`, bomb/overload pasları oda dokümanına yazılıyor; oda dokümanını herkes dinlediği için her girdi N'e yayılıyor (30 kişilik echo turu ≈ 930 okuma; host-only bir koleksiyonda 30). |
| M4 | Orta | Kota görünürlüğü yok: oturum başına okuma/yazma ölçümü ve konsol kullanım alarmı tanımsız. |

### 3.3 Mimari & kod sağlığı

| # | Önem | Bulgu |
|---|---|---|
| A1 | Yüksek | **"Host tek yazardır" ilkesi 6 istisnayla delinmiş** (`firestore.rules:44-87`). Her yeni oyun yeni bir istisna ve yeni bir sessiz-kırılma riski demek. M3 ve S5 ile aynı kök. |
| A2 | Yüksek | **Kural ↔ istemci yazma sözleşmesi test edilmiyor.** Güncel örnek: `rooms/{id}/transient/emojiPulse` için kural yok; `match /rooms/{roomId}` alt koleksiyonları kapsamaz → her emoji tepkisi permission-denied, hata yalnızca console'a düşüyor (`src/hooks/useEmojiPulse.ts:39-43`). |
| A3 | Orta | Büyük bileşenler: `GameSettingsModal` (859), `HostQuizDisplay` (840), `HostDisplay` (717). Durum mantığı bileşen içinde; birim testle kapsanamıyor. |
| A4 | Orta | Sentinel yalnızca cevap **uzunluğunu** görüyor (`"X".repeat(n)`, `src/hooks/useHostRoom.ts:93`); "hile koruması" iddiasını karşılamıyor. Hile önlemenin asıl yeri kurallar (3.1). |
| A5 | Orta | **Tek kiracı:** aktif mekan tek doküman (`app_config/active_venue`), `isStaff()` global. İkinci mekan satıldığında A'nın personeli B'nin markasını ve ödüllerini değiştirebilir. |
| A6 | Düşük | 91 `console.*` çağrısı; seviyeli, Sentry'ye breadcrumb düşen merkezi bir logger yok. |

### 3.4 Kalite güvencesi

| # | Önem | Bulgu |
|---|---|---|
| Q1 | Yüksek | **Çok cihazlı uçtan uca test yok.** Ürünün çekirdek riski "host status değiştirdi, telefon siyah ekran" sınıfı; birim testler bunu yakalayamaz. Ortamda Chromium + Playwright hazır; Firestore emulator CI'da zaten var. |
| Q2 | Orta | Hook testi 0, bileşen testi 3. Para değerli mantık (ör. `usePlayer.ts:80-100` puan deltası) test dışı. |
| Q3 | Orta | CI'da güvenlik/performans kapısı yok: `npm audit` eşiği, bundle bütçesi, coverage eşiği. |
| + | — | Güçlü yan: 842 satırlık emulator kural testi ve "kaynak ağacı temiz mi" adımı korunmalı. |

### 3.5 Web performansı

| # | Önem | Bulgu |
|---|---|---|
| P1 | Yüksek | Telefon görselleri ağır: `player-bg-*.png` 0,77–0,89 MB, `wait-*.png` 0,59–0,66 MB; `public/` toplam 18 MB. Mekân Wi-Fi'ı/4G'de oyuncunun ilk ekranını geciktiriyor. AVIF/WebP + 1080 px ile tipik olarak %85+ küçülme. |
| P2 | Orta | Ana chunk 381 KB (125 KB gzip): tr/de/en sözlüğünün tamamı (`i18n.ts`, 1.917 satır) ve Sentry statik içeride. |
| P3 | Düşük | `vendor-firebase` 175 KB gzip; `firebase/auth` ve Firestore landing ilk boyamasından sonra yüklenebilir. |
| + | — | Güçlü yan: oyun ekranları `gameDisplays.ts`/`gameControllers.ts` ile oyun bazında lazy; jsPDF/html2canvas yalnızca raporda yükleniyor. |

### 3.6 Gözlemlenebilirlik & operasyon

| # | Önem | Bulgu |
|---|---|---|
| O1 | Yüksek | Sentry DSN opsiyonel; `release` ve sourcemap yüklemesi yok → prod stack trace'leri minify. Rol (host/player), `room_id`, oyun etiketi yok. |
| O2 | Orta | Kullanım telemetrisi yok: oyun başına oyuncu, tur tamamlama, terk oranı, oturum başına okuma. Aynı veri B2B satış argümanı. |
| O3 | Düşük | İki dağıtım hedefi (`vercel.json` + Firebase Hosting); güvenlik başlıkları (CSP, Permissions-Policy) ve `/assets/*` uzun önbellek tanımı yok. |

### 3.7 UX, erişilebilirlik, PWA

| # | Önem | Bulgu |
|---|---|---|
| U1 | Yüksek | **Wake Lock yok.** Telefon ekranı kararınca heartbeat duruyor → oyuncu "ölü" sayılıyor, bomb/overload hedeflemesinden düşüyor; TV/tablet uykuya geçebilir. |
| U2 | Orta | PWA: manifest yalnız SVG ikon (iOS ana ekran PNG ister); `orientation: portrait-primary` tüm uygulamaya uygulanıyor (yatay host kurulu PWA'da dik zorlanır); service worker yok. |
| U3 | Orta | ~100 TSX dosyasında 69 aria/role. Reduced-motion global çözülmüş (iyi); player kumandalarında odak sırası, küçük neon metin kontrastı, ekran okuyucu etiketleri taranmalı. |
| U4 | Düşük | Yazma hataları kullanıcıya görünmüyor (ör. emoji); toast/Sentry yerine console. |

### 3.8 Ürün & B2B

| # | Bulgu |
|---|---|
| B1 | Çok mekan (multi-tenant) modeli yok (A5) — satışın ölçeklenmesinin ön koşulu. |
| B2 | `ad_break` statüsü tiplerde tanımlı ama sponsor ekranı ve **doğrulanabilir gösterim kaydı** (proof-of-play: sponsor, süre, izleyen oyuncu sayısı) yok; DOOH geliri bu kayıt olmadan satılamaz. |
| B3 | Mekan KPI'ı yok: gece başına tekil oyuncu, geri dönüş oranı (`retention.ts` hazır), ödül kullanım oranı, en çok oynanan oyun. `NightlyReport` genişletilebilir. |
| B4 | Soru havuzları TS kaynak dosyalarında (quiz tr/de/en 558–819 satır, ayna 702). Mekan/kurum özel soru paketi satmak için JSON + şema doğrulama hattı gerekir. |

## 4. Karar noktaları

| # | Karar | Öneri | Gerekçe |
|---|---|---|---|
| D1 | Host = personel hesabı mı? | **Evet, Faz 0'da.** TV/tablet bir kez personel hesabıyla giriş yapar. | Oda açma, ödül yazma ve kalıcı puan yazma `isStaff()`'a bağlanır → S1, S2, S7 tek hamlede kapanır; Spark'ta kalınır. Maliyet: kurulumda tek giriş adımı. |
| D2 | Blaze + Cloud Functions ne zaman? | **Faz 3**, çok mekan ve sponsor geliri başladığında. | Ödül üretimi, puanlama (answers → skor), staff custom claim ve zamanlanmış temizlik sunucuya taşınır. Blaze'de sert tavan yok → bütçe alarmı şart. |
| D3 | Presence: Firestore heartbeat mi RTDB `onDisconnect` mi? | Önce M1/M2 düzeltmesi, sonra ölçümle karar. | RTDB presence Firestore okuması tüketmez; Spark'ta 100 eşzamanlı bağlantı sınırı tek mekan için yeterli. |

## 5. Yol haritası

### Faz 0 — Acil (1 hafta): güvenlik ve kırık özellik

Her madde önce **kırmızı** kural testiyle (saldırı senaryosu) başlar, sonra kural, sonra istemci uyarlaması.

> **Durum (2026-10-04): tamamlandı.** D1 onaylandı. 19 saldırı/yeni davranış
> testi önce kırmızı doğrulandı, ardından kural testleri 102/102 yeşil.
> Uygulamadaki sapmalar tablonun altında.

| İş | Kapsar | Efor | Kabul kriteri | Durum |
|---|---|---|---|---|
| 0.1 `players` create: alan whitelist, `total_score == 0`, oda mevcut ve katılıma açık | S4 | S | Puanlı katılım kural testinde reddedilir | ✅ |
| 0.2 D1: `rooms` create ve `rewards` create `isStaff()`; ödül `room_id` taşır, yazan o odanın host'u | S1, S7 | M | Anonim kupon yazımı reddedilir | ✅ |
| 0.3 `users` update yalnız `nickname`/`last_active`; puan/lig alanlarını host (personel) oyun sonunda yazar | S2 | M | Oyuncu kendi puanını değiştiremez; `usePlayer` senkronu host'a taşınmış | ✅ |
| 0.4 PII: başka uid'nin profil okuması reddedilir | S3 | S | Telefon numarası yalnızca sahibine okunur | ✅ |
| 0.5 Emoji alt koleksiyonu kuralı (oda oyuncusu, alan whitelist, boyut) + test | A2 | S | Emoji tepkisi TV'de görünür | ✅ |
| 0.6 Sürüm içi yamalar (firebase 12.19, react-router 7.18.4, vite 7.3.6) | S8 | S | Prod ağacında yalnızca upstream'de çözümsüz bulgu kalır | ✅ |

Uygulama notları:

- **0.3:** Kalıcı puan, oyun boyunca host ekranından aktarılıyor
  (`hooks/useLifetimeScoreSync.ts`, saf mantık `lib/lifetimeScore.ts`).
  "Ne kadar aktarıldı" bilgisi oyuncu dokümanında (`lifetime_credited`)
  kalıcı. Bu sayede host sayfası yenilense de puan iki kez eklenmiyor,
  arada kazanılan puan da kaybolmuyor.
- **0.4:** `users_public` ayrımına gerek kalmadı. Başkasının profilini okuyan
  bir ekran yok; liderlik tablosu `players` koleksiyonundan besleniyor. Bu
  yüzden okuma sahibine kısıtlandı.
- **0.6:** Kalan tek bulgu `firebase` → `@firebase/firestore` →
  `@grpc/grpc-js@1.9`. Firestore bu sürümü sabitliyor; en güncel firebase
  (12.19) de aynı. grpc yalnızca Node tarafında kullanılıyor, tarayıcı
  paketine girmiyor (`dist/` içinde doğrulandı). Upstream düzeltmesi
  bekleniyor; 2.6'daki audit kapısı bu bulguyu istisna listesinde tutmalı.
- **Geçiş etkisi:** Yayından önce anonim oturumla açılmış odalar oynanmaya
  devam eder. Ancak bu odalarda ödül ve kalıcı puan yazılamaz. TV'nin bir kez
  personel hesabıyla giriş yapması gerekir (README → Staff access).

### Faz 1 — Maliyet ve "host tek yazar" (2–3 hafta)

| İş | Kapsar | Efor | Kabul kriteri |
|---|---|---|---|
| 1.1 Host `rooms.player_count` yazar; `PlayerLobby` `players` dinleyicisini bırakır | M1 | S | 30 kişilik lobide ≤ 150 okuma/dk |
| 1.2 Oyuncu heartbeat'i 15 → 30 sn, `liveness.ts` eşikleri orantılı; ardından D3 ölçümü | M2, D3 | S | `liveness` testleri güncel; host okumaları yarıya iner |
| 1.3 Oyuncu girdileri `rooms/{id}/inputs/{playerId}` alt koleksiyonuna (bomb pas, echo oyu, pulse, overload). Sensor buzz → sabit ID'li `create` (ikinci create reddedilir: ilk basan kazanır, transaction gerekmez) | M3, S5, A1 | L | Oda dokümanında oyuncu yazma istisnası kalmaz; `firestore.rules:44-87` silinir |
| 1.4 Yazma yolu sözleşme testi: istemcideki her `setDoc/updateDoc/addDoc/increment` yolu için emulator testi + merkezi `safeWrite` (hata → toast + Sentry) | A2, U4 | M | Testsiz yazma yolu CI'dan geçmez |
| 1.5 `answers` create: alan whitelist, boyut sınırı, oda durumu; okuma yalnız host + sahibi | S6 | M | Kural testleri |
| 1.6 App Check (reCAPTCHA) — önce izleme, sonra zorunlu | S7 | S | Doğrulanmış istek ≥ %95 olunca enforce |

### Faz 2 — Kalite, performans, gözlemlenebilirlik (3–4 hafta)

| İş | Kapsar | Efor | Kabul kriteri |
|---|---|---|---|
| 2.1 Playwright çok-context E2E (1 host + 3 oyuncu, emulator); her oyun için lobi → tur → podyum duman testi; CI job | Q1 | L | 15 oyun modu yeşil |
| 2.2 Görsel hattı: AVIF/WebP, telefon 1080 px / TV 1920 px, `loading`/`fetchpriority` | P1 | S | `public/` < 4 MB; player ilk ekran görseli ≤ 150 KB |
| 2.3 i18n dil başına lazy; Sentry boşta yüklenir | P2 | M | Ana chunk ≤ 80 KB gzip |
| 2.4 Sentry `release` + sourcemap + rol/oda/oyun etiketi; `console.*` → logger | O1, A6 | M | Prod hatası okunur stack trace ile gelir |
| 2.5 Wake Lock: oyun sırasında host + player, görünürlük dönüşünde yeniden al | U1 | S | 10 dk dokunulmayan telefon kararmaz |
| 2.6 CI kapıları: audit eşiği, bundle bütçesi, `src/lib` coverage ≥ %80 | Q3 | S | Kapılar her PR'da çalışır |
| 2.7 Büyük bileşen ayrıştırma (E2E kalkanı geldikten sonra): durum mantığı `src/lib`'e | A3, Q2 | M | Her biri < 400 satır; davranış değişmez |
| 2.8 PWA: PNG ikonlar, `orientation: any`, (ops.) service worker kabuğu | U2 | S | Lighthouse PWA kontrolleri geçer |
| 2.9 Sentinel: gerçek sinyale bağla ya da sadeleştir | A4 | S | Karar + uygulama |
| 2.10 Tek hosting hedefi + güvenlik başlıkları + asset önbelleği | O3 | S | Başlıklar prod'da doğrulanmış |
| 2.11 Erişilebilirlik taraması (player kumandaları, kontrast, odak) | U3 | M | `a11yLabels.test` kapsamı genişletilmiş |

### Faz 3 — Ürün büyümesi (2027 Q1)

| İş | Kapsar | Efor |
|---|---|---|
| 3.1 Çok mekan: `venues/{venueId}`, mekan başına personel, oda ↔ mekan bağı, `isStaffOf(venueId)` + veri göçü | A5, B1 | L |
| 3.2 Telemetri (`events`, host yazar) + mekan KPI paneli / haftalık rapor | O2, B3 | M |
| 3.3 Sponsor ekranı + proof-of-play kaydı ve sponsor raporu | B2 | M |
| 3.4 İçerik hattı: JSON + şema doğrulama + mekan/kurum özel soru paketi | B4 | M |
| 3.5 D2: Blaze + Cloud Functions (ödül, puanlama, custom claim, temizlik), bütçe alarmıyla | D2 | L |

## 6. Başarı metrikleri

| Metrik | Bugün | Faz 1 sonu | Faz 2 sonu |
|---|---|---|---|
| Anonim oturumdan sahte ödül/puan | mümkün | kural testleriyle reddediliyor | — |
| 30 oyunculu lobi okuma/dk | ~3.720 | ≤ 150 | ≤ 150 |
| 30 kişi × 4 saat gece, toplam okuma | kota aşımı | ≤ 30.000 (kotanın %60'ı) | — |
| Bilinen sessiz permission-denied | 1 (emoji) | 0 + sözleşme testi | 0 |
| E2E kapsanan oyun modu | 0 / 15 | — | 15 / 15 |
| Player ilk yük (JS gzip + ilk görsel) | ~360 KB + ~0,8 MB | — | ≤ 300 KB + ≤ 150 KB |
| Prod yüksek seviye açık | 7 | 0 | 0 |

## 7. Risk kaydı

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Kural sıkılaştırması mevcut bir oyun akışını kırar | Yüksek | Yüksek | Her kural değişikliği ilgili istemci yolunun emulator testiyle aynı PR'da; 1.4 sözleşme testi önce |
| D1 (host = personel) mekan kurulumunu zorlaştırır | Orta | Orta | TV'de kalıcı oturum; personel girişi için QR |
| Şema göçü (`users_public`, `venues`) açık sekmelerdeki eski istemcileri kırar | Orta | Orta | Çift yazma dönemi; `staleChunk` yeniden yükleme zaten mevcut |
| Blaze maliyet sürprizi | Düşük | Orta | Bütçe alarmı; Functions'ta min instance 0 |

## 8. Sonraki adım

Faz 0 tek PR serisi olarak açılır: (a) saldırı senaryolarını kanıtlayan kırmızı
kural testleri, (b) kurallar, (c) istemci uyarlaması. **D1 kararı 0.2 ve 0.3'ün
ön koşuludur** — onay gelince başlanabilir.
