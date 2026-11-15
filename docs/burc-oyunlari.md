# Burç temalı üç grup oyunu — taslak (15.11.2026)

Durum: **taslak, onay bekliyor.** Yalnızca ortak saf mantık (`src/lib/zodiac.ts`,
`src/lib/majority.ts`) yazıldı; ekran yok, katalogda kart yok.

## 1. Doğrulanan kısıtlar (varsayım değil, 15.11'de bakıldı)

| Konu | Bulgu | Sonuç |
|---|---|---|
| Çalışma ortamı | React + Framer Motion, ilk yük 347 KB gz; GPU'suz TV'de gece lobisi 60, quiz 26–28 fps | Oyunlar web'de kalır |
| Blender | Eklenti bağlı değil (bağlantı hatası) | Varlık üretimi Blender açılınca |
| Godot | 4.7.2 kurulu, MCP yanıt veriyor | Çalışma anında kullanılmıyor (aşağıda) |
| Unity | MCP sunucusu ayakta, açık editör yok (`instance_count: 0`) | Çalışma anında kullanılmıyor |
| `players` kuralı | Katılım kaydı yalnız 8 alanı kabul ediyor; `zodiac` alanı reddedilir | Burç `answers` ile gönderilir, kural değişmez |
| `answers` kuralı | Cevabı yalnız sahibi ve host okur | Gizli seçimler (Uyum Testi) güvenli |
| `rooms` kuralı | Host her alanı yazabilir | Yeni alanlar için kural değişikliği gerekmez |

**Unity / Godot kararı.** Telefon QR ile saniyeler içinde katılıyor; Unity WebGL
10–30 MB, Godot web 25–40 MB indirir ve Godot 4 iş parçacıkları için hosting'de
COOP/COEP başlıkları ister. Bu yüzden ikisi de **çalışma anına girmez**. Üst düzey
görüntü, Blender'da önceden render edilip webp/webm olarak gelir (çalışma anında
sıfır 3D maliyeti). İleride denenebilecek tek istisna: yalnız TV'de çalışan tek bir
sahne. O da ancak GPU'suz TV'de ölçülüp ≥24 fps verirse.

**Kişisel veri.** Doğum tarihi sorulmaz; misafir burcunu 12'li ızgaradan seçer.
Burç yalnız o gecenin oda kaydında durur.

## 2. Ortak altyapı

- **Burç seçimi:** burç oyunu açılınca telefon 12 burcu gösterir (seçim telefonda
  hatırlanır). Telefon `answers`'a `{ type: "zodiac", sign }` yazar; host bunları
  `rooms.zodiac_signs` haritasına toplar. TV'de çark dolar.
- **Element takımları:** Ateş (Koç, Aslan, Yay), Toprak (Boğa, Başak, Oğlak),
  Hava (İkizler, Terazi, Kova), Su (Yengeç, Akrep, Balık). Tek kişilik takım
  kalmasın diye küçük gruplar birleştirilir; yeterli element yoksa iki dengeli
  takım (Güneş / Ay). Mantık: `lib/zodiac.elementTeams`.
- **Puan:** oyun içi puan `lib/scoreWrites`, gece ligi `finishNightRound` (mevcut).
- **Görsel dil:** `docs/motion-system.md` §6 (tek vurgu, TV'de min. 24 px, sonsuz
  döngü yok). Her oyunda tek "wow" anı, Blender varlığıyla; yoksa düz yedeği.

## 3. Oyunlar

### A. Hangi Burç? — ısınma, en az iş

"Mesaja üç gün sonra cevap yazan burç hangisi?" Dört burç şıkkı çıkar, herkes
oylar. **Doğru cevap yok: çoğunlukla aynı şıkkı seçen puan alır.** En çok oyu alan
burcun misafirleri TV'de gösterilir (gülüşme anı).

- Akış: burç seçimi → soru (15 sn) → oy dağılımı → sıralama; 8 soru, ~6 dk.
- Telefon: quiz ile aynı dört şık.
- Puan: en kalabalık gruptakilere 100; beraberlikte tüm üst gruplar; herkes farklı
  seçtiyse puan yok (`lib/majority`).
- Yeniden kullanım: quiz'in soru, süre, cevap ve açıklama akışı; yalnız puanlama farklı.
- Gereken: ~40 soruluk havuz (tr/de/en), iğnelemeyen, oyuncu bir dil.
- Risk: sorular klişeye kaçıp kırıcı olabilir → havuz elden geçirilir.

### B. Uyum Testi — sosyal, orta iş

Çark iki misafir seçer. İkisine aynı üç "bu mu, şu mu" sorusu gizlice sorulur
(çay mı kahve mi). **Salon aynı anda tahmin eder: kaç cevap tutacak?** Sonra
cevaplar tek tek açılır, uyum yüzdesi çıkar.

- Akış: eşleşme → 3 soru (çift cevaplar, salon tahmin eder) → açıklama; 5–6 çift, ~8 dk.
- Telefon: çiftte iki büyük düğme; salonda 0/1/2/3 tahmini.
- Puan: çifte tutan her cevap için 50; doğru tahmin edene 100.
- Yeni durumlar: `match_pick`, `match_question`, `match_reveal` (TV ve telefonda
  birlikte ele alınmalı, yoksa siyah ekran).
- Risk: en az 3 oyuncu gerekir; aynı kişi iki kez seçilmemeli (adil sıra).

### C. Yıldız Kayması — zirve, orta iş

Element takımları yarışır. TV'de takımyıldız çizilir; **yıldız kaydığı an herkes
düğmeye basar.** Erken basan o turu yakar. Bazı turlarda sahte yıldız (basma!).
Takımın ortalama tepki süresi turu kazanır.

- Akış: takımlar → 7 tur (her biri ~12 sn) → kazanan takım; ~4 dk.
- Telefon: tek büyük düğme.
- Adalet: tepki süresi telefonun sinyali **gördüğü andan** ölçülür (quiz'deki
  `lib/countdown` yaklaşımı); ağ gecikmesi kimseyi cezalandırmaz.
- Puan: tur kazanan takımın üyelerine 100; gece liginde `teamPoints`.
- Risk: süreyi telefon bildirdiği için kurcalanmış istemci hile yapabilir. Host
  100 ms altını sayar saymaz; yine de **bu oyun ödül kazandırmamalı**.

## 4. Gece akışı ve sıra

Önerilen akış: A (ısınma) → C (zirve) → B (nefes, sosyal).
Önerilen yapım sırası: **A → B → C** (A quiz altyapısını kullandığı için en hızlı
ve en az riskli; önce onunla burç seçimi ve çark sınanır).

## 5. Blender varlık listesi (Blender açılınca; yerel, ücretsiz render)

| Varlık | Biçim | Bütçe | Kullanım |
|---|---|---|---|
| 12 burç amblemi | tek webp atlas | ≤ 150 KB | TV ve telefon |
| Burç çarkı dönüşü | webm, 3–4 sn, TV | ≤ 1 MB | Burç seçimi, eşleşme |
| Yıldız kayması + parlama | şeffaf webm, 2 sn, TV | ≤ 600 KB | Oyun C |
| İki kürenin birleşmesi | şeffaf webm, 2 sn, TV | ≤ 600 KB | Oyun B açıklama |

Telefonda video yok; yalnız amblem atlası. Varlık gelene kadar ekranlar düz
SVG/Framer yedeğiyle çalışır.

## 6. Bütçe (her PR'da ölçülür)

İlk yük ≤ 385 KB gz · GPU'suz TV 1080p ≥ 24 fps · telefonda Three.js/video yok ·
E2E yeşil · yeni her oyun için uçtan uca test.
