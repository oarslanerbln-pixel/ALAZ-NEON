# 🔥 HENGAME

A premium, interactive party game for cafés and venues, built with **React 19**, **Firebase**, and **Tailwind 4**. Designed for a "TV + Phone" experience: the TV acts as the host display and guests join from their own phones by scanning a QR code.

> **Naming note:** `HENGAME` is the product/brand name. `alaz-*` (package name, CSS design tokens such as `--alaz-orange`, the `Alaz-Neon` design system) is the *internal* name of the visual system and is intentionally left unchanged — it never appears in the UI.

## 🚀 Alaz-Neon Aesthetic
The project features a high-end "Alaz-Neon" design system:
- **Glassmorphism 2.0**: Deep frost effects with noise textures.
- **Kinetic Animations**: Powered by Framer Motion for a premium digital feel.
- **Responsive Layouts**: Optimized for both TV (Host) and Mobile (Player) views.

## 🛠 Technical Architecture
- **Core**: React 19 (Strict Mode) + TypeScript
- **State & Realtime**: Firebase Firestore `onSnapshot` listeners for instant synchronization between players and host.
- **Styling**: Tailwind CSS 4 with custom design tokens in `index.css`.
- **Logic**: Centralized hooks (e.g., `useHostRoom`) for managing game state and database synchronization.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Firebase Project (Firestore enabled)

### 2. Environment Setup
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```
Fill in your Firebase project's web app config values (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.).

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

## 🏗 Database Schema
The game expects the following Firestore collections:
- `rooms`: Stores game state, status, categories, and timer settings.
- `players`: Stores participants, nicknames, and scores.
- `answers`: Stores player responses for each round.

## 🔐 Staff access (required before first use)

Admin screens — venue settings (`/admin/venue`), reward verification
(`/admin/rewards`) and the nightly report (`/admin/report`) — **and opening a game
room on the TV/tablet (`/host/setup`)** are restricted to **staff accounts**. Staff
status is *not* implied by how you signed in: `/register` is a public player
sign-up that also creates email/password accounts, so "signed in with a password"
would mean "anyone who registered".

The host screen needs a staff account because reward coupons and lifetime league
points are written by the room's host: the rules only accept them from a staff
account that hosts the room. Sign the TV/tablet in once with a staff account; the
session persists. Players keep joining anonymously via the QR code.

Authority comes from a document in the `staff` collection:

```
staff/<uid>        # the document's existence grants access; contents are free-form
```

No client can write this collection (`allow write: if false` in `firestore.rules`),
so an account cannot grant itself access. To add a staff member:

1. Have the person register at `/register` (or create the account in
   Firebase Console → Authentication).
2. Copy their **User UID** from Firebase Console → Authentication → Users.
   (An account that signs in and opens an admin screen is also shown its own
   `staff/<uid>` path on the access-denied screen.)
3. Firebase Console → Firestore → create collection `staff`, document ID `<uid>`,
   with any field (e.g. `added_at`).

To revoke access, delete that document.

> When the project moves to the Blaze plan, a `staff: true` **custom claim** set via
> the Admin SDK is also accepted, with no rule changes needed — it avoids the
> per-evaluation `get()` that the allowlist costs.

## 🛡 App Check (recommended, one-time console setup)

[App Check](https://firebase.google.com/docs/app-check) makes Firestore accept
requests only from this web app (reCAPTCHA v3 attestation), so scripts and other
sites cannot burn the daily quota. The client side is already wired up
(`src/lib/appCheckSetup.ts`); it stays **off** until a site key is configured.

1. **reCAPTCHA v3 key** — <https://www.google.com/recaptcha/admin/create>,
   type *Score based (v3)*, domains: your production domains (e.g. the Vercel
   domain). Do **not** add `localhost` (that would let anyone pass from their
   own machine; local development uses debug tokens, step 5).
2. **Register the app** — Firebase Console → App Check → Apps → your web app →
   reCAPTCHA v3 → paste the **secret** key. The secret key lives only in the
   console, never in this repo or in `VITE_*` variables.
3. **Site key** — set `VITE_RECAPTCHA_SITE_KEY` (public) in the hosting
   environment (and `.env.local`), then redeploy.
4. **Monitor, then enforce** — App Check → APIs → Cloud Firestore shows
   verified vs. unverified requests. TVs and phones still running an older
   build show up as unverified until they reload. When verified traffic is
   ≥ ~95 %, click **Enforce** for Cloud Firestore.
5. **Local development / CI** — with the site key set, `npm run dev` prints an
   *AppCheck debug token* in the browser console; add it under App Check →
   Apps → ⋮ → *Manage debug tokens*. For CI, register a fixed token and set it
   as `VITE_APPCHECK_DEBUG_TOKEN`. The Firestore emulator (rules tests) does not
   enforce App Check.

> reCAPTCHA v3 shows a small badge in the bottom-right corner. If you hide it,
> Google requires the reCAPTCHA attribution text to be shown elsewhere.

## 🗑 Data retention (one-time console setup)

Rooms, players and answers used to accumulate forever — the codebase contains no
`deleteDoc` at all, and no room is ever marked `closed`. For a venue playing every
night that is both a growing cost and a growing room-code collision surface.

Every newly written room / player / answer now carries an `expires_at`
**Timestamp** (`src/lib/retention.ts`, currently **90 days** — long enough to keep
the monthly report on `/admin/report` intact). Deletion is left to Firestore's own
TTL feature, so no Cloud Functions and no Blaze plan are required:

Google Cloud Console → Firestore → **Time-to-live (TTL)** → *Create policy*, once
per collection:

| Collection group | Timestamp field |
|---|---|
| `rooms`    | `expires_at` |
| `players`  | `expires_at` |
| `answers`  | `expires_at` |
| `ayna_survey` | `expires_at` |

Or with the gcloud CLI:

```bash
gcloud firestore fields ttls update expires_at   --collection-group=rooms --enable-ttl
```

> **Two caveats.** TTL only deletes documents that *carry* the field, so records
> written before this change are never cleaned up — clear those out once by hand.
> And deletions are best-effort: Firestore usually removes documents within 24
> hours of expiry, not at the exact timestamp.

Shortening the window is a one-line change in `src/lib/retention.ts`, but keep it
above ~31 days or the monthly report silently empties out (a test guards this).

## 🧹 Code Quality
- **Type Safety**: Shared `Room` / `Player` / `Answer` types in `src/types/database.ts` for all Firestore reads/writes.
- **Optimization**: Lean UI components with logic extracted to custom hooks.
