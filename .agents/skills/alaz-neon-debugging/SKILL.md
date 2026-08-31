---
name: alaz-neon-debugging
description: >-
  Use this skill when you need to debug or fix bugs in the ALAZ-NEON (Cafe Nightlife Game) project.
  It provides architectural insights, common pitfalls, and a structured approach to solving UI/state issues in this specific Firebase/React codebase.
---

# ALAZ-NEON Debugging Expert Guide

This skill provides a structured approach for an agent to troubleshoot bugs, black screens, UI glitches, or real-time sync issues in the ALAZ-NEON project.

## Core Architectural Principles (Understand Before Debugging)

1. **Host-Driven State Machine**:
   - The game logic is entirely driven by the `rooms` document in Firebase Firestore.
   - The Host application (`HostDisplay.tsx`) acts as the state manager. It routes to specific game displays (e.g., `HostQuizDisplay.tsx`) based on `active_game` and `status`.
   - Players (`PlayerGame.tsx`) are "dumb" terminals. They react to `room.status` and render controllers. They should NEVER mutate core room state, only write to `answers` or trigger specific actions via transactions (like buzzing in the sensor game).

2. **Routing & Component Lifecycle**:
   - Both `HostDisplay.tsx` and `PlayerGame.tsx` rely on early returns.
   - **CRITICAL**: If a component does not explicitly handle a `room.status` value, it may return `null` or silently fail, resulting in a **black screen**. Always ensure all game states (`lobby`, `intro`, `active`, `buzzed`, `reveal`, `review`, `standings`, `finished`) are accounted for, even if just to show a loading fallback.

## Common Bug Archetypes & How to Fix Them

### 1. Black Screen / UI Disappears

**Symptoms**: User reports "ekran siyah oluyor" (screen goes black).

**Investigation Steps**:

- Identify which screen (Host or Player) and which state (`room.status`).
- Look at the main router (`PlayerGame.tsx` or `HostDisplay.tsx`). Did it route to a sub-controller (e.g., `PlayerSensorController`)?
- Inside the sub-controller, check the `if (room.status === "...")` chain. Does it have a fallback for unknown states or `lobby`? If it returns `null` at the bottom, that's your black screen.
- Check for `undefined` references in arrays (e.g., `room.quiz_questions?.[index]`) or object keys (e.g., `results[0]?.answers`). Wrap them in safe optional chaining.

### 2. Double Submission / Phantom Points

**Symptoms**: Player submits an answer, but scores are inflated, or multiple entries appear.

**Investigation Steps**:

- Look at the `submitAnswers` or `handleSubmit` function. Does it use `isSubmitting` or `hasSubmitted.current` ref to guard against rapid double-tapping?
- Check `scoring.ts`. Is there a deduplication step? Ensure it filters by `player_id` taking the earliest timestamp.
- Avoid using `useEffect` to trigger Firebase writes without stringent dependency arrays and boolean locks.

### 3. Z-Index and CSS Glitches (Tailwind)

**Symptoms**: A modal doesn't appear, or an overlay blocks clicking.

**Investigation Steps**:

- Verify `z-index` layering. Backgrounds should be `z-0` or `z-10`. Interactive UI elements should be `z-40` or `z-50`.
- Verify `pointer-events-none` is applied to decorative overlays (e.g., CRT scanlines, particles) so they don't block clicks.

### 4. Audio Not Playing

**Symptoms**: SFX or music fails to trigger.

**Investigation Steps**:

- Ensure the audio path exists in `public/audio/`.
- Browsers block autoplay. The user MUST interact with the document first (a click or tap) before `SoundManager.getInstance().playSFX()` will work.
- If audio files are missing, `audio.ts` falls back to `Synth` logic.

## Systematic Debugging Checklist

When the user reports a new bug, follow these steps:

1. **Reproduce the State**: Mentally trace the `room.status` flow that leads to the bug. What are the variables at that exact moment?
2. **Inspect the UI Tree**: Check the host view (`Host*.tsx`) and the corresponding player controller (`Player*.tsx`).
3. **Verify Fallbacks**: Look for `null` renders or missing `else` conditions.
4. **Data Integrity**: Does the component assume an array has items? What if `players.length === 0`?
5. **Apply the Fix**: Write defensive code (e.g., `Object.values(r.answers || {})`).

## Summary

Use this systematic approach whenever investigating unexpected behavior in the host or player views.
