# HENGAME "Lounge" yönü — tasarım belgesi

15.11.2026. Yön ve faz sırası ürün sahibince onaylandı. Bu belge "oyunu daha
klas ve profesyonel yapmak" işinin tek karar kaydıdır; her faz kendi planıyla
(`docs/superpowers/plans/`) uygulanır.

## Niyet

v3 sadeleştirmesi (bkz. `docs/motion-system.md` §6) efekt kalabalığını ve
kare hızı sorununu çözdü. Sonuç temiz ama sıradan bir yönetim paneli gibi
okunuyor. Hedef: misafirin "burası özenli bir yer" dediği, mekân sahibinin
kendi markası gibi sahiplendiği bir sahne. Klas his yeni efektten değil;
kimlik, tipografi, kompozisyon, ses ve birkaç imza anından gelir.

## Hedef, hedef dışı, başarısızlık

- **Hedef:** TV 3–4 m'den okunur; katılım masadan kalkmadan olur; tek marka,
  tek ton, üç dil eksiksiz; gecenin 3–4 anı akılda kalır.
- **Hedef dışı:** yeni oyun modu; oyun kurallarında ve skor ekonomisinde
  değişiklik; backend eklemek.
- **Başarısızlık sayılır:** v2'deki efekt kalabalığına dönmek; GPU'suz TV'de
  kare hızını düşürmek; saniyede 3'ten fazla parlama, siren, alarm dili;
  bilgiyi yalnız sesle vermek.

## Kısıtlar

- Mimari değişmez: host tek yazar, telefon aptal terminal, Spark planı.
- Animasyon yalnız `transform`/`opacity`; `backdrop-filter`, parlama gölgesi,
  gradyan metin yok (`docs/motion-system.md`).
- Kullanıcıya görünen her metin `t()` ile, tr/de/en birlikte.
- Ses iki durumda da doğru çalışır: TV mekân hoparlörüne bağlı olabilir de
  olmayabilir de (ürün sahibi, 15.11.2026). Yani ses açıkken tasarlanmış ve
  dengeli tınlar; kapalıyken hiçbir bilgi kaybolmaz. Telefonda birincil geri
  bildirim titreşimdir.

## Yaklaşımlar

| | Yaklaşım | Değerlendirme |
|---|---|---|
| A | **Lounge (seçildi)** — karakterli başlık yazı tipi + Inter, sıcak koyu zemin, geniş boşluk, az ama kusursuz hareket; şov enerjisi yalnız 3–4 imza anında; mekânın logosu ve adı ortak marka | v3'ün üstüne kurulur, GPU yükü eklemez, mekân türünden bağımsız yaşlanmaz |
| B | Stüdyo şovu — her oyuna renk dünyası, yoğun hareket ve geçiş | v2'deki kalabalığı ve GPU yükünü geri getirir; tek vurgu kuralını bozar |
| C | Tamamen nötr white-label — HENGAME geri çekilir | Satışı kolay ama ürünün karakteri kalmaz; A'nın ortak marka katmanı aynı faydayı verir |

## Kanıt (15.11.2026 ölçümü)

34 ekran (18 TV, 10 telefon, 6 masaüstü) `/__screens` önizlemesiyle sahte
veriyle render edildi; yazı boyutu, taşma, kare hızı ölçüldü.

