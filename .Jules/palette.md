## 2026-04-07 - Custom Button Accessibility
**Learning:** When using Framer Motion to create interactive `motion.div` elements that act as buttons (like `TiltCard`), they lack default keyboard accessibility. Adding `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind `focus-visible` classes is essential for screen readers and keyboard navigation.
**Action:** Ensure all custom interactive `div` or `motion.div` components meant to behave like buttons include proper ARIA roles, keyboard event handlers, and visible focus states.
## 2025-06-07 - Yüksek Kontrast Erişilebilirlik ve Düzen Optimizasyonu
**Learning:** React uygulamalarında genel altbilgi (footer) ve uyarıları doğrudan `layout.tsx` (Next.js) gibi kök seviyesi bileşenlere yerleştirmek, uyarıların uygulamanın her sayfasında kalıcı ve tutarlı görünmesini sağlar.
**Action:** Tıbbi sorumluluk reddi metni `layout.tsx` dosyasına yüksek kontrastlı (`bg-black border-t-2 border-yellow-400 text-yellow-400 font-bold`) bir altbilgi olarak eklendi.
