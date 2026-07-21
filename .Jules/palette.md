## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-21 - Accessible Dynamically Loaded Summaries
**Learning:** Non-urgent, dynamically loaded content like AI summaries or scan results often go unnoticed by screen readers unless properly labeled. Adding `role="status"` and `aria-live="polite"` ensures they are reliably announced without interrupting the user's current flow. Also, interactive buttons must feature high-visibility focus rings (e.g., `focus-visible:ring-4`) to support accessibility for elderly users and disabled states should use `cursor-not-allowed`.
**Action:** Always wrap dynamically rendered non-urgent update containers in `role="status"` and `aria-live="polite"`, and use explicit `focus-visible` classes alongside `disabled:cursor-not-allowed` for action buttons.
