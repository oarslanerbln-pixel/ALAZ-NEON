## 2025-05-18 - Added ARIA Labels to HostLobby Symbol Buttons
**Learning:** Icon-only buttons (like "+" for adding or "×" for deleting) need explicit `aria-label`s for screen reader support, especially when localized.
**Action:** Always verify if a button using a symbol as text has a corresponding `aria-label` to ensure proper accessibility navigation.
