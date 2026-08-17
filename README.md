# 🔥 ALAZ: NEON

A premium, interactive party game built with **React 19**, **Firebase**, and **Tailwind 4**. Designed for a "TV + Phone" experience where the TV acts as the host display and players join using their mobile devices.

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

## 🧹 Code Quality
- **Type Safety**: Shared `Room` / `Player` / `Answer` types in `src/types/database.ts` for all Firestore reads/writes.
- **Optimization**: Lean UI components with logic extracted to custom hooks.
