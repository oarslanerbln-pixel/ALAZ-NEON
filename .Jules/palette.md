## 2026-09-07 - Interactive Elements Without ARIA Labels
**Learning:** Found that custom language and country selection elements (like those in LanguageSwitcher and PhoneAuth) are missing proper accessible naming since they don't have text visible to screen readers (e.g. only flags or acronyms that may not convey enough context without a clear label).
**Action:** Always add 'aria-label' to interactive elements that depend heavily on visual context or abbreviations (like flags + country codes, or 'DE' / 'TR').
