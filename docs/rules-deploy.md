# Firestore kurallarının canlıya gitmesi

`firestore.rules` misafirin tarayıcıdan yapabileceği her şeyin tek sınırı (skor, ödül
kodu, bomba). Hosting deploy'u kuralları **götürmez**; kurallar ayrı deploy edilir.
Elle yapıldığı dönemde unutuldu: 21–22.10.2026'da testte yeşil olan hile korumaları
canlıda yoktu (denetim P8). Artık bunu `.github/workflows/rules.yml` yapıyor.

## Ne yapar

| Tetik | İş |
|---|---|
| `main`'e `firestore.rules` / `firebase.json` değişikliği girince | kural testleri (emülatör) → `firebase deploy --only firestore:rules` → canlı depoyla aynı mı |
| Her sabah 08:17 UTC (Berlin 09:17–10:17) | canlıdaki kural seti depodakiyle karşılaştırılır (salt okuma); fark varsa iş kırmızı olur ve özet farkın ilk satırını gösterir |
| Actions → "Firestore kuralları (canlı)" → Run workflow | `main` üzerinde elle deploy (başka daldan tetiklenirse deploy atlanır) |

Hosting'e, veriye ve Auth'a dokunmaz. `FIREBASE_RULES_SA` sırrı yoksa yalnızca uyarı verir.

## Kurulum (bir kez, proje sahibi)

1. Google Cloud Console → `alaz-neon-web` → IAM → **Service accounts** → yeni hesap,
   ör. `github-rules-deploy`.
2. Rolleri ver:
   - **Firebase Rules Admin** (`roles/firebaserules.admin`): kural yayınlama ve okuma.
   - **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`): `firebase deploy`
     API'nin açık olduğunu kontrol ediyor.

   Başka rol vermeyin: hesap veriye, Auth'a ve hosting'e erişemesin. İlk koşuda izin hatası
   çıkarsa hata mesajındaki izni ekleyin.
3. Hesap → **Keys** → JSON anahtar oluştur.
4. GitHub → repo → Settings → Secrets and variables → Actions → **New repository secret**:
   ad `FIREBASE_RULES_SA`, değer JSON dosyasının tamamı. JSON dosyasını sonra silin.
5. (Önerilir) Settings → Environments → `production` → **Required reviewers**: deploy, bir
   kişi onaylayana kadar bekler. Ortam ilk koşuda kendiliğinden oluşur.
6. Actions → "Firestore kuralları (canlı)" → **Run workflow** (`main`) ile ilk deploy'u ve
   karşılaştırmayı yapın.

## Elle karşılaştırma

```bash
ACCESS_TOKEN=$(gcloud auth print-access-token) node scripts/rules-drift.mjs   # 0 aynı, 1 fark, 2 okunamadı
```
