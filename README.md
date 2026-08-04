# MediSade

Türkçe, mobil öncelikli bir sağlık PWA'sı. İki temel işi var:

1. **Rapor Tara** — bir tıbbi raporu tarayıp (OCR) sade bir dille özetlemeyi hedefler; hastaların
   doktor raporlarını daha kolay anlaması için bir dil sadeleştirme aracıdır.
2. **İlaçlarım** — ilaçları ve her dozun alınıp alınmadığını takip eder.

Uygulama **tıbbi tavsiye vermez** — yalnızca dil sadeleştirme aracıdır; bu uyarı uygulama
genelinde kalıcı bir footer olarak gösterilir.

> Proje aktif geliştirme aşamasında bir MVP'dir. Kimlik doğrulama (JWT, httpOnly cookie + bcrypt)
> ve İlaçlarım özelliği gerçek bir PostgreSQL veritabanına bağlı, uçtan uca çalışıyor. Rapor Tara
> da uçtan uca gerçek: `tesseract.js` ile OCR (tamamen çevrimdışı çalışabilir şekilde self-hosted),
> ardından Claude Haiku 4.5 ile Türkçe sade dile özetleme ve veritabanına kayıt.

## Depo yapısı

Bu bir **pnpm workspace monorepo**'sudur (`pnpm-workspace.yaml` → `apps/*`, `packages/*`).

```
.
├── apps/
│   ├── frontend/   # Next.js 16 + React 19 PWA
│   └── backend/    # Express + Prisma + PostgreSQL API
└── .Jules/palette.md   # Geliştirme sürecinde edinilen öğrenmelerin günlüğü
```

Daha ayrıntılı mimari/konvansiyon bilgisi için bkz. [`CLAUDE.md`](./CLAUDE.md).

## Kurulum

```bash
pnpm install
```

Kurulumdan sonra "Ignored build scripts" uyarısı görürseniz (Prisma'nın motor ikili dosyalarının
derlenmesi için gerekli):

```bash
pnpm approve-builds --all
```

`pnpm install`, frontend'in `postinstall`'ı ile Rapor Tara'nın OCR motorunu (tesseract.js worker,
WASM core, Türkçe eğitilmiş dil verisi) `node_modules`'tan `apps/frontend/public/` altına
kopyalar (`apps/frontend/scripts/vendor-ocr-assets.mjs`) — bu sayede OCR tarama zamanında bir
CDN'e ihtiyaç duymadan, çevrimdışı da çalışır. Bu dosyalar (~14MB) build çıktısı sayıldığı için
git'e commit'lenmez; sürüm değiştirirseniz `pnpm --filter frontend vendor:ocr` ile yeniden üretin.

### Ortam değişkenleri

Backend (`apps/backend/.env.example` → `.env`):

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/medisade"
JWT_SECRET="replace-with-a-long-random-string"
PORT=3001
NODE_ENV=development       # production'da auth cookie'sini Secure yapar
FRONTEND_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."   # Rapor Tara AI özetleme için; boşsa o route 503 döner
```

Frontend (`apps/frontend/.env.example` → `.env.local`):

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Backend'i bir veritabanına karşı çalıştırmadan önce Prisma şemasını uygulayın:

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma migrate dev
```

## Geliştirme

Kök dizinden:

```bash
pnpm dev:frontend     # Next.js uygulamasını çalıştırır
pnpm dev:backend      # Express API'yi çalıştırır (nodemon + ts-node)
pnpm build            # tüm workspace'leri derler
pnpm lint             # tüm workspace'leri lint'ler
```

Uygulamaya özel scriptler için:

```bash
pnpm --filter frontend <dev|build|start|lint>
pnpm --filter backend <dev|build|test>
```

## Teknoloji yığını

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `tesseract.js` (OCR, self-hosted
  worker/core/dil verisi), `framer-motion`, `lucide-react`. PWA: native `app/manifest.ts` + elle
  yazılmış bir `public/sw.js`.
- **Backend**: Express 4, Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL, `jsonwebtoken` (httpOnly
  cookie olarak) + `bcryptjs`, `@anthropic-ai/sdk` (Claude Haiku 4.5 ile Rapor Tara özetleme).

## Test ve CI

Backend'de Vitest ile entegrasyon testleri var (`pnpm --filter backend test`). Her push/PR'da
lint + build + test `.github/workflows/ci.yml` üzerinden otomatik çalışır.
