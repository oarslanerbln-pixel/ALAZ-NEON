# HENGAME — Oyun Tasarımı Değerlendirmesi ve Yol Haritası

Ekim 2026. 14 modun TV ve telefon ekranları sahte verilerle render edilip
kodla birlikte incelendi; ay sonunda katalog sadeleşti (§1). Bu belge "hangi
oyun ne işe yarıyor, gece nasıl akmalı, sırada ne var" sorularının tek cevap
yeri; yeni mod eklemeden önce oku.

## 1. Katalog — tür ve gecelik lig

Gecelik lig **F1 usulü**: her oyun bitince sıraya göre 25/18/15/12/10/8/6/4/2/1,
puan alamayan ya da ilk 10 dışı her katılımcıya 1. Takım modu artık
seçilemiyor (oda hep `individual`); eski takım odaları için "kazanan takımın
her üyesine 10" kuralı kodda duruyor. Ham oyun puanı gecelik skora girmez —
her oyun eşit ağırlıkta, "tutarlı olan şampiyon olur". Kod: `lib/nightLeague` (saf, testli),
`lib/nightAwards` (oda `night_awarded` bayrağıyla tek seferlik transaction).

| Oyun | Durum | Tür | Gecelik ligde sıra neye göre | Not |
|---|---|---|---|---|
| HENGAME ARENA | Oynanabilir | Bilgi · kelime | Oyun skoru | Klasik isim-şehir; en uzun mod |
| HENGAME QUIZ | Oynanabilir | Bilgi · hız | Oyun skoru (1000 + hız 100–500, seri ×1.2/×1.5; final ×2) | Gecenin omurgası |
| HENGAME BOMB | Oynanabilir | Kelime · gerilim | Dayanılan rakip sayısı | Bomba sahibi ayrılırsa devrediliyor; kategori yoksa odanın dilindeki hazır listeden |
| YÖRÜNGE SAPANI | Kilitli | Refleks · şut | Oyun skoru (gol başına 100) | Kodda duruyor; uçtan uca testi yeşil olana kadar kilitli |

**Kaldırılan modlar (Ekim 2026 sonu, ürün sahibinin kararı):** mekanda yalnız
uçtan uca test edilmiş üç mod kalsın; aşağıdakiler kodla birlikte silindi.
O anda bunlardan birini oynayan eski bir oda `isRetiredGame` korumasıyla
host'ta ana ekrana, misafirde lobiye düşer.

| Mod | Neden |
|---|---|
| SİBER NİŞANCI | Vuruş tespiti ve puanlama hiç yazılmadı; canlı nişan akışı Spark yazma kotasını dakikalar içinde bitirirdi |
| HENGAME SENSÖR | Buzzer oyuncunun oda belgesine yazmasına dayanıyordu; 21 görsellik dış bağlantılı havuz, uzun süre kilitliydi |
| NEON OVERLOAD | Bomb ile aynı sıcak patates mekaniği; savuşturma oda belgesine oyuncu yazımıydı |
| NEON SAVAŞLARI (Colors) | Her dokunuş oyuncu belgesine istemciden yazılıyordu (kota, hile yüzeyi); takım oyunu bireysel lige uymuyor |
| HENGAME ÇARK | Oyun değil ara gösteri; ödül zaten mekan ödül sistemiyle dağıtılıyor |
| NEON ŞİFRE (Vault) | Şifre herkese açık oda belgesinde duruyordu; konsoldan okunabiliyordu |
| NEON BİRLİK (Unity) | Kazananı ve lig puanı yoktu |
| NEON PULSE | Lig puanı yoktu; dokunuşlar oda belgesine oyuncu yazımıydı |
| NEON BAR | Skor oyuncu belgesine istemciden artırılıyordu (kural istisnası) |
| NEON KABLO | Bar ile aynı istemci tarafı skor istisnası |
| HENGAME ECHO | Puansız oylama; oylar oda belgesine oyuncu yazımıydı |
| HENGAME AYNA | Ayrı anket koleksiyonu/kuralı ve üç dilli büyük soru havuzu; uzun süre kilitliydi |
| NEON SPEKTRUM (daha önce) | Colors ile aynı mekanikti ve hiçbir puan/ödül vermiyordu |

