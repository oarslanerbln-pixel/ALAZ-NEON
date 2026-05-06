## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.

## 2026-04-09 - Accessible Form Associations
**Learning:** Found multiple instances where labels were visually present but not programmatically associated with their input/select/textarea elements. This prevents screen readers from announcing the label when the input is focused and prevents clicking the label to focus the input. When looping through dynamic lists to create inputs (like the categories in `PlayerGame.tsx`), dynamic IDs using the loop variable (e.g., `id={\`input-\${category}\`}`) can be used to ensure unique associations.
**Action:** Always ensure `<label>` tags use `htmlFor` and point to the specific `id` of their target interactive element to maintain full accessibility.
