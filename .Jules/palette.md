## 2024-05-24 - Accessibility Labels on Icon Buttons
**Learning:** Found that icon-only buttons (like Mute and Leave) in the Player Header only had `title` attributes but were missing explicit `aria-label` attributes for screen readers. Using `t()` for localization works perfectly for dynamic ARIA labels.
**Action:** Ensure that anytime a new icon-only button is added to the UI, it includes an `aria-label` that either uses a translated string or a state-based description to maintain accessibility standards.
