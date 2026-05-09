## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2026-05-09 - Form Accessibility Attributes Missing
**Learning:** Custom styled forms in this app lack fundamental semantic HTML accessibility attributes. Elements like input fields are missing `id` attributes, labels are missing `htmlFor`, dynamic error messages are missing `role="alert"` and `aria-live="assertive"`, and buttons lack state indicators like `aria-busy`.
**Action:** When working on form or input elements, always actively verify the linkage between labels and inputs, and use appropriate ARIA attributes for state changes and validation messages.
