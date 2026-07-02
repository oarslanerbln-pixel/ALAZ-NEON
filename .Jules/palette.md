## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-02 - High Contrast Focus Rings and ARIA Live Regions
**Learning:** For interactive elements on dark backgrounds, standard focus rings are invisible. High contrast focus rings (`focus-visible:ring-yellow-400`) are essential for WCAG AA keyboard accessibility. Furthermore, dynamically rendered non-urgent content updates need `role="status"` and `aria-live="polite"` rather than `assertive`/`alert` to prevent disruptive screen reader interruptions.
**Action:** Always apply explicit high-contrast `focus-visible` styles to interactive elements in dark themes, and strictly use `role="status"` for non-urgent async UI updates.
