## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2024-04-13 - Framer Motion Dynamic Errors Accessibility
**Learning:** Framer Motion animated components (`<motion.div>`) used for conditional rendering or dynamic states (like validation errors) do not natively announce themselves to screen readers because they aren't standard HTML landmarks. Screen readers won't know the error appeared unless explicit ARIA attributes are added.
**Action:** Always add `role="alert"` and `aria-live="assertive"` to `<motion.div>` elements that serve as dynamic error messages or important status updates that appear without user interaction.
