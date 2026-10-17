# AUX-MONETIZATION-01B — Full-Stack Admin & Recruiter Monetization Management

## Product Scope

Implemented the Admin plan catalog, Admin Recruiter subscription management, and Recruiter current-plan display. Candidate UI remains unchanged. No purchase flow, payment integration, AI entitlement, quota, or model behavior was added.

## Source Review

The 01A model, schemas, repository, service, router, tests, and foundation report were inspected before implementation. The frontend Admin/Recruiter layouts, navigation metadata, Axios refresh behavior, paginated query guard, dialog focus convention, error mapping, test stack, and visual system were also inspected.

## Backend Contract

The frontend consumes the existing 01A endpoints exactly:

- `GET|POST /api/v1/admin/subscription-plans`
- `GET|PATCH /api/v1/admin/subscription-plans/{plan_id}`
- `GET /api/v1/admin/recruiters`
- `GET|POST /api/v1/admin/recruiters/{id}/subscription`
- `POST /api/v1/admin/recruiters/{id}/subscription/revoke`
- `GET /api/v1/recruiter/subscription`

The actual response has `id`, `email`, `full_name`, `is_active`, `effective_plan`, and `subscription`; Company and `is_used` are not assumed. Existing 401/403/404/409/422 semantics are mapped by status and operation context.

## Backend Delta

None. Existing 01A APIs supply all required UI data without N+1 requests. No backend source, model, lifecycle rule, schema, or migration was changed for 01B.

## Architecture

- One Admin route: `/admin/subscription-plans`, mounted inside `AdminLayout`.
- One Admin workspace with two views: dynamic plan catalog and the existing backend Recruiter subscription directory. This avoids inventing a second backend contract or modifying `/admin/users`.
- Recruiter current plan is embedded in the existing `/recruiter/profile` information architecture.
- Centralized strict DTOs, service calls, decimal-safe helpers, status-safe error copy, and reusable accessible dialogs/cards.
- Candidate routes, navigation, components, and services were not changed.

## TypeScript Types

Strict types cover billing period, status, source, plan, effective plan, subscription, Admin Recruiter items, paginated responses, create/update requests, and grant requests. No `any` was introduced. Unknown plan codes degrade to their code/name rather than failing.

## Decimal-safe Money

`price` remains a string in DTOs, form state, request payloads, and rendered state. `formatVnd` groups digit strings directly and safely formats values beyond JavaScript's safe integer range. There is no `Number(price)` or `parseFloat(price)` use. `Number.parseInt` is used only for integer `duration_days`.

## Admin Plan Management

- Dynamic responsive cards support any number of plans.
- Create supports every backend field.
- Edit always locks `code`, `currency`, `billing_period`, and `duration_days` while allowing only `name`, `description`, `price`, and `is_active`.
- No delete action exists.
- Inactive plans remain visible.
- Copy states that deactivation only blocks new grants and that price changes apply to future registrations/transactions.
- Loading, empty, retained-data error, retry, pending, and success states are present.

## Recruiter Subscription Management

The Admin Recruiter view displays full name, email, account state, effective plan, subscription status, start, expiry, and source. It supports paid-plan grant/change and revoke. The selector includes active paid plans only, excluding FREE and inactive plans. Mutations are guarded by one pending lock to prevent duplicate submits.

## FREE Fallback

`effective_plan.code === "FREE"` plus `subscription === null` renders as `Gói hiện tại: Miễn phí`. The UI never creates or synthesizes a FREE subscription row. A revoke response is merged exactly as returned by the backend and therefore returns the row to the backend-provided FREE fallback.

## Recruiter Current Plan

The Recruiter profile shows effective plan name, price, billing period, status, expiry, and source. FREE is shown cleanly after the request resolves. Recruiters receive no Admin controls and no payment/upgrade CTA.

## Candidate Non-Participation

No Candidate file or route changed. Candidate has no plan badge, pricing menu, upgrade CTA, or subscription state. Existing Candidate/recommendation tests remain green.

## Datetime Handling

Optional `datetime-local` inputs are interpreted in the browser's local timezone and converted using `Date(...).toISOString()` before transport. Blank values become `null`; the frontend does not duplicate backend expiry calculation. When both values are present, expiry must be later than start.

## Error Mapping

Safe Vietnamese messages use HTTP status plus operation context. Raw JSON, SQL, traceback, and backend stack details are never rendered.

## Refresh Strategy

Subscription mutations set `gjobSkipDataRefresh: true`. Plan create/update triggers one explicit catalog refetch. Grant/revoke merges the authoritative mutation response into the current Recruiter page once. This avoids global refresh plus explicit refetch plus manual patch at the same time. `usePaginatedQuery` retains its AbortController/request-id stale-response protection.

## Visual Direction

