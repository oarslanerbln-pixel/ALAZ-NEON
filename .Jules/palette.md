## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-26 - Missing High-Contrast Focus Rings in Standard Dark Mode
**Learning:** In standard dark mode interfaces (e.g., using Tailwind `bg-gray-800`), standard browser focus rings are often invisible or have insufficient contrast. Even custom elements might lack clear keyboard indicators if not explicitly set.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for all interactive elements (links, buttons, custom toggle buttons) to ensure clear keyboard accessibility, especially in high-contrast or dark themes.
