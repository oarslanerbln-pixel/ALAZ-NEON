## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2024-05-15 - High-Contrast Focus States in Dark Themes
**Learning:** In high-contrast dark themes (like bg-gray-800 or bg-black), standard browser focus outlines are often invisible or have insufficient contrast, making keyboard navigation extremely difficult for users relying on keyboard interaction.
**Action:** Always explicitly define high-contrast focus rings (e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`) for all interactive elements (links, buttons) to ensure clear keyboard accessibility in dark themes.
