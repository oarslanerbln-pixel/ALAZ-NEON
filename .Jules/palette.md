## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-06-14 - High-Contrast Focus Rings in Dark Mode
**Learning:** Standard focus states are often invisible in high-contrast dark themes (like MediSade's bg-gray-800). Explicitly defining high-contrast focus rings (e.g., focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none) is required for interactive elements to ensure clear keyboard accessibility.
**Action:** Always add explicit, high-contrast focus rings to custom buttons and interactive elements in dark-themed applications.
