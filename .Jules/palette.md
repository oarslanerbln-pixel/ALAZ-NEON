## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-05-20 - High Contrast Focus States in Dark Mode
**Learning:** In high-contrast dark themes (e.g., `bg-gray-800` or `bg-black`), the browser's default focus ring is often invisible or extremely hard to see, leading to poor keyboard accessibility.
**Action:** Always explicitly define high-contrast focus rings for interactive elements (like links and buttons) using Tailwind utility classes, e.g., `focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`.
