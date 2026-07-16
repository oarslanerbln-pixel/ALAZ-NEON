## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-16 - High Contrast Focus Styles for Accessibility
**Learning:** In a dark theme context where default browser focus rings may be invisible or have low contrast, explicitly applying high-contrast focus rings (like `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) is critical for keyboard accessibility.
**Action:** Ensure all interactive elements explicitly include high-contrast `focus-visible` utility classes for clear keyboard navigation.
