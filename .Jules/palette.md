## 2026-09-11 - Dynamic HTML IDs in React Maps
**Learning:** When linking labels to inputs generated within a loop in React, avoid using the mapped item data (e.g. `cat`) directly for the ID, as it can contain spaces or invalid characters and break accessibility. Using the loop index (e.g., `id={"input-" + idx}`) is much safer and more robust.
**Action:** Always use index-based or sanitized string identifiers when dynamically generating `id` attributes inside React `.map()` functions to ensure correct `htmlFor` mapping.
