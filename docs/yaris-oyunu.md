# HENGAME NOVA — zarlı takım yarışı (17.11.2026)

Durum: **uygulandı.** Kararlar 17.11.2026'da önerildiği gibi onaylandı (§7).
Kod: `src/lib/race.ts` (kurallar, saf ve testli), `src/lib/raceLayout.ts`
(tahta geometrisi), `src/pages/host/race/`, `src/pages/player/race/`,
`e2e/nova.spec.ts`. Oyun kimliği `race`.

**Özgünlük sınırı.** İlham, zarla ilerlenen ve rakip piyonun başa gönderildiği
geleneksel yarış oyunları ailesi (Pachisi/Ludo türü). Belirli bir ticari ürünün
adı, tahta düzeni ya da görsel kimliği kopyalanmaz: tahta haç değil **çember**,
takımlar renkle değil **biçimle** ayrılır, kurallar parti için yeniden yazıldı
(eşzamanlı tur, oylama, altı beklemeden çıkış, tur sınırı).

## 1. Doğrulanan kısıtlar (17.11'de bakıldı)

| Konu | Bulgu | Sonuç |
|---|---|---|
| `answers` kuralı | Oyuncu yalnız kendi `player_id`'siyle yazar; alan denetimi yok; sahibi ve host okur | Piyon oyu `answers`'a yazılır, kural değişmez |
| `rooms` kuralı | Host her alanı yazar; oyuncu yazamaz (bomba pası hariç) | Zar ve tahta durumu odada, yalnız host yazar |
| Gece ligi | `lib/nightLeague.teamPoints`: kazanan takımın üyesine 10, diğerlerine 1 | Olduğu gibi kullanılır |
| Burç altyapısı | `lib/zodiac`, `lib/majority` yalnız taslak PR #384'te; `main`'de yok, burç seçme ekranı yazılmadı | v1 burç seçimine bağlanmaz (§3) |
| `majorityResult` | Tek oyu "sürü" saymaz (kazanan boş döner) | Piyon oyu için uygun değil; 1–2 kişilik takımın oyu da geçmeli → kendi sayımı |
| Blender | Eklenti bağlı değil (bağlantı hatası) | Düz SVG/Framer ile yapılır; varlıklar sonra (§6) |
| Ad çakışması | Katalogda kilitli "YÖRÜNGE SAPANI" var | "HENGAME Yörünge" karışır; başka ad (§7) |

## 2. Tahta

- **Halka:** 24 kareli çember. Dört **kapı** eşit aralıklı (0, 6, 12, 18).
- **İniş yolu:** her kapıdan merkeze 2 kare; yalnız o takım girer, güvenlidir.
- **Çekirdek:** merkez; piyonun vardığı yer ("ev").
- **Üs:** her takımın halka dışındaki bekleme yeri.
- Bir piyonun yolu: üs → kendi kapısı → halkada tam tur (24) → iniş (2) →
  çekirdek. Toplam 27 adım.

## 3. Takımlar

- En çok 4 takım: **Ateş ▲, Toprak ■, Hava ●, Su ◆.** Oyun başlarken host
  oyuncuları dengeli dağıtır (oyuncu kimliğine göre sıralı, deterministik);
  2–3 oyuncuda takım sayısı oyuncu sayısı kadar. En az 2 oyuncu.
- Sonradan katılan en küçük takıma eklenir. Ayrılan oyuncu oyunu kilitlemez
  (oy sayımı kalanlarla yapılır, kimse oy vermezse otomatik hamle).
- Burç seçimi yok: ek adım istemez, #384'e bağlamaz. Takım kimlikleri
  `fire/earth/air/water`; #384 girince `elementTeams` seçenek olarak takılabilir.

## 4. Kurallar

1. **Tur:** host dört zarı birden atar (takım başına bir zar).
2. **Oy:** her takım telefonda oynayacak piyonu seçer (8 sn; herkes oy verince
   erken kapanır). En çok oyu alan piyon oynar; eşitlikte daha ilerideki; hiç oy
   yoksa en ilerideki geçerli piyon.
3. **Çıkış:** üsteki piyon her zarla çıkar (altı beklenmez).
4. **Sıra:** hamleler TV'de tek tek oynatılır; başlayan takım her tur değişir.
5. **Eve gönderme:** halkada rakibin üstüne gelen piyon onu üssüne yollar
   (oyunun "wow" anı). Kendi piyonunun üstüne gelinemez. İniş yolu güvenli.
6. **Altı:** aynı piyon bir zar daha oynar (tur başına en çok bir kez).
7. **Varış:** çekirdeğe tam sayı şartı yok.
8. **Bitiş:** iki piyonunu çekirdeğe ilk sokan takım kazanır. **Ani bitiş:**
   18. tur sonunda en ilerideki takım (önce evdeki piyon, sonra toplam adım;
   eşitlikte ortak galibiyet).

**Puan.** Gece ligi: kazanan takımın her üyesine 10, diğerlerine 1
(`teamPoints`). Oyuncu belgesine oyun skoru yazılmaz (her yazım odadaki
telefonlara okuma düşürür); sıralama odadaki tahtadan hesaplanır. Telefondan
beyan yok, zar host'ta. Mekan ödülü yok.

**Oy.** `answers/{oda}_{oyuncu}_race-{oyun}-{tur}`: kimlik sabit olduğu için
aynı tura ikinci oy "güncelleme" sayılır ve kural reddeder.

## 5. Akış ve durumlar

`race_intro` (takımlar + kurallar, `GameIntroCinematic`) → [`race_vote` (zarlar,
oy) → `race_move` (hamleler oynatılır)] × tur → `race_finished` (kazanan takım).
Dört durum da `HostDisplay` ve `PlayerGame` tarafında ele alınır.