| # | Bulgu | Kanıt |
|---|---|---|
| 1 | QR uzaktan okunmuyor | TV'de 90–240 px (55" 1080p'de 0,0635 cm/px → 6–15 cm). 10:1 kuralıyla 0,6–1,5 m; 3–4 m için 470–630 px. Kodun yazılacağı adres ekranda yok |
| 2 | Lobi bozuk görünüyordu | İsim rozetleri `vw/vh` yörüngesinde içeriğin üstüne biniyordu; sabit Türkçe metinler (Faz 0'da düzeldi) |
| 3 | Tek marka yok | Altı ayrı logo işlemi; tanıtım görselleri eski neon arayüzü gösteriyor |
| 4 | Ton dağınık | "Krieger bereit", "Tritt dem Kampf bei", "Quantum-Kern…", "Cyber Quiz Battle"; arayüzde 243 emoji (58 çeşit) |
| 5 | Zirve anları sönük | Podyum: ortada üç küçük kart, isimler kesik. Telefonda Quiz sonu yalnız puan |
| 6 | TV kompozisyonu küçük | 18 ayrı yazı boyutu, ölçek yok; gövde 24 px (Fire TV önerisi ≥ 28 px); sıralama ekran genişliğinin yarısından azında; kenar payı 48 px (Android TV önerisi %5 = 54 px) |
| 7 | En parlak öğe personel düğmesi | Amber dolgulu "Rangliste anzeigen", "Nächste Frage"; her soru personel tıklamasıyla ilerliyor |
| 8 | Ses çoğunlukla sentez | Müzik dosyalarından yalnız `game-pulse.mp3` var, gerisi osilatör yedeği; spiker yalnız `vo/de` ve oda diline bakmıyor |
| 9 | Tasarım sistemi yarım | 353 eski renk sınıfı (33 dosya) takma adla vurguya bağlı; 54 ham `duration` |
| 10 | Yönetim ekranları yalnız Türkçe | `src/pages/admin/` altındaki üç sayfada `useLocale` yok; bilinçli olabilir (`a11yLabels.test.ts` notu), karar ürün sahibinde |

İyi haber: ölçülen dört TV ekranı yazılım çizimiyle 60 fps (Ekim denetiminde
10–15 fps). Tasarıma hareket bütçesi var, yeter ki kurallar içinde kalsın.

## Fazlar

Sıra 0 → 3; Faz 4 kararlar geldikçe paralel. Her faz ayrı PR.

**Faz 0 — Kusur temizliği.** Plan: `docs/superpowers/plans/2026-11-15-faz-0-kusur-temizligi.md`.

**Faz 1 — Katılım ve okunurluk.** QR lobi, ana ekran ve tanıtım döngüsünde en
az 480 px, hata düzeltme H→M, adres ve oda kodu büyük yazıyla. Lobi: QR + üç
adım + oyuncu duvarı; geri sayım ekranındaki dış bağlantılı (Unsplash)
görseller kalkar. TV yazı ölçeği altı kademe (28/36/48/64/96/144), kenar
payı %5 (96×54 px). Soru, şık ve sıralama tuvali doldurur. `/__screens`
üzerinden Playwright ekran görüntüsüyle görsel regresyon testi CI'a girer.

**Faz 2 — Kimlik.** Tek logo sistemi (yazı + simge, PNG seti, `og:image`).
Başlık yazı tipi: iki üç aday gerçek ekranlarda yan yana gösterilir, ürün
sahibi seçer; İ ı ş ğ ß ä glifleri şart. Emoji yerine tek simge seti. Üç
dilde ton yeniden yazımı (savaş/siber dili çıkar). Yönetim ekranları
yerelleşir (ürün sahibi isterse). Ton değişirken e2e seçicileri de güncellenir
(`e2e/support/cafe.ts` "KRIEGER" yer tutucusuna bağlı). Mekânla ortak marka: logo ve ad lobide, podyumda, telefon
başlığında. Eski renk sınıfları anlamsal tokenlara taşınır, takma ad köprüsü
kalkar, lint kuralı gelir; ham `duration` değerleri tokenlara iner.

**Faz 3 — İmza anları ve ses.** Podyum ve gece finali tam tuval sahne
(önceden render edilmiş varlıkla). Cevap açıklama koreografisi: dağılım →
doğru şık → puan. Telefonda kişisel sonuç kartı: sıra, kazanılan gece puanı,
ödül, paylaşılabilir 9:16 görsel. Tasarlanmış ses seti (10–12 örnek, müzikle
aynı ton) ve lobi/oyun/final döngüleri; TR ve EN spiker; telefonda titreşim
dili. Telefon oyun girişindeki tanıtım videosunun kalıp kalmayacağı burada
karara bağlanır (eski arayüzü gösteriyor, mobil veri harcıyor).

**Faz 4 — Operasyon ve satış.** Otomatik akış (TV zamanlayıcısıyla; host tek
yazar kalır). Personel kumandası telefonda, TV'de düğme yok. Denetimden açık
kalanlar: Blaze + bütçe uyarısı, hosting önbellek/CSP başlıkları (P4), ödül
çift dağıtım koruması (P2). Landing ve pitch sayfası yeni ekranlarla. Gerçek
mekânda 20–40 telefonla prova (P10).

## Kararlar

| Karar | Durum |
|---|---|
| Görsel yön | Lounge — onaylandı |
| TV sesi | İki durum da desteklenir (yukarıda, Kısıtlar) |
| Öncelik | Misafirin gördüğü ekranlar; satış sayfaları Faz 4'te |
| Kısa katılım alan adı | Açık — harcama kararı; QR'ı da seyreltir (sürüm 5 → 2) |
| Yönetim ekranlarının dili | Açık — yalnız Türkçe kalsın mı, üç dil mi |
| Blaze planı | Açık — harcama kararı; 20 kişilik gece Spark okuma kotasına yakın |

Uygulayıcının kendi çağrıları (ürün sahibi düzeltebilir): faz başına tek PR;
Faz 0'da görünüm değişikliği en azda tutulur; logo ve yazı tipi Faz 2'ye
kadar değişmez, ikon yalnız neon gradyandan arındırılır.

## Kaynaklar

Fire TV tasarım kılavuzu (gövde ≥ 14sp ≈ 28 px, güvenli alan iç %90) ·
Android TV yerleşim kılavuzu (%5 kenar payı) · dijital tabela 10:1 QR kuralı ·
Jackbox tasarım ilkeleri (tek seferde tek görev, sıradaki adım hep belli) ·
mekân trivia ürünleri taraması (iki ekranda mekân markası, bekleme salonunda
sponsor alanı, personelsiz oynatma).
