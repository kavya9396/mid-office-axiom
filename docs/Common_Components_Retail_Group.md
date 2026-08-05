# Common Components — Retail & Group LoBs

This document lists shared components developed for the Retail and Group Lines of Business (LoBs) and has been enriched with implementation-specific details requested by the UI team.

## Goals of this document
- Provide a concise component inventory (what exists and where).
- Capture technical design guidance required for implementation and reviews.
- Explain component architecture, screen flows, API contracts, error handling, validation and state management patterns.

## Shared UI Primitives (src/components/ui)
- Button: `src/components/ui/Button/Button.tsx` — primary styled wrapper over MUI `Button` with contained/outlined/text variants, consistent spacing, and theme tokens.
- TextField: `src/components/ui/TextField/TextField.tsx` — styled MUI `TextField` with date-input handling, input masks (where used), and focus/error style patterns.
- Checkbox: `src/components/ui/Checkbox/Checkbox.tsx` — labeled checkbox wrapper using `FormControlLabel` and accessible keyboard handling.
- Select: `src/components/ui/Select/Select.tsx` — custom select with placeholder, helper text, async option support and `renderValue` usage for complex option templates.
- Radio: `src/components/ui/Radio/Radio.tsx` — radio-group component with label, options list and validation-friendly props.
- Tabs: `src/components/ui/Tabs/Tabs.tsx` — pill/tab navigation used to switch views; preserves index in route state when needed.
- Accordion: `src/components/ui/Accordion/Accordion.tsx` — expandable sections with header actions, keyboard-accessible toggle and optional header controls.
- Dialog: `src/components/ui/Dialog/Dialog.tsx` — standardized dialog wrapper with title, content, actions, close icon and portal support.
- Badge: `src/components/ui/Badge/Badge.tsx` — colored Chip variants (Low/Medium/High/Neutral) with mapping to severity and accessible labels.
- Table: `src/components/ui/Table/Table.tsx` — generic, styled table with column config, custom cell renderers, row selection and virtualization considerations for large datasets.
- KeyValueTable: `src/components/ui/KeyValueTable/KeyValueTable.tsx` — compact key-value display table with header and responsive wrapping.
- SearchBar: `src/components/ui/SearchBar/SearchBar.tsx` — compact search input with debounce and optional server-side search integration.

## Layout & Shared Components (src/components/layout)
- BackButton.tsx: back navigation button used in pages; integrates with router history.
- BreakTime.tsx: UI element showing break/time info.
- ConfirmationDialog.tsx: pre-configured confirm/cancel dialog used for destructive actions.
- ExpandAllAccordions.tsx: helper to expand/collapse multiple accordions.
- GridSection.tsx: layout wrapper for grid-based page sections with responsive column definitions.
- Header.tsx: top header used across pages, includes user menu and application-level actions.
- ScrollToTop.tsx: utility to scroll view to top on route changes.
- SessionTimeout.tsx & sessionTimeoutContext.ts: session timeout UI and provider with hooks for renew/extend behavior.

## Component Architecture & Design Patterns
- Composition over inheritance: components accept `children` and `slots` rather than large prop enums.
- Presentational vs container split: UI primitives are presentational and receive data/handlers from parent container components or hooks.
- Prop-driven styling: expose `sx`/`className` and limited override props; avoid leaking theme tokens across modules.
- Accessibility: components must include ARIA roles where relevant and support keyboard navigation (e.g., Dialog focus trap, Accordion keyboard toggling).
- Performance: tables and lists should support memoized renderers and virtualization (react-window / MUI virtualization) for large data.

## Screen Flows
- Each screen should include a short flow diagram (sequence) in its module-level README describing: initial data load, primary actions, success/failure transitions, and navigation destinations.
- Example flow (loan application review):
	1. Load application summary via `GET /applications/:id`.
 2. Render header, key-value summary and BRE/Decision accordion.
 3. Actions: Retrigger BRE -> POST `.../bre/retrigger` -> show loading -> update state; Refer to IT -> POST `.../refer-to-it` -> navigate back to inbox.
 4. On save/submit, PATCH application and show toast/snackbar on success.

