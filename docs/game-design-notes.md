# HENGAME — Oyun Tasarım Notları ve Geliştirme Yol Haritası

> Yaşayan doküman. Kod denetimi (Eylül 2026) sırasında her oyunun host/player
> çifti okunarak çıkarıldı. Her maddenin kaynağı kodda; "yapıldı" işaretli
> olanlar bu denetimin PR'ında düzeltildi. Yeni bir oyun işine başlamadan önce
> ilgili bölümü okuyun, bitirince güncelleyin.

## 1. Tasarım çerçevesi

HENGAME bir **kafe/bar parti oyunu**: bir TV (host), 2–30 misafir telefonu,
arka planda müzik ve sohbet. Mobil F2P ölçütleri (D1/D7, ARPDAU) burada geçerli
değil; ölçü **"masa bir sonraki oyunu istiyor mu?"** sorusu.

Her oyunu şu üç soruyla değerlendiriyoruz:

| Soru | Neden |
|---|---|
| **10 saniyelik döngüde bir KARAR var mı?** | Kararsız etkileşim (sadece dokun, sadece bekle) animasyondur, oyun değildir. |
| **Gerilim kaynağı ne?** | Zaman, risk/ödül, bilgi, sosyal baskı. En az biri, tercihen ikisi. |
| **TV'de izleyen de eğleniyor mu?** | Kafede sırası gelmeyen/oynamayan da ekrana bakıyor. Seyirci değeri, parti oyununun satış noktası. |

Döngü katmanları:

- **Anlık (10 sn):** oyunun kendisi.
- **Oyun (3–8 dk):** tur yapısı, skor tablosu, kazanma anı.
- **Gece (1–3 saat):** ✅ *Gecenin Şampiyonu* (bu denetimde eklendi, bkz. §3).
  Eskiden yoktu; oyunlar birbirinden kopuktu.
- **Mekân (haftalar):** lig/sezon, ödül kuponları. Altyapı var, ilgi zayıf (bkz. §4).

## 2. Oyun oyun durum ve öneriler

Öncelik: **P1** = yüksek etki / düşük-orta iş, **P2** = orta, **P3** = fikir.

### 2.1 Kelime Arenası (scattegories)

