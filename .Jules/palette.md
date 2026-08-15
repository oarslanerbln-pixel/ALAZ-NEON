## 2026-08-15 - Keyboard Accessibility for Framer Motion Elements
**Learning:** Interactive framer-motion elements (`motion.div`) acting as buttons lack built-in keyboard accessibility by default. This causes users relying on keyboard navigation (Tab) to completely miss core interactive elements like the main role selection cards.
**Action:** Always add `role="button"`, `tabIndex={0}`, `onKeyDown` handlers (for Enter/Space), and high-contrast `focus-visible:ring-4` styling when making `motion.div` act as a button.
