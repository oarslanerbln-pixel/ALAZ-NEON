## 2026-08-24 - Add htmlFor to PhoneAuth fields
**Learning:** In the phone auth component, we missed linking labels with inputs using `htmlFor` and `id`. This hurts screen reader users significantly. We need to remember this pattern for all custom form inputs.
**Action:** Always verify all `<label>` elements are properly linked to `<input>` elements with matching `htmlFor` and `id` attributes.
