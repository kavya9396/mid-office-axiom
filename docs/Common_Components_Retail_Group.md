# Common Components — Retail & Group LoBs

This document lists shared components developed for the Retail and Group Lines of Business (LoBs), with file locations and a short description for each component.

## Shared UI Primitives (src/components/ui)
- [Button](src/components/ui/Button/Button.tsx): primary styled button wrapper over MUI `Button` with contained/outlined/text variants.
- [TextField](src/components/ui/TextField/TextField.tsx): styled MUI `TextField` with date-input and focus styles.
- [Checkbox](src/components/ui/Checkbox/Checkbox.tsx): labeled checkbox wrapper using `FormControlLabel`.
- [Select](src/components/ui/Select/Select.tsx): custom select with placeholder, helper text and renderValue support.
- [Radio](src/components/ui/Radio/Radio.tsx): radio-group component with label and options list.
- [Tabs](src/components/ui/Tabs/Tabs.tsx): pill-style tabs component for switching views.
- [Accordion](src/components/ui/Accordion/Accordion.tsx): expandable sections with header actions and custom icons.
- [Dialog](src/components/ui/Dialog/Dialog.tsx): standardized dialog wrapper with title, content, actions and close icon.
- [Badge](src/components/ui/Badge/Badge.tsx): colored Chip variants (Low/Medium/High/Neutral).
- [Table](src/components/ui/Table/Table.tsx): generic, styled table component with column config and render callbacks.
- [KeyValueTable](src/components/ui/KeyValueTable/KeyValueTable.tsx): compact key-value display table with header.
- [SearchBar](src/components/ui/SearchBar/SearchBar.tsx): compact search input with customizable placeholder and width.

## Layout & Shared Components (src/components/layout)
- [BackButton.tsx](src/components/layout/BackButton.tsx): back navigation button used in pages.
- [BreakTime.tsx](src/components/layout/BreakTime.tsx): UI element showing break/time info.
- [ConfirmationDialog.tsx](src/components/layout/ConfirmationDialog.tsx): pre-configured confirm/cancel dialog.
- [ExpandAllAccordions.tsx](src/components/layout/ExpandAllAccordions.tsx): helper to expand/collapse multiple accordions.
- [GridSection.tsx](src/components/layout/GridSection.tsx): layout wrapper for grid-based page sections.
- [Header.tsx](src/components/layout/Header.tsx): top header used across pages.
- [ScrollToTop.tsx](src/components/layout/ScrollToTop.tsx): utility to scroll view to top on route changes.
- [SessionTimeout.tsx](src/components/layout/SessionTimeout.tsx): session timeout UI.
- [sessionTimeoutContext.ts](src/components/layout/sessionTimeoutContext.ts): context provider for session timeout logic.

## Icons
- [Icons.tsx](src/icons/Icons.tsx): centralized icon exports (used by UI components like Accordion and Dialog).

## Notes on Usage
- These components are LOB-agnostic and intended to be reused across Retail and Group modules.
- Specific pages under `src/modules/Retail` or `src/modules/Group` (if present) should import these primitives rather than reimplementing them.
- Styling and theme values are centralized in the components; prefer extending via component `sx` props.

## Suggested Next Steps
- Generate a component-usage map showing which Retail and Group pages use each shared component.
- Create Storybook stories for each shared component to improve discoverability and QA.


Appendix: Key files to review
- [src/components/ui](src/components/ui)
- [src/components/layout](src/components/layout)
- [src/icons/Icons.tsx](src/icons/Icons.tsx)

