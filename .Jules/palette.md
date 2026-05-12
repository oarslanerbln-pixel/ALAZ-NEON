## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-05-12 - Directional Navigation Indicators & High Contrast Focus
**Learning:** Navigation actions like 'Geri' (Back) lack affordance without a directional icon. Furthermore, in this high-contrast dark theme (bg-gray-800), standard focus states are often invisible. Adding a directional icon (e.g., ChevronLeft) improves immediate comprehension, and a custom high-contrast focus ring (focus-visible:ring-4 focus-visible:ring-yellow-400) ensures keyboard users can easily track their position, perfectly matching the app's highlighted text color.
**Action:** When creating navigation links, include directional icons to clarify the action. Always explicitly define high-contrast `focus-visible` states that align with the application's specific color palette to ensure accessibility.