Kaldırılan modların oyuncu yazma izinleri `firestore.rules`'tan da çıktı;
`test/firestore.rules.test.ts` artık bu yazımların reddedildiğini doğruluyor.

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
- **Tür rozetleri:** `GameCard.category` (Bilgi/Refleks/…) dashboard
  karuselinde görünüyor; karuselde oynanabilir modlar önce, kilitliler sonda.

## 3. Önerilen gece akışı (host için)

Enerji eğrisi: ısın → zirve → final. Örnek 90 dakikalık blok:

1. **Isınma (kelime, herkes yazar):** Arena
2. **Zirve 1 (bilgi):** Quiz
3. **Zirve 2 (gerilim):** Bomb
4. **Final:** Quiz (final turu ×2) → dashboard'dan "🏆 Gecenin finali"

## 4. Sıradaki adımlar

Karara bağlananlar (Ekim 2026): F1 usulü gecelik lig ✅, Spectrum kaldırıldı ✅,
katalog Arena/Quiz/Bomb'a indi, Yörünge Sapanı kilitli ✅ (§1).

**TV'de lig anı ✅** — podyumda her sütunda "+25 gece puanı" rozeti;
dashboard'daki gecenin liderleri listesi sıra değişince ▲/▼ gösteriyor
(`rankDeltas`).

**Telefonda lig ✅** — oyunlar arası lobide misafirin kendi gecelik sırası
ve puanı ("2. / 8 · 61 gece puanı"); lobinin mevcut oyuncu dinleyicisinden,
ek okuma yok. TV ve telefon aynı sırayı kullanır (`nightStandings`).

**Gece finali ✅** — dashboard'daki "🏆 Gecenin finali" düğmesi tam ekran
"Gecenin Şampiyonu" sahnesini açar (3. → 2. → şampiyon, konfeti, ilk 10);
oradan "Geceyi bitir" odayı kapatır. Yalnızca TV'de, oda durumu değişmez.
Dashboard başlığındaki çıkış düğmesi de aynı işi yapıyor ve artık
"GECEYİ BİTİR / NACHT BEENDEN / END NIGHT" diyor.

**Sapanın kilidini açmak için:** `e2e/game-modes.spec.ts`'teki atlanan
YÖRÜNGE SAPANI testini aç, yeşil olsun; sonra `gameCatalog.ts`'te
`isComingSoon: false` ve kilitli mod testini güncelle.

**P2 — Saat farkı** (aşağıda).

**P2 — Saat farkı.** Oyuncu nabzı (`presence/{uid}.last_active`) kendi
saatiyle yazılıyor; bomba hedef seçimi diğer telefonların saatini kıyaslıyor. Kalıcı çözüm:
heartbeat `serverTimestamp()` + her cihazda sunucu saati ofseti tahmini.
Şimdilik `activePlayers` güvenli tarafa düşüyor (kimse canlı görünmezse herkes).

## 5. Kontrol listesi — yeni mod eklerken

- [ ] Oyun skorunu `lib/scoreWrites`, bitişte gecelik ligi `finishNightRound` ile yazıyor; yeni oyun başlarken `NIGHT_ROUND_OPEN`.
- [ ] Telefonda bekleme/bitti ekranı `PlayerStageScreen`, TV açılışı `GameIntroCinematic`.
- [ ] Sahibi/hedefi olan bir oyuncu ayrılırsa oyun kilitlenmiyor (bkz. bomba devri).
- [ ] Saniyede 3'ten fazla parlama, siren, alarm dili yok.
- [ ] Mevcut bir modla aynı mekanik değil; değilse tür etiketini belirle.