- TV: SVG tahta, zar, kare kare piyon hareketi, eve gönderme anı, kazanan.
- Telefon: takımın zarı + piyon düğmeleri (büyük dokunma hedefi); oy sonrası ve
  hamle sırasında `PlayerStageScreen`.
- Tur başına 2 oda yazımı. 40 telefon × 18 tur için kaba hesap: ~1.500 oda
  okuması + ~720 oy yazımı + host'un ~720 oy okuması (Spark günlük sınırı 50 bin
  okuma / 20 bin yazma). `e2e/cost.spec.ts` ile ölçülecek.

**Süre (benzetim, 5.000 oyun; `race` kuralları, açgözlü oyuncu):**

| Kurulum | Ortanca tur | %10–%90 | Yakalama/oyun | ≤18 turda doğal bitiş |
|---|---|---|---|---|
| 4 takım, 2 piyon, 24 kare (öneri) | 16 | 11–24 | 12 | %66 (14 turda %35, 22 turda %85) |
| 4 takım, 3 piyon, ikisi eve | 19 | 12–30 | 17 | %49 |
| 4 takım, 3 piyon, üçü eve | 30 | 21–43 | 25 | çok uzun |

Tur süresi **tahmin** ~20–25 sn (zar 2 + oy 8 + dört hamle); 18 tur ≈ 6–7,5 dk.
Gerçek tur süresi E2E'de ölçülüp tur sınırı ona göre ayarlanır.

## 6. Görsel dil ve varlıklar

Tahta düz SVG: gece göğü zemini (tohumlu, sabit 90 yıldız), yörünge bandı,
sekiz köşeli yıldız çekirdek, hamle izi (geçilecek kareler + varış halkası),
yakalamada tek seferlik halka patlaması, bir kez yuvarlanan zar, kazananda
konfeti. SVG filtresi/bulanıklık yok (yazılım çiziminde pahalı).

`docs/motion-system.md` §6: düz kart, TV'de en küçük 24 px, sonsuz döngü yok,
ekran başına tek odak animasyonu. **Tek vurgu korunur:** takımlar biçimle
(▲ ■ ● ◆) ve adla ayrılır; `accent` yalnız o an oynayan takımda (telefonda
kendi takımında).

Blender açılınca (yerel, ücretsiz render; gelene kadar SVG/Framer yedeği):

| Varlık | Biçim | Bütçe | Kullanım |
|---|---|---|---|
| Zar yuvarlanışı (6 sonuç) | şeffaf webm, ~1 sn, TV | ≤ 600 KB | `race_vote` |
| Eve gönderme parlaması | şeffaf webm, ~1,5 sn, TV | ≤ 400 KB | yakalama anı |
| Tahta zemini (gece göğü) | webp, TV | ≤ 120 KB | tahta arkası |

Telefonda video yok. Bütçe: ilk yük ≤ 385 KB gz, GPU'suz TV 1080p ≥ 24 fps.

## 7. Kararlar (onaylanan: "Öneri" sütunu)

| Karar | Öneri | Seçenekler |
|---|---|---|
| Ad | **HENGAME NOVA** (üç dilde aynı) | HENGAME KERVAN · HENGAME HALKA |
| Takım | 4 takım, otomatik dengeli | Burç seçimiyle element takımı (#384 sonrası) |
| Piyon | Takım başına 2, 24 kare | 3 piyon, ikisi eve (daha uzun, daha çok seçim) |
| Süre | 18 tur sınırı (~6–7,5 dk) | 14 tur (~5 dk) · 22 tur (~8–9 dk) |
| Ödül | Yalnız gece ligi puanı | Kazanan takımın her üyesine mekan ödülü (takım 10 kişi olabilir) |

## 8. Ölçümler (17.11.2026, yerel)

| Ölçüm | Sonuç | Sınır |
|---|---|---|
| İlk yük (`scripts/audit/bundle-size.mjs`) | 349,1 KB gz (öncesi 347) | ≤ 385 KB |
| NOVA parçaları (tembel) | TV 6,1 KB + telefon 2,3 KB + kurallar 2,3 KB gz; Blender görselleri `public/race/` 26 KB | — |
| TV kare hızı, GPU'suz 1080p (`novaBoard`) | 35 ve 25 fps (iki tur); 4× CPU kısıtlı 39 ve 32 fps. Aynı turlarda quiz 38–39 fps | ≥ 24 fps |
| TV kare hızı, GPU'suz 4K | 26 ve 20 fps (aynı turlarda quiz 19 ve 13 fps) | hedef 1080p |
| TV taşması (1080p, 4K) | yok | yok |
| Tur süresi, 4 takım, herkes hemen oy verince | 10,1 sn | — |
| Birim / kural / uçtan uca | 364 / 98 / 20 geçti (sapan testi kilitli, atlanıyor) | hepsi yeşil |

Tur süresi tahminden (~20–25 sn) kısa çıktı: en uzun tur oy süresi (8 sn) +
oynatma (~6–8 sn) ≈ 15 sn. 18 tur sınırıyla oyun ~3–4,5 dk + açılış (~10 sn)
sürer; 6–8 dk isteniyorsa `RACE_MAX_ROUNDS` 26–28 yapılabilir (tek sabit).

Kare hızı turları makine %40–65 CPU yükündeyken alındı (aynı makinede başka
işler çalışıyordu). %65–87 yükte NOVA ve quiz birlikte 21 fps'e düştü; o turlar
tabloya alınmadı. Pay ince: ikinci turda 25 fps. Sınırın altına düşerse ilk
aday, ayrı katmanda oynayan piyon görsellerini küçültmek.

Ekran görüntüleri: `docs/gorsel/nova/` (`E2E_SHOTS=1` ile `e2e/nova.spec.ts`
yeniden üretir).
