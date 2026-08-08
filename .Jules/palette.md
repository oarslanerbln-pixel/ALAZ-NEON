## 2024-05-18 - Interactive motion.div Accessibility
**Learning:** Framer Motion `motion.div` elements that act as buttons often lack keyboard accessibility attributes and focus indicators, preventing keyboard users from interacting with them.
**Action:** When using `motion.div` as a button, always add `role="button"`, `tabIndex={0}`, an `onKeyDown` handler for Enter/Space, and high-visibility `focus-visible` classes.
