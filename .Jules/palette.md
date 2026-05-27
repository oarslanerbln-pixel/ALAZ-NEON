## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2024-05-27 - Dynamic Content Announcement
**Learning:** Dynamic non-urgent content updates (like asynchronous scan results appearing on the screen) require `role="status"` and `aria-live="polite"` so screen readers will read the newly rendered content to the user without abruptly interrupting them.
**Action:** Add these attributes to wrappers of conditionally rendered content that isn't instantly displayed but conveys important results.
