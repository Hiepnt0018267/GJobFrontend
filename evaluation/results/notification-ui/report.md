# Task 16C — Multi-role Notification Center UI/UX

## Status

**UI CONTRACT VERIFIED; LIVE BROWSER FLOW BLOCKED BY UNAPPLIED DEV MIGRATION.** Shared
Candidate, Recruiter and Admin implementation is complete and automated checks pass.
An authenticated Candidate browser proves the bell, popover/error handling and shared
route render, but notification reads cannot reach a valid DB result because DEV is at
Alembic `e7a1c3d5f9b2` while notification-table revision `f8b2c4d6e1a3` is head and is
not applied. Per Task 16C hard-stop, no backend migration/change was performed and no
Recruiter/Admin success was claimed. No credentials were guessed and no DEV data created.

## Source Review

Reviewed AuthContext/user ID/logout/token flow; Candidate `MainLayout` and `Header`;
Recruiter/Admin layouts, topbars, account and mobile-menu state; role routes and exact
detail routes; Axios interceptors; `gjob:data-refresh`, BroadcastChannel/focus/visibility
behavior; `usePaginatedQuery` AbortController/request-ID handling; current node:test +
Vite SSR pattern. Backend contract was consumed as frozen; no backend file changed.

## Architecture

One `NotificationProvider` is mounted inside Auth/DataRefresh/Toast providers and serves
all three role shells. Shared types, API service, pure helpers/reducer, hook, glyph,
item, bell/panel and one `NotificationCenterPage` are reused. No new authenticated
shell, query library, realtime channel, polling loop or dependency was added.

## Identity-Scoped Privacy

State is keyed by authenticated `user.id` plus a monotonically invalidated generation,
not by role. Identity change/logout aborts count, preview and mutation controllers,
clears count/items/errors/pending sets, and hides old state synchronously because state
whose identity differs from the current auth identity is never exposed. Bell observes
identity changes and closes. Reducer actions require matching identity and generation;
late User A responses cannot populate User B state.

Automated privacy test starts with private User A count/items/errors/pending state,
resets to User B, verifies a completely empty state, then proves late User A and stale
User B-generation responses are ignored. Manual same-tab A→B switching remains pending.

## API Integration

