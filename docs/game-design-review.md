# HENGAME — Oyun Tasarımı Değerlendirmesi ve Yol Haritası

Ekim 2026. 15 modun TV ve telefon ekranları sahte verilerle render edilip
kodla birlikte incelendi. Bu belge "hangi oyun ne işe yarıyor, gece nasıl
akmalı, sırada ne var" sorularının tek cevap yeri; yeni mod eklemeden önce oku.

## 1. Katalog — tür, gecelik skora katkı, durum

| Oyun | Tür | Gecelik skora katkı | Not |
|---|---|---|---|
| HENGAME ARENA | Bilgi · kelime | ✅ tur puanları | Klasik isim-şehir; en uzun mod |
| HENGAME QUIZ | Bilgi · hız | ✅ 1000 (+hız 100–500, seri ×1.2/×1.5; final ×2) | Gecenin omurgası |
| HENGAME AYNA | Bilgi · empati | ✅ tahmin puanı | Salon anketi: gece başına özgün içerik |
| HENGAME BOMB | Kelime · gerilim | ✅ dayanılan rakip × 100 | Bomba sahibi ayrılırsa devrediliyor |
| HENGAME SENSÖR | Görsel · buzzer | ✅ doğru başına 100 | |
| NEON ŞİFRE (Vault) | Mantık · yarış | ✅ kazanan 500 | |
| NEON SAVAŞLARI (Colors) | Takım · dokunma | ✅ kazanan takım 150 | |
| NEON SPEKTRUM | Takım · dokunma | ❌ | Colors ile aynı mekanik (kırmızı/mavi, en çok dokunan) |
| NEON BİRLİK (Unity) | Ortak · dokunma | ❌ | Herkes birlikte; kazanan yok |
| NEON PULSE | Ortak · ritim | ❌ | Zamanlama; bireysel sonuç var, puan yok |
| NEON OVERLOAD | Refleks · sıcak patates | ❌ (yalnızca mekân ödülü) | Hayatta kalan puan almıyor |
| NEON BAR | Hafıza · sıra | ❌ (`bar_score` sayaç, toplama yansımıyor) | |
| NEON KABLO | Bulmaca · takım | ❌ (`kablo_score` sayaç) | |
| HENGAME ECHO | Sosyal · oylama | ❌ | "Kim en çok…?" — puansız olması doğru |
| HENGAME ÇARK | Ödül · şans | ❌ | Oyun değil, ara gösteri — puansız olması doğru |

**Gözlem:** 15 modun 8'i gecelik sıralamaya hiç dokunmuyor. Misafir için
"bu oyunu kazanmam bir şey değiştirir mi?" sorusunun cevabı tutarsız.

## 2. Bu turda düzeltilenler (yol haritası P0)

- **Gecelik skor ölüydü:** `night_score`'a katılımdaki 0 dışında hiçbir yer
  yazmıyordu; TV ana ekranı gece boyu "0 Puan" gösteriyordu. Artık puan veren
  her yol `lib/scoreWrites` kapısından geçiyor, TV "gecenin liderleri"ni
  madalyalı sıralıyor. Kural testleriyle korunuyor (oyuncu yazamaz).
- **Bomba kilitlenmesi:** sahibi ayrılınca TV kararıp oyun duruyordu.
- **Bomba kendine dönüyordu:** canlılık süzgeci kimseyi bırakmazsa.
- **Alarm dili ve flaş:** "SİSTEM HACKLENDİ", siren, saniyede 4–5 parlama
  (WCAG 2.3.1) kaldırıldı; sinematik açılış misafire kuralı da öğretiyor.
- **Quiz son 5 sn uyarısı** hiç tetiklenmiyordu; saat farkından etkilenmeyen
  süre çubuğu geldi.
- **TV ana ekranı** açık pastel ve ağır blur filtreliydi; koyu premium sahne.

## 3. Önerilen gece akışı (host için)

Enerji eğrisi: ısın → zirve → nefes → final. Örnek 90 dakikalık blok:

1. **Isınma (sosyal, düşük baraj):** Echo → Ayna (salon anketi herkesi katar)
2. **Zirve 1 (bilgi):** Quiz
3. **Nefes (ortak, kazanan yok):** Unity ya da Pulse
4. **Zirve 2 (gerilim):** Bomb ya da Overload
5. **Takım şovu:** Colors
6. **Final:** Quiz (final turu ×2) → Çark (ödül dağıtımı)

## 4. Sıradaki adımlar (karar bekleyenler — P1/P2)

**P1 — Her oyun gece için anlamlı olsun (ürün kararı gerekli).**
Seçenek A: puansız 6 moda Colors/Vault ölçeğinde puan (kazanan takım 150,
hayatta kalan 300, ortak başarı herkese 100). Basit, ama Quiz soru başına
~1500 verdiği için gecelik sıralamayı yine Quiz belirler.
Seçenek B (önerilen): **F1 usulü yerleşme puanı** — her oyun bitince
gecelik skora sıraya göre 25/18/15/12/10… eklenir, ham oyun puanı değil.
Her oyun eşit ağırlıkta olur; "tutarlı olan şampiyon olur" stratejisi doğar
ve TV'de tek cümleyle anlatılır. Uygulama: her modun bitişinde tek bir
`awardPlacements(ranking)` çağrısı (lib/scoreWrites'a eklenir).

**P1 — Katalog sadeleşmesi.** Spectrum ve Colors aynı mekanik (iki takım,
en çok dokunan). Birini kataloğdan kaldırmak ya da Spectrum'a farklı bir
kural (ör. hedef yüzdeyi tutturan takım kazanır) vermek seçimi kolaylaştırır.

**P2 — Dashboard'da tür etiketleri.** `GameCard`'a `category`
(Bilgi/Refleks/Takım/Sosyal/Ödül) ekleyip karuselde rozet olarak göstermek;
host gece akışını kartlardan okuyabilsin.

**P2 — Saat farkı.** Oyuncu `last_active` kendi saatiyle yazılıyor; bomba ve
echo hedef seçimi diğer telefonların saatini kıyaslıyor. Kalıcı çözüm:
heartbeat `serverTimestamp()` + her cihazda sunucu saati ofseti tahmini.
Şimdilik `activePlayers` güvenli tarafa düşüyor (kimse canlı görünmezse herkes).

## 5. Kontrol listesi — yeni mod eklerken

- [ ] Kazananı varsa puanı `lib/scoreWrites` üzerinden yazıyor (gecelik skor).
- [ ] Telefonda bekleme/bitti ekranı `PlayerStageScreen`, TV açılışı `GameIntroCinematic`.
- [ ] Sahibi/hedefi olan bir oyuncu ayrılırsa oyun kilitlenmiyor (bkz. bomba devri).
- [ ] Saniyede 3'ten fazla parlama, siren, alarm dili yok.
- [ ] Mevcut bir modla aynı mekanik değil; değilse tür etiketini belirle.
