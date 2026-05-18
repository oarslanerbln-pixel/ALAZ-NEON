## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-18 - High-Contrast Focus Rings in Dark Mode
**Learning:** In the MediSade app's high-contrast dark theme (e.g., bg-gray-800 or black backgrounds), standard browser focus outlines are often completely invisible or lack sufficient contrast, making keyboard navigation nearly impossible for sighted keyboard users.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for all interactive elements like `<button>` and `<Link>` components to ensure robust accessibility.
