# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## What this is

**MediSade** — a Turkish-language health PWA with two core jobs:

1. **Rapor Tara ("Scan Report")** — OCR/scan a medical report and produce a plain-language
   summary so patients can understand what their doctor's report actually says.
2. **İlaçlarım ("My Medications")** — track medications and whether each dose has been taken.

The UI is Turkish, mobile-first, and high-contrast (large text, dark theme) for older/low-vision
users. A permanent disclaimer footer states the app is **not medical advice** — only a language
simplification tool. Keep that disclaimer intact and never present output as clinical advice.

The project is an evolving **MVP**: authentication (JWT + bcrypt) and İlaçlarım (medications) are
now wired end-to-end against a real PostgreSQL database via Prisma. Rapor Tara (report scanning)
is still simulated on the frontend — OCR (`tesseract.js`) and AI summarization are not yet wired up.

## Repository layout

This is a **pnpm workspace monorepo** (`pnpm-workspace.yaml` → `apps/*`, `packages/*`).

```
.
├── package.json            # Root: name "medisade-monorepo", workspace scripts
├── pnpm-workspace.yaml     # Workspaces: apps/*, packages/*
├── apps/
│   ├── frontend/           # Next.js 16 + React 19 PWA (the active app)
│   │   ├── src/app/        # App Router: /, /login, /register, /scan, /medications
│   │   ├── src/components/ # UploadDocument.tsx, etc.
│   │   ├── src/lib/        # api.ts (backend fetch client), auth-context.tsx
│   │   ├── AGENTS.md       # ⚠️ Next.js version warning (read it)
│   │   └── CLAUDE.md       # Re-exports AGENTS.md via @AGENTS.md
│   └── backend/            # Express + Prisma + PostgreSQL API
│       ├── src/index.ts    # Express app: /health, /auth/*, /medications/*
│       ├── src/routes/     # auth.ts (register/login), medications.ts (CRUD)
│       ├── src/middleware/ # auth.ts — requireAuth JWT middleware
│       ├── src/lib/        # prisma.ts (client + driver adapter), asyncHandler.ts
│       └── prisma/schema.prisma
├── src/                    # ⚠️ LEGACY duplicate of the frontend app (see below)
└── .Jules/palette.md       # Engineering learnings log
```

### ⚠️ The root `src/` directory is legacy — do not edit it

The root-level `src/` is a leftover copy from before the code was moved into the monorepo. It is
**not part of any workspace**, is not built or served by anything, and its files are near-duplicates
of `apps/frontend/src/`. **All frontend work happens in `apps/frontend/src/`.** If you touch a
frontend page or component, edit it under `apps/frontend/`, not the root `src/`. Consider proposing
deletion of the root `src/` rather than keeping the two copies in sync.

## Tech stack

**Frontend** (`apps/frontend`)
- Next.js `16.2.6` (App Router) + React `19.2.4`
- Tailwind CSS **v4** (config via `@import "tailwindcss"` + `@theme` in `globals.css`; PostCSS
  plugin `@tailwindcss/postcss`). Note `tailwind.config.ts` still exists but v4 is CSS-first.
- `framer-motion` for animation, `lucide-react` for icons
- `tesseract.js` for on-device OCR (report scanning)
- `@supabase/supabase-js` for backend-as-a-service data/auth
- `next-pwa` for PWA/manifest support
- `clsx` + `tailwind-merge` for className composition
- `src/lib/api.ts` — thin fetch client for the backend (`NEXT_PUBLIC_API_URL`, defaults to
  `http://localhost:3001`); `src/lib/auth-context.tsx` — client-side auth state (JWT + user in
  `localStorage`, synced via `useSyncExternalStore`, wrapped around `children` in `layout.tsx`)

**Backend** (`apps/backend`)
- Express 4, ES modules (`"type": "module"`)
- Prisma (`@prisma/client` v7, keep in lockstep major version with the `prisma` CLI dependency)
  against **PostgreSQL** via `@prisma/adapter-pg`; `jsonwebtoken` + `bcryptjs` for auth, `pg`, `dotenv`, `cors`
- Data model (`prisma/schema.prisma`): `User` (email + hashed password), `Document` (originalText +
  summary + language — not yet used by any route), `Medication` (name, dosage, timeOfDay, taken, lastTakenAt).
