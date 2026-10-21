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

## TV spikeri (`vo/de/`)

Yalnızca TV/host ekranında çalan Almanca anonslar (Google Chirp 3 HD,
"Charon" sesi). Hangi anın ne zaman söylendiği `src/lib/announcer.ts`'te,
çalma (ön yükleme, müziği kısma, üst üste bindirmeme) `src/lib/announcerPlayer.ts`'te.
Telefonda seslendirme yok.

Metni değiştirmek ya da yeni an eklemek için: `scripts/voiceover-lines.mjs`
satırını düzenle, `src/lib/announcer.ts` içindeki `ANNOUNCER_CUES` listesini
eşle, sonra tek seferlik üret:

```bash
node scripts/generate-voiceover-google.mjs --all --engine chirp3 --voice Charon --only <id>
```

Çalışma anında TTS çağrısı yok; dosyalar repoda sabit. `announcer.test.ts`
eksik dosyayı ve satır/an uyuşmazlığını yakalar.
