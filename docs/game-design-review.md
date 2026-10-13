# HENGAME — Oyun Tasarımı Değerlendirmesi ve Yol Haritası

Ekim 2026. 14 modun TV ve telefon ekranları sahte verilerle render edilip
kodla birlikte incelendi. Bu belge "hangi oyun ne işe yarıyor, gece nasıl
akmalı, sırada ne var" sorularının tek cevap yeri; yeni mod eklemeden önce oku.

## 1. Katalog — tür ve gecelik lig

Gecelik lig **F1 usulü**: her oyun bitince sıraya göre 25/18/15/12/10/8/6/4/2/1,
puan alamayan ya da ilk 10 dışı her katılımcıya 1; takım oyununda kazanan
takımın her üyesine 10. Ham oyun puanı gecelik skora girmez — her oyun eşit
ağırlıkta, "tutarlı olan şampiyon olur". Kod: `lib/nightLeague` (saf, testli),
`lib/nightAwards` (oda `night_awarded` bayrağıyla tek seferlik transaction).

| Oyun | Tür | Gecelik ligde sıra neye göre | Not |
|---|---|---|---|
| HENGAME ARENA | Bilgi · kelime | Oyun skoru (takım modunda takım toplamı) | Klasik isim-şehir; en uzun mod |
| HENGAME QUIZ | Bilgi · hız | Oyun skoru (1000 + hız 100–500, seri ×1.2/×1.5; final ×2) | Gecenin omurgası |
| HENGAME AYNA | Bilgi · empati | Toplam tahmin puanı | Salon anketi: gece başına özgün içerik |
| HENGAME BOMB | Kelime · gerilim | Dayanılan rakip sayısı | Bomba sahibi ayrılırsa devrediliyor |
| HENGAME SENSÖR | Görsel · buzzer | Oyun skoru (doğru başına 100) | |
| NEON ŞİFRE (Vault) | Mantık · yarış | Şifreyi çözen 1., diğerleri katılım | |
| NEON SAVAŞLARI (Colors) | Takım · dokunma | Kazanan takım 10, diğerleri 1 | |
| NEON OVERLOAD | Refleks · sıcak patates | Hayatta kalan 1., sonra eleme sırasının tersi | |
| NEON BİRLİK (Unity) | Ortak · dokunma | — | Herkes birlikte; kazanan yok |
| NEON PULSE | Ortak · ritim | — | Zamanlama; bireysel sonuç var |
| NEON BAR | Hafıza · sıra | Tamamlanan kokteyl sayısı | |
| NEON KABLO | Bulmaca · takım | Bağlanan devre sayısı | Ortak hedef, bireysel katkı sıralanır |
| HENGAME ECHO | Sosyal · oylama | — | "Kim en çok…?" — puansız olması doğru |
| HENGAME ÇARK | Ödül · şans | — | Oyun değil, ara gösteri — puansız olması doğru |

**Kaldırılan:** NEON SPEKTRUM — Colors ile aynı mekanikti (iki takım, en çok
dokunan) ve hiçbir puan/ödül vermiyordu. O anda Spectrum oynayan eski bir oda
`isRetiredGame` korumasıyla host'ta ana ekrana, misafirde lobiye düşer.

## 2. Bu turda düzeltilenler (yol haritası P0)

- **Gecelik skor ölüydü:** `night_score`'a katılımdaki 0 dışında hiçbir yer
  yazmıyordu; TV ana ekranı gece boyu "0 Puan" gösteriyordu. Artık F1 usulü
  gecelik lig (§1); TV "gecenin liderleri"ni madalyalı sıralıyor. Kural
  testleriyle korunuyor (oyuncu yazamaz).
- **Bomba kilitlenmesi:** sahibi ayrılınca TV kararıp oyun duruyordu.
- **Bomba kendine dönüyordu:** canlılık süzgeci kimseyi bırakmazsa.
- **Alarm dili ve flaş:** "SİSTEM HACKLENDİ", siren, saniyede 4–5 parlama
  (WCAG 2.3.1) kaldırıldı; sinematik açılış misafire kuralı da öğretiyor.
- **Quiz son 5 sn uyarısı** hiç tetiklenmiyordu; saat farkından etkilenmeyen
  süre çubuğu geldi.
- **TV ana ekranı** açık pastel ve ağır blur filtreliydi; koyu premium sahne.
- **Tür rozetleri:** `GameCard.category` (Bilgi/Refleks/Takım/Sosyal/Ödül)
  dashboard karuselinde görünüyor; host gece akışını kartlardan okuyor.

## 3. Önerilen gece akışı (host için)

Enerji eğrisi: ısın → zirve → nefes → final. Örnek 90 dakikalık blok:

1. **Isınma (sosyal, düşük baraj):** Echo → Ayna (salon anketi herkesi katar)
2. **Zirve 1 (bilgi):** Quiz
3. **Nefes (ortak, kazanan yok):** Unity ya da Pulse
4. **Zirve 2 (gerilim):** Bomb ya da Overload
5. **Takım şovu:** Colors
6. **Final:** Quiz (final turu ×2) → Çark (ödül dağıtımı)

## 4. Sıradaki adımlar

Karara bağlananlar (Ekim 2026): F1 usulü gecelik lig ✅, Spectrum kaldırıldı ✅,
Bar ve Kablo lige girdi ✅.

**TV'de lig anı ✅** — podyumda her sütunda "+25 gece puanı" rozeti;
dashboard'daki gecenin liderleri listesi sıra değişince ▲/▼ gösteriyor
(`rankDeltas`).

**P2 — Telefonda lig.** Oyun sonu ekranında misafirin kendi "+N gece puanı"
ve gecelik sırası (şu an yalnızca TV'de).

**P2 — Saat farkı.** Oyuncu `last_active` kendi saatiyle yazılıyor; bomba ve
echo hedef seçimi diğer telefonların saatini kıyaslıyor. Kalıcı çözüm:
heartbeat `serverTimestamp()` + her cihazda sunucu saati ofseti tahmini.
Şimdilik `activePlayers` güvenli tarafa düşüyor (kimse canlı görünmezse herkes).

## 5. Kontrol listesi — yeni mod eklerken

- [ ] Oyun skorunu `lib/scoreWrites`, bitişte gecelik ligi `finishNightRound` ile yazıyor; yeni oyun başlarken `NIGHT_ROUND_OPEN`.
- [ ] Telefonda bekleme/bitti ekranı `PlayerStageScreen`, TV açılışı `GameIntroCinematic`.
- [ ] Sahibi/hedefi olan bir oyuncu ayrılırsa oyun kilitlenmiyor (bkz. bomba devri).
- [ ] Saniyede 3'ten fazla parlama, siren, alarm dili yok.
- [ ] Mevcut bir modla aynı mekanik değil; değilse tür etiketini belirle.
