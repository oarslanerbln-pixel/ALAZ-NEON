## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-07-20 - Consistent High Contrast Focus States
**Learning:** Interactive elements on dark backgrounds require explicit high-contrast focus rings (e.g. `focus-visible:ring-yellow-400`) because default browser outlines often fail WCAG contrast requirements against dark gray/black.
**Action:** Applied consistent high-contrast focus rings and disabled cursor states across all primary interactive elements.
