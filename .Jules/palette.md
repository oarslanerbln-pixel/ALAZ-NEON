## 2026-08-23 - Added high-visibility focus rings to LanguageSwitcher
**Learning:** High-visibility focus rings are critical for keyboard accessibility, especially against dark backgrounds. Default focus states are often insufficient or invisible.
**Action:** Add explicit `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:z-10` classes to interactive elements that lack them to ensure clear keyboard navigation cues.
