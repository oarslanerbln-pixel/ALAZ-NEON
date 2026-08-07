# 🔥 ALAZ: NEON

A premium, interactive party game built with **React 19**, **Supabase**, and **Tailwind 4**. Designed for a "TV + Phone" experience where the TV acts as the host display and players join using their mobile devices.

## 🚀 Alaz-Neon Aesthetic
The project features a high-end "Alaz-Neon" design system:
- **Glassmorphism 2.0**: Deep frost effects with noise textures.
- **Kinetic Animations**: Powered by Framer Motion for a premium digital feel.
- **Responsive Layouts**: Optimized for both TV (Host) and Mobile (Player) views.

## 🛠 Technical Architecture
- **Core**: React 19 (Strict Mode) + TypeScript
- **State & Realtime**: Supabase Realtime for instant synchronization between players and host.
- **Styling**: Tailwind CSS 4 with custom design tokens in `index.css`.
- **Logic**: Centralized hooks (e.g., `useHostRoom`) for managing game state and database synchronization.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project

### 2. Environment Setup
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```
Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

## 🏗 Database Schema
The game expects the following tables in Supabase:
- `rooms`: Stores game state, status, categories, and timer settings.
- `players`: Stores participants, nicknames, and scores.
- `answers`: Stores player responses for each round.

## 🧹 Code Quality
Recent improvements include:
- **Full Type Safety**: Centralized `Database` interface for all Supabase queries.
- **Reliability**: Integrated `withRetry` logic for all database mutations.
- **Optimization**: Lean UI components with logic extracted to custom hooks.
