## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-08 - Dynamic Content Accessibility
**Learning:** When dynamically rendering non-urgent content updates (e.g., scan results or text summaries) into the DOM, it is crucial to wrap the container with `role="status"` and `aria-live="polite"` so screen readers reliably announce the changes without interrupting the user.
**Action:** Ensure all dynamic result containers include appropriate ARIA live region attributes.
