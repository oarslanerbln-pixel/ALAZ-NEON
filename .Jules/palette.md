## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-07-07 - Added accessibility features to UploadDocument
**Learning:** Dynamically rendered content (like scan results) needs 'role="status"' and 'aria-live="polite"' so screen readers announce it without interrupting the user. Also learned to add visible focus rings for keyboard navigation.
**Action:** Applied 'role="status"' and 'aria-live="polite"' to the result div, and added Tailwind focus-visible classes to the buttons.
