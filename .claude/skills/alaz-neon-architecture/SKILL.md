---
name: alaz-neon-architecture
description: "Alaz Neon (Cafe Nightlife Game) projesinin mimarisi, senkronizasyon yapısı (Host-Player-TV), tasarım dili ve oyun döngüsü kurallarını anlatan yetenek paketi. Gelecekteki Firebase-React B2B uygulamaları için şablon niteliğindedir."
---

# ALAZ NEON Mimarisi ve Oyun Döngüsü

Bu yetenek, ALAZ NEON tarzı çok ekranlı (Tablet/Host + TV + Mobil/Oyuncu) ve Firebase tabanlı gerçek zamanlı etkileşimli B2B projeleri geliştirirken izlenmesi gereken kuralları, tasarım dilini ve mimari kararları kapsar.

## 1. Mimari Prensipler (Host - Player Senkronizasyonu)

ALAZ NEON tarzı oyunlarda cihazlar arası haberleşme Firestore üzerinden gerçekleşir. Sunucu (Backend) kodu yazılmaz (Firebase Spark Plan limitleri gereği). Tüm iş mantığı istemcilerde (Client) koşar, veri bütünlüğü ve senkronizasyon Firestore Snapshot dinleyicileri (React `useEffect` & `onSnapshot`) ile sağlanır.

* **Host (Yönetici & TV):** Oyunun state machine'ini (durum makinesini) yöneten TEK kaynaktır. `room.status` alanını güncelleyerek oyunu bir durumdan diğerine geçirir (Örn: `lobby` -> `tutorial` -> `playing` -> `review` -> `standings` -> `finished`).
* **Player (Oyuncu):** Oyuncunun cihazı pasiftir; sadece veritabanındaki `room.status` alanını dinler. Host'un tetiklediği statülere göre ekranlarını değiştirir (Örn: Host `playing` durumuna geçirdiğinde, oyuncunun ekranı da soru/cevap giriş arayüzüne döner).
* **Database Schema:**
  * `rooms`: Odaların ana bilgilerini, o anki aktif oyunu, süreyi ve state'i tutar.
  * `players`: Odadaki oyuncuları tutar.
  * `answers`: Oyuncuların verdikleri cevapları tutar (puanlama Host tarafında yapılır ve `players` dökümanlarına yansıtılır).

## 2. Tasarım Dili (v3 + "Lounge" yönü)

Tek doğruluk kaynağı `docs/motion-system.md` §6 ve onaylı yön belgesi
`docs/superpowers/specs/2026-11-15-lounge-yon-design.md`. Kısaca:

* **Sade ama premium.** Koyu nötr zemin, iki yüzey tonu, TEK vurgu rengi (mekânın rengi), Inter. Neon parlama, cam/bulanıklık (`backdrop-blur`), gradyan metin, parçacık arka planı YOK.
* **Hareket:** yalnız `transform`/`opacity`, geçişler ≤ 250 ms, ekran başına tek odak animasyonu, sonsuz döngü yok. "Wow" yalnız gecenin birkaç anında.
* **Yasak:** saniyede 3'ten fazla parlama, siren, "sistem hacklendi" türü alarm dili; savaş/siber jargon.
* **TV (1920×1080 sabit tuval, `TVScaleFrame`):** en küçük yazı 24 px; tuval içinde `md:`/`lg:`/`xl:` kırılımı kullanma (görünüm alanına bakar, tablet host'ta yerleşimi bozar).
* **Telefon:** bekle/hazırlan/bitti ekranları `PlayerStageScreen`; birincil geri bildirim titreşim.
* **Ses:** TV sesi mekânda açık da olabilir kapalı da; hiçbir bilgi yalnız sesle verilmez.

## 3. Yeni Oyun Modu Ekleme

`CLAUDE.md` → "Konvansiyonlar": `GameType` + `gameCatalog.ts` kartı +
`host/gameDisplays.ts` + `player/gameControllers.ts`. Hangi oyunun oynandığını
yalnız `lib/gameRouting.ts` çözer; `HostDisplay`/`PlayerGame` içine elle
`active_game === "…"` dalı ekleme. Kontrol listesi: `docs/game-design-review.md` §5.

## 4. Sponsor ve DOOH Reklam Ağları

Uygulamanın gelir modeli sadece yazılım satışından değil, reklam ağı (DOOH - Digital Out of Home) üzerinden gelir.
* **Uygulama İçi Reklamlar:** `HostAdBreak.tsx` gibi yapılar kullanılarak, iki oyun arası geçişlerde (`room.status === "ad_break"`) tam ekran veya popup sponsorluk reklamları zorunlu olarak oynatılmalıdır.
* Bu sistem, `VenueSettings.tsx` üzerinden yönetilebilir olmalı ve B2B satışı kolaylaştıracak bir argüman olarak "Kendini Amorte Eden" sistem mantığıyla kurulmalıdır.

## 5. Kritik Teknik Detaylar (Güvenlik ve Senkronizasyon)

* **Zamanlayıcı (Timer):** Geri sayımlar asla `setInterval` ile yerel olarak yönetilip bitince odayı statü değiştirmeye zorlamamalıdır. Host tarafında `round_end_time` Firestore'a (timestamp olarak) basılır. Hem Host hem Player bu timestamp'i referans alarak kendi lokal `setInterval`'leri ile kalan süreyi hesaplar (Optimistic UI). Böylece cihaz saat farklılıkları ve anlık kopmalar tolere edilir.
* **Hile Koruması:** `Sentinel` adlı özel sistemle hileli oyuncular shadow-ban (hayalet ban) edilir, cevapları veritabanına yazılsa bile Host değerlendirmesinde yok sayılır.

## Kullanım Kılavuzu

Yeni bir ALAZ NEON kopyası, farklı bir gece kulübü oyunu veya interaktif bir B2B sunum sistemi yazarken, AI asistanı olarak **önce bu dökümanı okuyup**, yeni geliştirmeleri bu prensiplere (Firestore pub/sub modeli, Host-Driven State Machine, sade tek vurgulu görsel dil) uygun şekilde kodlamalısınız.
