## 2024-04-08 - [Interactive Elements Keyboard Accessibility]
**Learning:** Custom interactive components like TiltCard that act as buttons often miss keyboard accessibility (tab navigation and Enter/Space trigger) and proper ARIA roles, leading to poor experiences for keyboard and screen reader users.
**Action:** Always ensure custom clickable components explicitly define `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for Enter/Space, and visible focus states (`focus-visible:`).
