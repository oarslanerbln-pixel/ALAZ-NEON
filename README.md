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
(`/admin/rewards`) and the nightly report (`/admin/report`) — are restricted to
**staff accounts**. Staff status is *not* implied by how you signed in: `/register`
is a public player sign-up that also creates email/password accounts, so
"signed in with a password" would mean "anyone who registered".

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

## 🧹 Code Quality
- **Type Safety**: Shared `Room` / `Player` / `Answer` types in `src/types/database.ts` for all Firestore reads/writes.
- **Optimization**: Lean UI components with logic extracted to custom hooks.
