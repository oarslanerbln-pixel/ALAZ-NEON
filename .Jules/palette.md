## 2025-05-18 - Missing id attributes on inputs connected to labels
**Learning:** Found a pattern in PlayerPlaying.tsx where inputs lack `id` attributes but have corresponding `<label>` elements without `htmlFor`. This breaks screen reader association between labels and inputs.
**Action:** Always ensure `id` and `htmlFor` are used properly when generating forms in React.
