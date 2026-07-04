## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-04 - Dynamic Content Accessibility in Scan Results
**Learning:** Dynamically injected scan results need explicit ARIA roles to be announced properly by screen readers without interrupting the user. Relying merely on visual changes is insufficient for accessibility.
**Action:** Added `role="status"` and `aria-live="polite"` to the dynamically rendered result container in UploadDocument to ensure seamless screen reader announcements.