## API Integration Details
- Keep API calls in `src/services/api.ts` and `src/services/endpoints.ts` (or `src/services/*`).
- Use thunks (RTK) or encapsulated hooks for async flows: return standardized shape `{ data, error, status }`.
- Error responses: surface `status`, `code`, and `message`. Map known backend codes to friendly UI messages in `config/errorMessages.json` / `src/config/errorMessages.ts`.
- Retry & idempotency: long-running or retrigger operations should be idempotent client-side (disable button while running) and idempotency keys documented if backend supports them.
- Example contract: `POST /bre/retrigger { applicationNumber, eventName }` -> 200 `{ data: { breOutput, initialBreOutput } }` or 4xx/5xx with `{ code, message }`.

## Exception Handling & Error States
- Localize error messaging: do not display raw exceptions to users — map to friendly copy and log full details to Sentry/monitoring.
- UI patterns: show inline errors for field-level issues; show a persistent banner/toast for API-level failures; show a dialog for blocking errors requiring user action.
- Failure fallback: when an external API is unavailable (e.g., BRE retrigger failure), preserve the last known good state, show `-` or `Unavailable` in fields, and provide a remedial action (Refer to IT).

## Validation Strategy
- Centralize validation logic where possible using a shared `validators` module or schema validators (Yup / Zod) for complex payloads.
- Field-level validation: synchronous checks (required, pattern) run on blur; async validations (unique checks) use debounce and show progress.
- Form handling: prefer controlled inputs with `react-hook-form` for complex forms to reduce rerenders and simplify validation wiring.

## State Management
- Global state: use Redux Toolkit (`src/store/*`) for application-level state (current application, user, inbox filters). Keep slice boundaries small and focused.
- Local UI state: use component state or context for transient UI (dialog open/close, loading spinners).
- Async flows: encapsulate server interactions in thunks (e.g., `breRetriggerThunk`, `referToItThunk`) and normalize API responses in slices.
- Caching: reuse server responses where possible; invalidate caches on mutation and make use of selectors for derived data.

## Reusable Components & Patterns
- Atomic components: keep small building blocks (Button, TextField) and higher-level composed components (BRE accordion, ApplicationSummary) in `src/components`.
- Hooks: expose reusable hooks for common logic: `useFetchApplication`, `useDebouncedSearch`, `useAppContext`.
- Utilities: centralize helpers (`src/utils/helpers.ts`, `src/utils/styles.ts`) for formatting, date parsing, and shared style tokens.

## Testing, QA and Observability
- Unit tests: add Jest/RTL tests for component behavior (rendering, props handling) and edge cases.
- Integration tests: test key flows (save/submit, retrigger) using mocks for API responses in `mock/` folder.
- E2E: recommend CI-level Cypress/Playwright tests for critical flows (create, review, refer-to-it).
- Monitoring: add Sentry breadcrumbs in thunks and log structured errors for server failures.

## Performance & Accessibility Considerations
- Lazy-load heavy modules and icons where appropriate.
- Tables and large lists should use virtualization and pagination.
- Run an a11y scan (axe) for high-traffic screens and ensure color contrast and focus order meet WCAG.

## Implementation Notes / Conventions
- File naming: PascalCase for components, kebab-case for CSS/asset files.
- Exports: prefer named exports for components to improve tree-shaking.
- Linting & formatting: follow the repo ESLint/Prettier rules and run pre-commit hooks before PR.

## Suggested Deliverables for UI Team Before Resubmission
- Updated module README with screen flow & sequence diagram for each screen using shared components.
- Component-level technical design: props contract, events, accessibility notes and example usage.
- API contract doc: request/response samples, error codes, retry behavior.
- Validation and error-handling matrix covering field/async/API errors.
- State management plan: what is stored in Redux slices vs local UI state.
- Storybook stories for changed/created components plus unit tests for edge cases.

Appendix: Key files to review
- [src/components/ui](src/components/ui)
- [src/components/layout](src/components/layout)
- [src/icons/Icons.tsx](src/icons/Icons.tsx)
- [src/store](src/store)
- [src/services](src/services)


