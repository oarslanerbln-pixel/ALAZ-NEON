## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-06-08 - High-Contrast Focus Rings in Dark Themes
**Learning:** Default browser focus rings are often invisible against dark backgrounds (like 'bg-gray-800' or 'bg-black'). In a high-contrast theme, interactive elements like buttons and links must have explicit, bright focus indicators.
**Action:** Always append `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none` to interactive elements in high-contrast dark themes to ensure keyboard accessibility.
