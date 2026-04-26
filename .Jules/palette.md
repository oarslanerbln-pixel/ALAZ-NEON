## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2025-03-09 - React Hook Dependency and Unmemoized Functions
**Learning:** Adding unmemoized functions (like `submitAnswers` in `PlayerGame.tsx`) to a `useEffect` dependency array will cause the effect to re-run on every render if the function relies on closures and state variables, which triggers a linter warning (`react-hooks/exhaustive-deps`). To fix this cleanly, the function must be wrapped in `useCallback` or left out of the dependency array if guarded appropriately.
**Action:** Always wrap functions in `useCallback` before adding them to a dependency array to prevent unnecessary re-renders or linter warnings.
