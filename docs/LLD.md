# Low-Level Design (LLD) — Mid Office Axiom

## Overview
- Project: Mid-office-axiom (React + TypeScript + Vite)
- Purpose: Underwriting / claims / mid-office workflow UI
- Key tech: React, TypeScript, Vite, MUI, React Router, React Hook Form, Redux-style store with thunks, Jest

## High-level Architecture
- SPA built with React + Vite.
- Router: React Router; protected routes via `ProtectedRoute`.
- UI: MUI components, custom UI primitives in `src/components/ui`.
- State: Centralized store under `src/store` with thunks in `src/store/thunks`.
- Network: `src/services` contains `api.ts`, `apiConfig.ts`, and `endpoints.ts`.
- Modules: feature folders under `src/modules` (Login, DRS, Grievance, Group, Landing, Retail, QuickLinks, etc.).

## Important Files and Paths
- Entry: `src/main.tsx` — app bootstrap
- Root layout & routes: `src/routes/RootLayout.tsx`, `src/routes/AppRoutes.tsx`, `src/routes/routes.ts`, `src/routes/routes.tsx` (see `routes/`)
- App container: `src/App.tsx`
- Modules: `src/modules/*` (per-folder feature components)
- UI primitives: `src/components/ui/*` (Button, TextField, Checkbox, etc.)
- Services: `src/services/api.ts`, `src/services/apiConfig.ts`, `src/services/endpoints.ts`
- Store: `src/store/*`, `src/store/thunks/*`, and `src/store/hooks.ts`
- Hooks: `src/hooks/*` (e.g., `useAppContext.ts`, `useColumnConfig.ts`)
- Validations & messages: `src/validations`, `src/config/errorMessages.ts`
- Assets: `src/assets/` (logos, illustrations)
- Tests: `src/setupTests.ts`, `jest.config.cjs` and `tsconfig.jest.json`

## Module: Login
- Key files:
  - `src/modules/Login/Login.tsx`
- Responsibilities:
  - Render login form (React Hook Form + MUI custom fields)
  - Validate credentials, dispatch `loginThunk` from `src/store/thunks/authThunk`
  - Persist `token`, `username`, `password`, `businessType` to `localStorage`
  - Optionally dispatch `fetchMastersForSession` (master-data thunk)
  - Navigate to inbox using `getInboxPath`
- Sequence:
  1. User submits form
  2. `loginThunk` dispatched -> API call
  3. On success: store token; dispatch `fetchMastersForSession` (if required)
  4. Navigate to inbox route

## Authentication & Session
- Thunks: `authThunk` (login), `sessionMastersThunk` (fetchMastersForSession)
- Token storage: `localStorage` keys: `token`, `username`, `password`, `businessType`
- Protected routes: `ProtectedRoute.tsx` checks auth token and/or store state
- API client: `api.ts` uses `apiConfig.ts` for base URL and interceptors (attach token header)

## State Management (Store)
- Structure:
  - `store/slices` or similar (follow the repo's convention) for feature slices
  - `store/thunks/*` for async operations
  - `store/hooks.ts` for `useAppDispatch` and typed `useSelector`
- Common slices:
  - `auth` — login status, user info, token
  - `sessionMasters` — master data required across app
  - `inbox` — list of tasks, filters, pagination
  - `ui` — global UI states (loading overlays, toasts)

## API Design & Endpoints
- Single API layer at `src/services/api.ts` with helper `endpoints.ts`.
- Responsibilities:
  - One place for HTTP client (fetch/axios)
  - Request/response normalization
  - Retry/backoff and error handling
- Example endpoints:
  - `POST /auth/login` -> `loginThunk`
  - `GET /masters/session` -> `fetchMastersForSession`
  - `GET /inbox/tasks` -> inbox list

## Routing
- `AppRoutes.tsx` composes application routes.
- `ProtectedRoute.tsx` enforces authentication and role/business-type routing.
- `getInboxPath(businessType)` returns route to the business-specific inbox (e.g., retail)

## Components & UI
- Atomic primitives in `src/components/ui` (TextField, Checkbox, Button).
- Page-level components in `src/modules/*` act as containers and orchestrate data fetching.
- Shared layout components in `src/layout` (headers, footers, sidebars)

## Hooks
- `useAppContext.ts` — application-level context and helpers
- `useColumnConfig.ts` — column configuration logic and persistence (localStorage or server)

## Utilities
- `src/utils` contains style helpers, constants, and small helpers (e.g., `centerFlex`, `columnFlex`)
- `src/validations` centralizes React Hook Form validation schemas
- `src/config/errorMessages.json` and `src/config/errorMessages.ts` centralize textual errors

## Data Models (TypeScript types)
- Types stored under `src/store/types` or `src/types` — define shapes for:
  - User/Auth response: { ldapAuthentication: string, token: string }
  - Master data: categorized lists (codes, dropdowns, config)
  - Task/Inbox item: id, status, assignedTo, metadata

## Error Handling
- Thunks should `try/catch` and return standardized error objects to UI
- Global API error interceptor to handle 401 (session expiry) and refresh/redirect to login
- UI: snackbar/toast for transient messages; inline helper text for form errors

## Testing
- Unit tests: Jest + React Testing Library
- `src/setupTests.ts` contains test setup
- Key tests: component render, hooks, thunks (mocked API)

## Build & Run
- Dev: `npm run dev` (Vite)
- Build: `npm run build`
- Test: `npm run test`

## Deployment
- Vite build output -> static hosting (Netlify, S3 + CloudFront, or similar)
- Environment-specific `apiConfig` base URLs

## Non-Functional Considerations
- Performance: lazy-load route-level modules, memoize heavy lists
- Security: never persist plaintext passwords in production, use secure HTTP-only cookies or secure storage
- Accessibility: follow MUI accessibility defaults, add aria-* where needed

## Open Implementation Notes (repo-specific)
- `src/modules/Login/Login.tsx` currently uses a `USE_MOCK_LOGIN` flag; adjust based on environment
- `fetchMastersForSession` is used post-login — ensure its data shape and storage in `sessionMasters` slice
- Confirm the exact slice/file names under `src/store` and update this doc if they differ

---

Appendix: Key locations to review in repo
- [src/modules/Login/Login.tsx](src/modules/Login/Login.tsx)
- [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)
- [src/routes/ProtectedRoute.tsx](src/routes/ProtectedRoute.tsx)
- [src/services/api.ts](src/services/api.ts)
- [src/services/apiConfig.ts](src/services/apiConfig.ts)
- [src/services/endpoints.ts](src/services/endpoints.ts)
- [src/store/thunks/authThunk.ts](src/store/thunks/authThunk.ts) (or authThunk file)
- [src/store/thunks/sessionMastersThunk.ts](src/store/thunks/sessionMastersThunk.ts)
- [src/components/ui](src/components/ui)

If you want, I can:
- Expand any specific module section into detailed class/component diagrams
- Generate sequence diagrams (Mermaid) for login and task handling flows
- Produce a Word `.docx` instead of `.rtf` if preferred
