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

## 2. Tasarım Dili ve Estetik (DOOH & Neon Cyberpunk)

Projenin estetiği, nargile kafeler ve gece kulüpleri gibi loş ve hareketli mekanlara hitap etmelidir.

* **Renk Paleti:** Siyah arkaplan ağırlıklı. Vurgu renkleri (Neon Orange, Cyber Yellow, Magenta, Electric Blue).
* **Efektler:**
  * `Framer Motion` kullanılarak akıcı geçişler (AnimatePresence ile `wait` modunda) yapılmalıdır.
  * Neon parlamaları için `box-shadow` veya tailwind `drop-shadow` kullanılmalıdır.
  * Glassmorphism: Yarı saydam arka planlar (`bg-white/10`, `backdrop-blur-md`).
* **TV Ekranı (HostDisplay):**
  * Uzaktan rahat okunabilmesi için büyük fontlar (font-black, uppercase, tracking-widest).
  * Arka planda dinamik, dikkat çekici ama göz yormayan animasyonlar (örneğin Particle Background, Kinetic Spark).
* **Mobil Oyuncu Ekranı (PlayerGame):**
  * Kullanıcı dostu, büyük dokunmatik butonlar (iOS/Android uyumlu).
  * Titreşim geri bildirimi (`window.navigator.vibrate`) ve Emoji tepkileri gibi etkileşimi artıran mikro-etkileşimler.

## 3. Oyun İçi Modülerlik (Mini Oyunlar Ekleme)

Eğer sisteme yeni bir mini-oyun (Örn: Şarkı Tahmin, Hafıza Oyunu vs.) eklenecekse şu adımlar izlenir:

1.  **State Machine:** `types/database.ts` dosyasında `RoomStatus` veya `GameType` union tiplerine yeni oyununuzun adını ve statülerini ekleyin (Örn: `memory_active`).
2.  **Host Yönlendirmesi:** `HostDisplay.tsx` içinde `room.active_game === "memory"` ise doğrudan `<HostMemoryDisplay />` komponentini return edin. Bu sayede her oyun kendi Host mantığına sahip olur, core akışı kirletmez.
3.  **Player Yönlendirmesi:** `PlayerGame.tsx` içinde `room.active_game === "memory"` ise doğrudan `<PlayerMemoryController />` komponentini return edin.
4.  **Admin Paneli:** `VenueSettings.tsx` veya ilgili admin ayar kısmında oyunun aktiflik durumu, özel ayarları yönetilebilir yapılmalıdır.

## 4. Sponsor ve DOOH Reklam Ağları

Uygulamanın gelir modeli sadece yazılım satışından değil, reklam ağı (DOOH - Digital Out of Home) üzerinden gelir.
* **Uygulama İçi Reklamlar:** `HostAdBreak.tsx` gibi yapılar kullanılarak, iki oyun arası geçişlerde (`room.status === "ad_break"`) tam ekran veya popup sponsorluk reklamları zorunlu olarak oynatılmalıdır.
* Bu sistem, `VenueSettings.tsx` üzerinden yönetilebilir olmalı ve B2B satışı kolaylaştıracak bir argüman olarak "Kendini Amorte Eden" sistem mantığıyla kurulmalıdır.

## 5. Kritik Teknik Detaylar (Güvenlik ve Senkronizasyon)

* **Zamanlayıcı (Timer):** Geri sayımlar asla `setInterval` ile yerel olarak yönetilip bitince odayı statü değiştirmeye zorlamamalıdır. Host tarafında `round_end_time` Firestore'a (timestamp olarak) basılır. Hem Host hem Player bu timestamp'i referans alarak kendi lokal `setInterval`'leri ile kalan süreyi hesaplar (Optimistic UI). Böylece cihaz saat farklılıkları ve anlık kopmalar tolere edilir.
* **Hile Koruması:** `Sentinel` adlı özel sistemle hileli oyuncular shadow-ban (hayalet ban) edilir, cevapları veritabanına yazılsa bile Host değerlendirmesinde yok sayılır.

## Kullanım Kılavuzu

Yeni bir ALAZ NEON kopyası, farklı bir gece kulübü oyunu veya interaktif bir B2B sunum sistemi yazarken, AI asistanı olarak **önce bu dökümanı okuyup**, yeni geliştirmeleri bu prensiplere (Firestore pub/sub modeli, Host-Driven State Machine, Cyberpunk Neon estetiği) uygun şekilde kodlamalısınız.
