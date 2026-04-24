## 2024-04-24 - [next-pwa Type Checking]
**Learning:** When using `next-pwa` in Next.js 15+ projects, the `next build` command runs a strict type check which will fail because `next-pwa` lacks native TypeScript declarations.
**Action:** Always install `@types/next-pwa` as a dev dependency to resolve the 'implicitly has an "any" type' compilation errors during `pnpm build`.
