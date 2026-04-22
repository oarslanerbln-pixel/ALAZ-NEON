## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-04-22 - [Framer Motion Alert Announcements]
**Learning:** Conditionally rendered animated elements (like Framer Motion's `<motion.div>`) used for error states do not inherently announce themselves to assistive technologies when they appear on screen.
**Action:** Always explicitly define `role="alert"` and `aria-live="assertive"` on conditionally rendered animated elements used to display dynamic validation or submission errors.
