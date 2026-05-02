## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-08 - Form Accessibility
**Learning:** For conditional error messages to be announced properly by screen readers, it is necessary to add `role="alert"` and `aria-live="assertive"` to the message element. When adding custom inputs, using matching `htmlFor` on the label and `id` on the input makes them accessible.
**Action:** When a form contains dynamic error text, ensure it utilizes `role="alert"` and `aria-live="assertive"`. Similarly, properly pair labels to inputs and add `aria-busy` on submit buttons during loading states.
