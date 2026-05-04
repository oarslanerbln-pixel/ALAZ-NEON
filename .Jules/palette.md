## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-05-04 - Proper form labeling in complex layouts
**Learning:** Found that custom layout designs using `div` wrappers for input fields often omit the explicit connection between labels and form controls. While visual proximity implies connection to sighted users, screen readers require `htmlFor` and `id` attributes to programmatically associate them.
**Action:** Always ensure that when extracting or formatting custom inputs (especially with absolute/relative positioned wrappers or styled inputs), we explicitly add `htmlFor` on the label and match it to a unique `id` on the input/select/textarea.
