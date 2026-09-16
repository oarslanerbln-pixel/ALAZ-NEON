---
description: Coding standards and guidelines for the Cafe Nightlife Game (React + Firebase)
---

# Cafe Nightlife Game - Coding Standards

These rules apply to all frontend and backend code within this project.

## 1. TypeScript & React

* **Strict Typing:** Always use TypeScript. Avoid `any`. Define proper `interface` or `type` for all props, states, and Firestore document models.
* **Functional Components:** Use React Functional Components and Hooks. Do not use Class Components.
* **State Management:** Keep local state in `useState`/`useReducer`. For global game state (like active rounds, scores), rely on Firebase real-time listeners (`onSnapshot`) combined with React Context.
* **Fallbacks:** Always implement fallback UI for `loading` and `error` states, especially when fetching data or waiting for Firebase state transitions. Avoid "black screens" (null renders).

## 2. Firebase & Data Handling

* **Modular SDK:** Always use the Firebase v9+ modular SDK (e.g., `import { doc, getDoc } from "firebase/firestore"`). Never use the older `firebase/compat` namespace.
* **Data Integrity:** When updating game scores or statuses, use Firestore `writeBatch` or `runTransaction` if multiple documents are affected simultaneously.
* **Security:** Assume the client can be tampered with. Use Firestore Security Rules to validate score updates and restrict access to admin-only areas.

## 3. Styling (TailwindCSS & Framer Motion)

* **Utility-First:** Use TailwindCSS utility classes for all styling. Avoid adding custom CSS to `index.css` unless absolutely necessary (e.g., complex animations or global theme variables).
* **Animations:** Use `framer-motion` for complex UI transitions (like game state changes or podium reveals). Always wrap dynamic views in `<AnimatePresence>` and provide unique `key` props.

## 4. Game Logic

* **Pure Functions:** Keep game logic (like score calculation, round evaluation) in pure TypeScript functions inside the `src/lib/` folder so they can be easily unit tested.
* **Audio/Visual Cues:** Always provide visual or auditory feedback (using `SoundManager`) upon player interactions (e.g., submitting an answer, game over, timer ticks).
