## 2023-08-13 - Icon-only buttons accessibility
**Learning:** Found several icon-only buttons (like `×` for removing and `+` for adding) that lack `aria-label` attributes. Without them, screen readers announce buttons ambiguously. Furthermore, there's a lack of `focus-visible` outline in some input and button components, which harms keyboard navigability.
**Action:** When adding icon-only buttons, always ensure an `aria-label` is present. Ensure proper focus states are visible for interactive elements.
