## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-15 - Dynamic Content Screen Reader Announcement
**Learning:** When dynamically rendering non-urgent content updates like scan results or text summaries into the DOM, they are easily missed by screen readers. Wrapping the container with `role="status"` and `aria-live="polite"` is crucial for ensuring screen readers reliably announce these changes to visually impaired users without interrupting their current flow.
**Action:** Always apply `role="status"` and `aria-live="polite"` to containers that inject asynchronous results (like LLM summaries or scan outputs) into the page.
