## 2024-08-11 - Add aria-label to HostLobby icon buttons
**Learning:** Found that there are icon-only buttons like the remove category (×) and add category (+) buttons in the HostLobby component that lack accessible `aria-label` attributes. This is a common accessibility issue for interactive elements that do not have visible text.
**Action:** Added `aria-label` to the remove and add category buttons to improve screen reader accessibility. Will continue to check for similar patterns across the app.
