## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2024-05-19 - [Node.js ES Module with Prisma]
**Learning:** When configuring a Node.js TypeScript backend as an ES Module (`type: "module"`) using Prisma, ensure `moduleResolution` is set to `node16` in `tsconfig.json`, and `@types/node` is installed and included in the `types` array to prevent TypeScript errors with `process.env` and CommonJS imports.
**Action:** Created backend package.json with "type":"module" and configured tsconfig.json properly.
