## 2024-05-24 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Found multiple icon-only or purely visual symbol buttons (like '+' and 'x' buttons in HostLobby for managing categories) without proper `aria-label` attributes. This makes it impossible for screen reader users to understand the button's action.
**Action:** Adding descriptive `aria-label` attributes to these icon-only buttons to improve accessibility.
