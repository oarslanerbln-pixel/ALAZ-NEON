## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-05 - High Contrast Mode Focus Indicators
**Learning:** High contrast focus rings (e.g. `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) are critical for accessibility on dark themes in MediSade, and explicit `disabled:cursor-not-allowed` improves feedback.
**Action:** Always apply visible focus indicators to interactive elements and correct cursor states for disabled buttons.