Shared Axios service uses:

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`
- `PATCH /api/v1/notifications/read-all`

Full page sends server-owned `page`, `page_size=20`, and `unread_only`; it preserves
backend order. Request keys include user ID, generation, filter, page and page size.
Filter changes reset page 1. AbortController plus the existing request-ID guard prevents
older All/page requests from replacing newer Unread/page results.

## gjob:data-refresh Strategy

Selected one coherent mutation path: notification PATCH requests set
`gjobSkipDataRefresh=true`, reconcile current provider/page state deterministically,
then broadcast `notifyDataRefresh({ local: false })` only to sibling tabs. This avoids a
duplicate local generic refresh while allowing other tabs to refresh through the
existing provider. Full pages also react to intentional existing refresh signals.

## Shared Components and Bell Mount Points

- Candidate: `components/layout/Header.tsx`
- Recruiter: `RecruiterTopbar.tsx`
- Admin: `AdminTopbar.tsx`

Bell is authenticated-only and remains directly visible on mobile. Badge hides at 0,
shows 1–99, caps only the visual label at `99+`, and keeps the actual count in its
accessible label. Popover supports loading, empty, error/retry, preview items, mark-all
and the current role's full notification route.

## Menu Coordination

Header/layout owns panel state so it can be mutually exclusive with account menus and
mobile drawers. Opening another menu closes notifications; opening notifications closes
conflicting UI; route changes and logout close/unmount it. Outside click closes it.
Escape closes it and restores focus to the bell where practical.

## Notification Routes and Page Metadata

The same page is mounted under the existing protected role layouts:

- `/candidate/notifications`
- `/recruiter/notifications`
- `/admin/notifications`

Recruiter/Admin metadata maps these routes to `Thông báo` in their existing contexts.
The page provides server-side All/Unread tabs, loading/error/retry/empty/list states,
mark-all, and backend pagination without client sorting.

## Type Handling and Plain-text Security

Specific visuals exist for `SYSTEM`, `APPLICATION_SUBMITTED`,
`APPLICATION_STATUS_CHANGED`, `APPLICATION_WITHDRAWN`, `JOB_APPROVED`, and
`JOB_REJECTED`. Unknown future strings use the same neutral generic bell category as
SYSTEM and still render title/message/timestamp/read state. Backend copy is interpolated
only as React text. Source search finds no `dangerouslySetInnerHTML` in notification
code; SSR verifies script/img-looking strings are escaped rather than interpreted.

## Deep-link Allowlist

One pure helper validates UUID targets and returns only frozen paths:

| Target | Candidate | Recruiter | Admin |
|---|---|---|---|
| APPLICATION | `/candidate/applications/:id` | `/recruiter/applications/:id` | `/admin/applications/:id` |
| JOB | `/jobs/:id` | `/recruiter/jobs/:id` | `/admin/jobs/:id` |
| CV | `/candidate/cvs/:id` | unsupported/null | `/admin/cvs/:id` |

Unknown/invalid targets return null. Unsupported notifications remain readable and can
be marked read, but present no fabricated navigation affordance.

## Mark-One and Mark-All

Unread target clicks await the idempotent PATCH, reconcile returned item/count/page,
then navigate. Failure leaves unread state unchanged, shows safe feedback and still
allows valid navigation. A per-ID pending set blocks duplicate PATCH. Identity changes
during the request abort the mutation and suppress old-role navigation.

Mark-all disables repeat submission. Success sets count zero, marks held items read,
and clears the active Unread page; failure does not fake success. Provider/page logic
does not create notifications or alter domain records.

## Accessibility and Responsive Design

Bell is a labelled button with expanded/controls/dialog semantics. Interactive rows are
buttons, unsupported static rows remain semantic articles, unread state has explicit
accessible text in addition to color, and mark-all/retry/filter/pagination are keyboard
buttons. Mobile panel uses viewport insets and bounded scroll height. Live 375/768/1280
visual and keyboard checks remain pending authentication.

## Automated Verification

Targeted `node --test tests/notification-ui.test.mjs`: **13 passed, 0 failed**.
Coverage includes badge boundaries; all six known/unknown types; every frozen role-target
route; invalid/unsupported targets; params/request key; metadata; filter reset; identity
reset/stale responses; mutation reconciliation/deduplication/failure preservation; exact
Axios endpoints and skip flag; escaped text; unread semantics; bell/panel/page SSR markup.

Final full direct Node run: **60 passed, 0 failed**. Its only console noise is the
existing parallel Vite-test HMR port 24678 warning; no test failed. TypeScript-b and
full ESLint pass. Final production Vite build passes at 2055 modules with only the
existing large aggregate chunk warning (~1.52 MB, ~372 KB gzip). `git diff --check`
passes with existing LF→CRLF notices. PowerShell blocks the `npm.ps1` wrapper, so
commands use the same underlying Node entry points rather than changing execution policy.

SSR/static tests prove render contracts only; they are not labelled browser E2E.

## Browser Verification

Authenticated Candidate `Nguyễn Trọng Hiệp`, existing session/data only. A reload first
loaded the current frontend bundle. Candidate Header exposes a keyboard-addressable bell
beside the mobile menu; click opens the labelled dialog with mark-all, retry and the exact
`/candidate/notifications` full-page link. Route navigation closes the panel and renders
the shared title, All/Unread controls, mark-all and safe retryable error state. No domain
action or notification PATCH was executed.

The first preview and full page both fail at the live read boundary. Temporary allowlisted
frontend diagnostic logging captured endpoint identity plus Axios status/code only—no
token, title, message or response body. It showed notification list/count `ERR_NETWORK`;
the logging was then completely removed and a clean reload reproduced the safe error UI.

Read-only runtime checks distinguish frontend display from deployment readiness:

- `http://localhost:8000/openapi.json` exposes all four Task 16 routes.
- Unauthenticated notification GET returns 401 with
  `Access-Control-Allow-Origin: http://localhost:5173`; the endpoint and CORS exist.
- Public jobs GET on the same `127.0.0.1:8000` runtime returns 200.
- `alembic current` reports DEV revision `e7a1c3d5f9b2`.
- `alembic heads` reports `f8b2c4d6e1a3`, whose checked source is the migration that
  creates `notifications`.

This is a genuine backend runtime/database deployment blocker after authentication, not
a reason to change frontend routing or fake an empty result. Recruiter/Admin API success,
list/empty states, target clicks, mark-read, desktop/tablet screenshots and manual A→B
privacy switching remain unverified. No fake data was created to bypass the blocker.

## DEV Data Safety / AI Safety

DEV writes: **0**. No application, job, CV, status, notification or account mutation was
performed for evidence. No WebSocket/SSE/push/email/browser Notification API. AI/model
calls: **0 Gemini, 0 Qwen, 0 Ollama, 0 BGE, 0 `/api/chat`, 0 `/api/embed`**.

## Files Changed

Frontend runtime: `src/main.tsx`, `src/App.tsx`, three shell/header/topbar files, two
layout files, two page-metadata configs, and new shared notification type/service/utils/
context/hook/components/page files. Test: `tests/notification-ui.test.mjs`. Report: this
file only. Task 16A/16B reports were not modified.

## Limitations / Final Gate

Automated identity reset is verified, but manual same-tab user switch is not. Admin may
validly be empty only after its API succeeds; the current DB failure must not be mislabeled
as that valid empty state. Task 16 cannot be closed until the existing migration is applied
by an authorized backend operator and all three browser roles are retested.

**CURRENT: TASK 16C — UI CONTRACT VERIFIED — LIVE BROWSER FLOW BLOCKED BY DEV MIGRATION.**