- Routes: `GET /health`; `POST /auth/register`, `POST /auth/login` (return a JWT); `GET|POST /medications`,
  `PATCH|DELETE /medications/:id` (all require `Authorization: Bearer <token>`, scoped to the caller's user).
- Every async route handler is wrapped in `asyncHandler` (`src/lib/asyncHandler.ts`) and errors are
  caught by a catch-all error middleware in `index.ts` — **Express 4 does not catch rejected promises
  in async handlers on its own**, so a new route without `asyncHandler` can crash the whole process.
- Requires `DATABASE_URL` and `JWT_SECRET` in the environment (see `apps/backend/.env.example`).
  `prisma.config.ts` supplies `DATABASE_URL` to the Prisma CLI (`generate`/`migrate`); at runtime
  `src/lib/prisma.ts` passes it to `PrismaClient` via a `PrismaPg` driver adapter — Prisma 7 no longer
  reads a `url` field from the `datasource` block in `schema.prisma`.

## Development workflows

Use **pnpm** (there is a `pnpm-lock.yaml`; do not introduce npm/yarn lockfiles).

From the repo root:

```bash
pnpm install          # install all workspaces
pnpm dev:frontend     # run the Next.js app  (pnpm --filter frontend dev)
pnpm dev:backend      # run the Express API   (pnpm --filter backend dev, nodemon + ts-node)
pnpm build            # build every workspace (pnpm -r build)
pnpm lint             # lint every workspace   (pnpm -r lint)
```

Per-app:
- Frontend: `pnpm --filter frontend <dev|build|start|lint>`
- Backend: `pnpm --filter backend <dev|build>` (`build` = `tsc` → `dist/`)

Prisma (from `apps/backend`, with `DATABASE_URL` set): `pnpm prisma generate`, `pnpm prisma migrate dev`.

Copy `apps/backend/.env.example` → `.env` (needs `DATABASE_URL`, `JWT_SECRET`) and
`apps/frontend/.env.example` → `.env.local` (needs `NEXT_PUBLIC_API_URL`) before running either app
against a real database. After `pnpm install`, if you see an "Ignored build scripts" warning, run
`pnpm approve-builds --all` (or rely on the `allowBuilds` list already checked into
`pnpm-workspace.yaml`) so Prisma's engine binaries actually get built.

There is **no test suite** yet. If you add tests, wire them into workspace scripts.

## Conventions to follow

- **Language & audience.** All user-facing copy is **Turkish** (`<html lang="tr">`). Match the
  existing tone: short, plain, reassuring — the whole point is de-jargonizing medical text. Keep
  large font sizes and high contrast; the layout is intentionally constrained to `max-w-md` (mobile).
- **Accessibility is a hard requirement.** From `.Jules/palette.md`: any interactive element built
  from a `div`/`motion.div` (not a native `<button>`) **must** include `role="button"`, `tabIndex={0}`,
  `onKeyDown` handlers for Enter/Space, and visible `focus-visible` styles. Prefer native `<button>`
  when possible. Use `aria-label`, `aria-pressed`, `aria-live` as the existing components do
  (see `UploadDocument.tsx`, `medications/page.tsx`).
- **Client vs. server components.** Add `"use client"` only to components that need state/effects
  (e.g. `UploadDocument`, medications page). Keep pages server components where possible.
- **Imports.** Frontend uses the `@/*` path alias → `apps/frontend/src/*`.
- **Read `apps/frontend/AGENTS.md` before writing frontend code.** It warns that this Next.js
  version has breaking changes vs. common training data — consult `node_modules/next/dist/docs/`
  for the current App Router/Tailwind-v4 conventions rather than assuming older APIs.
- **Log learnings.** When you discover a non-obvious gotcha, append a dated entry to `.Jules/palette.md`.

## Git & branching

- Active development branch for AI work: **`claude/claude-md-docs-cjaz2e`** (base branch: `main`).
- Commit with clear, descriptive messages; push with `git push -u origin <branch>`.
- Do **not** open a pull request unless explicitly asked.
- `.gitignore` excludes `node_modules`. Do not commit `dist/`, `.next/`, or secrets/`.env`.
