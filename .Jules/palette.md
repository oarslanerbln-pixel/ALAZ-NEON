## 2025-03-05 - Add ARIA Labels and Accessible Attributes to HostLobby Inputs
**Learning:** Found several input elements in HostLobby and login/register components lacking `aria-label`s, which is critical for screen reader users when placeholders aren't enough or are used as labels. Forms also missed explicit `id` bindings between `label` and `input`. The remove category button was also missing an `aria-label`.
**Action:** Always add explicit `aria-label` or `id`+`htmlFor` to forms and icon-only buttons to guarantee screen reader accessibility.
