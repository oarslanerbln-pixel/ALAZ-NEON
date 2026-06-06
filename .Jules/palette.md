## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-06 - High-Contrast Focus Rings
**Learning:** In high-contrast dark themes (e.g., bg-gray-800), standard browser focus states are often completely invisible. This breaks keyboard accessibility because users cannot see which element is currently focused.
**Action:** Always explicitly define high-contrast focus rings for interactive elements (buttons, links) using classes like `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` to ensure clear keyboard accessibility.
