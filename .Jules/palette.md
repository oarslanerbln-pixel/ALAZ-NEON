## 2024-05-15 - Missing htmlFor in Login and Register forms
**Learning:** Found an accessibility issue pattern specific to this app where form labels are missing `htmlFor` attributes linking them to their respective inputs, which harms screen reader support and clickability.
**Action:** Add `htmlFor` on labels and corresponding `id`s on inputs across form components.
