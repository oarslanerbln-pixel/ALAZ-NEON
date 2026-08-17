# Ses dosyaları

Bu klasördeki dosyalar tarayıcıya `/audio/<isim>.mp3` yolundan servis edilir.
Kod `src/lib/audio.ts` içindeki `sounds` nesnesinden okur.

Beklenen dosyalar:

| Dosya                 | Kullanım                       | Durum   |
| --------------------- | ------------------------------ | ------- |
| `game-pulse.mp3`      | Oyun içi müzik (döngü)         | ✅ var  |
| `lobby-ambient.mp3`   | Lobi / intro müziği (döngü)    | ⬜ yok  |
| `siren.mp3`           | Tur bitiş sireni               | ⬜ yok  |
| `cinematic-boom.mp3`  | Intro finali patlaması         | ⬜ yok  |
| `cyber-glitch.mp3`    | Hacker intro glitch efekti     | ⬜ yok  |

**Eksik dosyalar sorun çıkarmaz.** `SoundManager` dosyayı yükleyemezse
otomatik olarak Web Audio ile üretilen synth karşılığına düşer
(`synth:pad`, `synth:siren`, `synth:boom`, `synth:glitch`), yani oyun
hiçbir zaman sessiz kalmaz.

Kendi müziğini eklemek için dosyayı yukarıdaki isimle bu klasöre kopyalaman
yeterli — kod değişikliği gerekmez, dosya varsa synth yedeği devre dışı kalır.

> Not: Eskiden bu sesler `cdn.pixabay.com` üzerinden hotlink ediliyordu;
> linkler 403 dönmeye başlayınca hiçbir ses çalmıyordu. Bu yüzden tüm
> sesler yerele taşındı.