- **Döngü:** harf → kategoriler için kelime yaz → erken gönder bonusu / joker riski → inceleme.
- **Karar:** erken gönderip +15 almak mı, daha çok kategori doldurmak mı; jokeri nereye koymak (×2 / −10).
- **Durum:** ✅ 2. tur çökmesi, host yenilemesinde erken bitiş, eski cevapların puanlanması, elle düzeltmede joker/yazım hatası kaybı düzeltildi. Dil/yazım hatası denetimi (PR #286) var.
- **P1 — İnceleme ekranında "tartışmalı cevap" oylaması:** host tek tek onaylamak yerine şüpheli cevaplar (yazım hatası, yabancı dil, sözlükte yok) TV'de gösterilsin, misafirler 5 sn'de 👍/👎 versin. Hakem yükü azalır, en eğlenceli an (itiraz) oyunlaşır.
- **P2 — Benzersiz cevap vurgusu:** incelemede sadece o oyuncunun bulduğu cevaplar ışıklı gösterilsin (seyirci değeri; "bunu kim düşündü?!").
- **P3 — Kategori destesi:** mekâna/geceye özel tematik kategori paketleri (Berlin, 90'lar, futbol).

### 2.2 Quiz

- **Döngü:** soru → 4 şık → hız bonusu + seri çarpanı → dağılım gösterimi.
- **Karar:** hızlı mı, emin mi cevaplamak (hız sırası +500…+100, seri ×1.2/×1.5).
- **Durum:** ✅ "Final çift puan" ayarı artık uygulanıyor; cevapsız kalan oyuncunun serisi bozuluyor. Zamanlar sunucu saatiyle (adil).
- **P1 — Seri görünürlüğü:** 3'lü seriye ulaşan oyuncunun adı TV'de alevli kısa bir bantla çıksın (sosyal ödül, sıfır kural değişikliği).
- **P2 — Soru havuzu:** TR 22 / DE 16 / EN 13 soru → 3–5 gece yetiyor. Kafe müdavimleri tekrar görecek. Hedef dil başına ≥150.
- **P3 — "Yanlış cevabı seç" jokeri:** bir oyuncu bir kez, rakiplerin ekranında bir şıkkı karartır.

### 2.3 Sensör (bulanık görsel)

- **Döngü:** görsel yavaşça netleşir → ilk basan tahmin eder → host doğru/yanlış der.
- **Karar:** ✅ *yeni* — erken basmak çok puan (1000), beklemek güvenli ama puan erir (200'e kadar); yanlış cevap o görselde kilitler.
- **Durum:** ✅ Yanlış cevap sonrası görselin baştan bulanıklaşması, sabit 100 puan / düğmede "+1000", ayar süresinin yok sayılması, "kimse bilemedi" yolunun olmaması düzeltildi.
- **P1 — Görsel havuzu:** yalnızca 21 görsel; bir gece 5'er görselle 4 oyun oynanınca tekrar başlar. Hedef ≥100, kategorilere ayrılmış.
- **P2 — Cevabı otomatik ön değerlendirme:** `lib/answerLanguage` + bulanık eşleşmeyle "muhtemelen doğru/yanlış" önerisi, host tek dokunuşla onaylasın.
- **P3 — Ses turu:** görsel yerine 10 sn'lik şarkı girişi (lisans sorunu çözülürse).

### 2.4 Bomba (kategori + sıcak patates)

- **Döngü:** elinde bomba → kategoride kelime yaz → rastgele birine at → süre biterse can gider.
- **Karar:** zayıf — hedef rastgele. Tek karar "hangi kelime".
- **Durum:** ✅ Can sayısı ve fitil ayarı artık uygulanıyor; önceki oyunda elenenler yeni oyuna alınıyor.
- **P1 — Hedefi oyuncu seçsin:** pas atarken 2 rastgele aday arasından seçim ("kime atsam?"). Sosyal gerilim ve ittifaklar; en ucuz karar ekleme yolu.
- **P2 — Gizli fitil modu (klasik Tick-Tack-Bumm):** her pasta sayaç sıfırlanmak yerine tur için gizli rastgele toplam süre (20–60 sn). Patlama anı herkes için sürpriz olur; şu an patlama yalnızca "kelime bulamayan" oyuncuda oluyor.
- **P2 — Kelime doğrulama:** bomba kelimesi de `judgeAnswer` ile dil kontrolünden geçsin (şu an yalnızca küfür/anlamsızlık).

### 2.5 Overload (voltaj)

- **Döngü:** hedef sensin → savuştur düğmesine bas → sayaç her pasta kısalır → süre biterse elenirsin.
- **Durum:** ✅ Bitmiş oyunun geri açılması, "oyunu bitir"in geri alınması, telefonu kilitli oyuncular yüzünden haksız ödül düzeltildi.
- **P1 — Savuşturmaya beceri ekle:** tek dokunuş yerine kısa bir refleks görevi (ekranda beliren renge bas / 3 dokunuşluk sıra). Şu an "düğmeye bas" kararsız.
- **P2 — Hayatta kalan sayısı ≤3 iken TV'de yüz yüze düello sunumu.**

### 2.6 AYNA (tahmin + salon anketi)

- **Döngü:** "Dünyada X yüzde kaç?" / "Bu salonun yüzde kaçı…?" → kaydırıcıyla tahmin → gerçek.
- **Durum:** ✅ Aynı gece ikinci AYNA'nın eski cevapları/anketi devralması düzeltildi. Transaction korumaları sağlam; en iyi yazılmış oyun.
- **P2 — "Kimin tahmini en uzak" anı:** açıklamada en uzak tahmin de gösterilsin (mizah).
- **P3 — Mekân sahibinin kendi salon sorularını yazması.**

### 2.7 Renkler (halat çekme)

- **Döngü:** takımını seç → olabildiğince hızlı dokun → ibre bir uca.
- **Karar:** yok (saf hız). Bu türde normal, kısa tutulmalı.
- **Durum:** ✅ İkinci oyunun anında bitmesi, hevesli oyuncunun dokunuşlarının kaybolması, bombada elenenlerin dışlanması, sonsuza dek süren eşit maçlar (süre sınırı), sahte "süreli" ayarı, takımın tamamına kupon (artık MVP'ye) düzeltildi.
- **P1 — Kişi başı normalize:** tek sayılı kadroda bir takım bir kişi fazla; ibre toplam yerine takım ortalamasıyla hesaplansın.
- **P2 — Son 10 sn "çılgın mod":** dokunuşlar ×2 (geriden gelme şansı; comeback mekaniği).

### 2.8 Spektrum (takım gücü)

- **Durum:** ✅ Her dokunuşta yazma (kota riski) giderildi.
- **Not:** Renkler ile mekaniği neredeyse aynı (iki takım, dokunma yarışı). **Öneri:** ikisini tek oyunda birleştirmek ya da Spektrum'a farklı bir karar eklemek (ör. her takım 3 sn'lik "kalkan" kullanıp rakibin dokunuşlarını boşa çıkarsın). Aynı his iki kartta, gecenin çeşitliliğini azaltıyor.

### 2.9 Birlik (ortak hedef)

- **Durum:** ✅ Hiç çalışmıyordu (panelden açılınca tanıtımda takılı, dokunuşlar kurallarca reddediliyor). Düzeltildi; ortak hedef tutarsa herkes 3 gece puanı alıyor.
- **P2 — Sadece dokunma yerine rol:** ekip üyelerine farklı görevler (biri doldurur, biri tutar); yoksa Renkler'in tek takımlı hâli.

### 2.10 Şifre (vault)

- **Döngü:** 4 haneli kodu Wordle geri bildirimiyle çöz; ilk bilen kazanır.
- **Durum:** ✅ Hiç çalışmıyordu (tanıtımda takılı). Önceki kodun tekrar kullanılması ve +500'ün tekrar yazılması düzeltildi.
- **Bilinen sınır:** geri bildirim telefonda hesaplandığı için kod oda dokümanında açık; teknik bir misafir okuyabilir. Ödül vermediği sürece kabul edilebilir; ödül bağlanacaksa tahmin değerlendirmesi host'a taşınmalı.
- **P1 — TV'de canlı "en yakın tahmin" tablosu:** seyirci değeri; şu an TV yalnızca tahmin listesini gösteriyor.

### 2.11 Kablo (boru bulmacası)

- **Döngü:** 3×3 kabloları döndür → devreyi tamamla → ortak hedef 40.
- **Durum:** yalnızca **2 bulmaca şablonu** var; birkaç çözümden sonra ezber.
- **P1 — Prosedürel bulmaca üretici** (geçerli yol üret → parçaları karıştır); saf fonksiyon + çözülebilirlik testi.
- **P2 — Hedef oyuncu sayısına göre** (şu an sabit 40; 3 kişiyle uzun, 20 kişiyle saniyeler).

### 2.12 Bar (tarif hafıza)

- **Durum:** ✅ Tarif hızı ayarı artık uygulanıyor.
- **P2 — Tarif değişiminin ortasında kalan oyuncu:** tarif 4,5 sn'de bir değişince yarım kalan dizi boşa gidiyor; değişim, oyuncu kendi dizisini bitirene kadar ona eski tarifi göstermeli.

### 2.13 Echo (kim daha çok…?) · Pulse (senkron dokunuş) · Çark

- **Echo:** sosyal oylama; soru havuzu yalnızca 6 soru. **P1:** ≥40 soru, mekân tonuna uygun (kırıcı olmayan).
- **Pulse:** ⚠️ dokunuş zamanı **telefon saatiyle** yazılıyor; cihaz saatleri saniyelerce kayabildiği için "senkron" ölçümü güvenilmez. **P1:** tur başlangıcını her telefonun kendi aldığı an kabul edip göreli süre (performance.now) gönder; ağ gecikmesi hatası, saat kaymasından çok daha küçük.
- **Çark:** ✅ Hiç çevrilemiyordu (kural yoktu) ve ödülü telefon seçiyordu; artık istek + TV seçimi. **P2:** kazanılan dilim otomatik ödül kuponuna dönüşsün (şu an personel TV'ye bakıp sözlü veriyor). Varsayılan dilim metinleri yalnızca Türkçe; mekân ayarlarında dil başına metin gerekli.

## 3. Gece katmanı — Gecenin Şampiyonu ✅

`lib/nightScore.ts`, `hooks/useNightScoreAward.ts`.

- Her oyun bitince sıralama puanı **10/7/5/3/2**, oynayan herkese **1**.
- **Neden sıralama:** oyunların ölçekleri uyumsuz (quiz sorusu ~1500, Arena turu ~20). Ham toplamda gece şampiyonu hep quiz uzmanı olurdu.
- Takım oyununda kazanan takım birinci; Birlik ortak başarıda herkese 3; Çark (şans) ve Echo (oylama) puan vermez.
- Oyun örneği başına **tek kez** (transaction + `night_awarded_key`).

**Sonraki adımlar:**

- **P1 — Gece finali:** host "geceyi bitir" dediğinde (şu an doğrudan kapanıyor) 20 sn'lik şampiyon sahnesi + kupon. Gecenin en güçlü "bir oyun daha" motivasyonu ve fotoğraf anı.
- **P1 — Oyun sonrası mini tablo:** her oyun bitişinde TV'de "gece sıralamasında kim kaç basamak yükseldi" (↑2, ↓1) animasyonu.
- **P2 — Geriden gelme:** gecenin son oyunu ×2 gece puanı (host seçeneği).

## 4. Mekân katmanı (lig, ödüller)

- **Lig puanı istemciden yazılıyor** (`usePlayer` → `users.total_lifetime_score`); kurcalanabilir. Blaze planına geçilmeden gerçek çözüm yok. O zamana kadar lig ödüle bağlanmamalı.
- **Sıralama sayfası** tüm `players` koleksiyonunu okuyor; veri büyüdükçe okuma kotası. Haftalık özet dokümanı (host yazar) ile değiştirilmeli.
- **Ödül ekonomisi:** Kuponlar artık yalnızca personel hesabıyla açılmış TV'den yazılabiliyor (PR #317). Mekân ayarına "gece başına en fazla N kupon" sınırı eklenmeli; şu an her oyun bitişi bir kupon üretebilir.

## 5. Ortak "juice" ve erişilebilirlik boşlukları

- **Ses:** TV'de her oyun kendi müziğini çalıyor; `sounds.*` tutarlı. Telefonlarda ses çoğunlukla kapalı → her kritik an **titreşim + renk** ile de verilmeli (Bomba'da var, Sensör kilidinde yok).
- **Kaybetme anı kısa, kazanma uzun olmalı:** Bomba patlaması ve Overload elenmesi 2,5 sn; iyi. Quiz doğru cevap açıklaması kısa, uzatılabilir.
- **Çeviri borcu:** Oyun içlerinde hâlâ sabit Türkçe metinler var (ör. Renkler "TIK", HostHeader'daki bazı düğmeler, Kiosk). `i18nKeys.test.ts` yalnızca anahtarları denetliyor, JSX içi sabit metni yakalamıyor. **P2:** JSX'te 3+ harfli büyük harf sabitlerini yakalayan bir lint kuralı.

## 6. Oynanış testi protokolü

Gerçek bir gece öncesi 6–8 kişiyle (tanıdık olmayan):

1. Açıklama yapmadan başlatın; her "ne yapacağım?" sorusunu not edin (her biri bir tasarım hatası).
2. Her oyunun sonunda tek soru: **"Bunu tekrar oynamak ister misin? (1–5)"**
3. Zaman damgalı gözlem: hangi anda kahkaha / hangi anda telefona bakıp sıkılma.
4. Gece sonunda: gece sıralamasının son 3 oyunda kararları değiştirip değiştirmediğini sorun ("sıramı korumak için…").

İzlenecek sayılar (Firestore'dan gece sonu raporuyla çıkarılabilir): oyun başına oyuncu katılım oranı, oyun başına ortalama süre, bir oyundan sonraki oyuna kalan oyuncu oranı (gece "tutunma"sı).