The UI follows the existing neutral Admin/Recruiter workspace: white surfaces, dark hierarchy, rounded cards, subtle borders/shadows, clear semantic status colors, and dynamic card columns. No third-party brand, fixed three-plan assumption, or invented feature list was copied.

## Responsive

Plan cards use one column by default, two at medium widths, and an adaptive third column at extra-large widths. Admin Recruiter rows collapse to stacked controls, dialogs become bottom sheets on small screens, and the Recruiter summary stacks before switching to three columns. Authenticated browser viewport verification was not possible in the current session; responsive contracts were verified by source, SSR, typecheck, and build only.

## Accessibility

Controls use native buttons/labels, text status accompanies color, dialogs use `dialog`/`alertdialog`, focus-trap convention, initial focus, Escape, outside-click handling, disabled pending actions, labelled close buttons, and alert/error associations.

## Backend Tests

- No backend delta was made.
- Current focused command attempted: `.\venv\Scripts\python.exe -B -m pytest -p no:cacheprovider -q --tb=short tests\test_subscriptions.py`.
- Result: safely refused before test execution because `TEST_DATABASE_URL` is absent; the guard explicitly refused fallback to `DATABASE_URL`. No database connection or write followed.
- Historical 01A evidence, not relabelled as current: monetization focused 11 passed; focused regression 55 passed; full backend 965 passed, documented in the existing 01A report.

## Frontend Tests

- New focused: `node --test tests/subscription-ui.test.mjs` — **10 passed, 0 failed**.
- Full: `npm.cmd test` — **89 passed, 0 failed**. Existing Vite HMR port-contention warnings appeared but did not fail tests.
- TypeScript: `node node_modules\typescript\bin\tsc -b --pretty false` — **PASS**.
- Targeted ESLint covering every 01B file — **PASS**.
- Full `npm.cmd run lint` — one documented pre-existing error at `src/components/motion/ScrollReveal.tsx:24` (`react-hooks/set-state-in-effect`); no 01B lint errors.
- Production: `npm.cmd run build` — **PASS**, 2076 modules; existing large-chunk warning remains.
- `git diff --check` — **PASS** with line-ending warnings only; direct edited-file trailing-whitespace scan found none.

## SSR

Vite SSR/static rendering verifies dynamic FREE/paid/unknown plan cards, exact VND formatting, four immutable edit controls, active-paid-only grant options, Admin initial states/navigation, Recruiter FREE fallback, paid plan/source, and escaped React output. No unsafe HTML path was added.

## Browser Verification

The in-app browser was available only at `/login`, without an authenticated Admin or Recruiter session. Frontend configuration points to `http://127.0.0.1:8000`, but there is no proof that this backend uses a TEST database. Under the hard gate, no login fabrication, plan creation/edit, grant/change, revoke, or other mutation was attempted. Admin, Recruiter, Candidate authenticated flows and 375/768/1280 visual viewports therefore remain unverified in a real browser.

## DB Safety

- DEV DB writes: **0**.
- TEST DB writes: **0** in this task because `TEST_DATABASE_URL` was unavailable.
- Browser mutations: **0**.
- No synthetic row or temporary database data was created.
- No migration was created or run.

## External Calls

Gemini: 0. Qwen: 0. Ollama: 0. BGE: 0. SePay/payment gateway: 0.

## Files Changed

- `src/App.tsx`
- `src/config/adminNavigation.ts`
- `src/pages/admin/AdminSubscriptionPlansPage.tsx`
- `src/pages/recruiter/RecruiterProfilePage.tsx`
- `src/components/subscription/AdminRecruiterSubscriptionList.tsx`
- `src/components/subscription/RecruiterSubscriptionDialog.tsx`
- `src/components/subscription/RecruiterSubscriptionSection.tsx`
- `src/components/subscription/RevokeSubscriptionDialog.tsx`
- `src/components/subscription/SubscriptionPlanDialog.tsx`
- `src/components/subscription/SubscriptionPlanGrid.tsx`
- `src/services/subscriptionService.ts`
- `src/types/subscription.ts`
- `src/utils/subscription.ts`
- `src/utils/apiError.ts`
- `tests/subscription-ui.test.mjs`
- This report.

## Limitations

- No authenticated read-only or TEST mutation browser E2E was possible.
- A current backend pytest run requires a guarded `TEST_DATABASE_URL`.
- Full frontend lint retains one unrelated baseline issue in `ScrollReveal.tsx`.
- Payments, subscription purchase, entitlements, quotas, and AI gating remain intentionally out of scope.

## Final Status

**AUX-MONETIZATION-01B — UI CONTRACT VERIFIED — MUTATING BROWSER FLOW NOT VERIFIED**

Recommended input for AUX-MONETIZATION-02: define backend-authoritative entitlement/feature identifiers and quota semantics separately from plan display, then integrate read-only entitlement responses before adding any UI gate. Do not infer AI access from plan code or price.
