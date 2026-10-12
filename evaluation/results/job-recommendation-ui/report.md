# Task 15C — Candidate Job Recommendation UI/UX

## Status

**TASK 15C — UI CONTRACT VERIFIED — LIVE RANKED FLOW NOT VERIFIED.**
The authenticated browser GET returned HTTP 200 and the implemented candidate flow,
CV switching, direct-page recovery, detail/back and responsive layouts passed. The
actual eligible item was `pending`, with null rank and zero reasons, so ranked-item/
reason acceptance is not claimed. Task 15 is not marked complete.

## Source Review

Reviewed candidate routing/navigation, normal job browsing, shared job cards/filters,
job detail and Apply flow, CV list/service/types, Axios interceptors, URL conventions,
refresh events, loading/error components and incumbent design tokens. Backend review
confirmed the exact candidate-only route, query parameters, response schema, 404/409/
422/503 behavior, snapshot binding and cache-only ranking implementation.

## UX Architecture

Added an Operate-mode extension at `/candidate/job-recommendations`; normal `/jobs`
search/browsing remains independent. The page reuses the existing card, filter,
search, detail and Apply surfaces. It uses the existing Plus Jakarta Sans, slate/blue,
spacing, control and responsive conventions. No unrelated redesign or new dependency.

## Navigation

“Gợi ý việc làm theo CV” is exposed as the real, clickable item inside the candidate
header’s **Công cụ** menu. It was removed from the **Việc làm** group and account menu
to avoid duplicate information architecture. Mobile navigation exposes the same route
inside its collapsible **Công cụ** section. The route remains inside candidate role
protection; recruiter access is not enabled.

## API Contract

The frontend calls only `GET /api/v1/candidate/jobs/recommendations` through the
existing Axios instance. Exact types cover recommendation items/status/reasons, counts,
selected CV, pagination and opaque snapshot. It sends no `cv_id` for backend automatic
selection and sends an explicit candidate-owned selection unchanged. It never computes
cosine, ranking, reasons, CV readiness or eligibility.

## CV Selection

The selector lists CV labels from the existing CV endpoint, while the recommendation
response remains authoritative for usability and the selected CV. An explicit switch
clears visible rows through query identity change, resets page 1 and discards the old
snapshot. Explicit unavailable CV copy does not silently switch CV. No-usable-CV and
ownership-neutral 404 states have separate safe guidance.

## Recommendation States

`ranked`, `pending`, `unavailable` and `error` stay visible and usable in server order.
Ranked cards show rank plus “Được xếp hạng theo CV”; non-ranked states use text and
icons, not color alone. No threshold or client-side hiding was added.

## Reasons

Ranked cards render backend `reason.message` values as a semantic list under
“Thông tin liên quan trong CV”. Zero reasons adds no invented explanation. No raw
cosine, percentage, embedding, provider/model/profile/cache/debug field is rendered.

## URL / Snapshot Policy

Public URL state contains only CV, supported filters, page and page size. Snapshot is
memory-only and bound to normalized query identity plus session generation. CV/filter/
page-size changes reset page 1 and invalidate the snapshot. A direct/reloaded later page
without a compatible in-memory snapshot is normalized to page 1 before any request.

## 409 / 422 Recovery

409 and only the specific later-page missing-snapshot 422 discard the snapshot, reset
page 1, advance the session generation and retry once. A recovered-identity guard stops
loops. Other 422 responses use ordinary validation error UX.

## Request Race Handling

AbortController, monotonic request IDs and immutable identity strings prevent responses
from an older CV/filter/page-size/session request from replacing current rows. A test
settles CV B before CV A, then proves the late CV A result is ignored.

## Pagination

Only one backend page is fetched. Page 2+ includes the exact compatible snapshot. The
frontend never fetches all pages, concatenates pages or re-ranks results.

## Application Integration

Cards reuse the existing detail route and pass a safe recommendation `returnTo` value.
The detail page returns to the recommendation surface. Successful Apply now emits the
existing shared data-refresh signal; this invalidates/refetches recommendation context
according to the backend’s applied-job exclusion policy. No manual DEV application was
created for verification.

## Loading / Empty / Error States

CV changes hide old rows and show the existing skeleton language. The page includes
no-eligible-job, no-usable-CV, explicit-unavailable-CV, generic network/server, retry,
manage-CV and normal-jobs states. Provider internals are never shown.

## Accessibility

The CV and page-size selects have labels, status has text plus icons, reasons use a
list, pagination uses `nav`/`aria-current`, loading uses `aria-busy`, notices/errors use
status/alert semantics and controls retain keyboard-sized native affordances. The
mobile filter sheet moves focus to its close control, traps Tab/Shift+Tab, closes on
Escape and restores focus to the trigger. Those four behaviors were verified in the
authenticated browser after the final accessibility patch.

## Responsive Behavior

Verified one-column mobile cards, tablet layout and desktop sidebar/grid at 390x844,
768x1024 and 1440x1000. CV controls, search, card/status and actions remain readable;
DOM inspection reports no horizontal overflow. Reasons have synthetic render coverage,
but no live reason existed in the pending response.

## Automated Tests

- Recommendation-focused: **15 passed, 0 failed**.
- Full frontend: **47 passed, 0 failed** in 7.06s.
- TypeScript `tsc -b`: PASS.
- Vite production build: PASS, 2046 modules. Existing aggregate chunk warning remains
  (~1.50 MB / 366 KB gzip); no bundle redesign was in scope.
- Full ESLint: PASS.
- `git diff --check`: PASS with existing CRLF conversion warnings only.
- Impeccable changed-target detector: `[]`.

Tests cover automatic/explicit CV parameters, public URL normalization, snapshot
compatibility, direct later-page reset contract, one-shot 409/snapshot-422 recovery,
unrelated 422, page-2 token forwarding, CV A/B race ordering, all four statuses,
server order, 0/1/3/long reasons, safe 404/503 copy, no internal leaks, CV availability,
detail return state, successful Apply refresh signaling and the unique placement of the
recommendation route under **Công cụ**. Tests are SSR/mock only and perform no DEV
DB/model request.

## Live Acceptance Gate

Not satisfied for the ranked gate. An allowlisted temporary Axios-boundary observer
captured HTTP 200, page 1/page size 9, a present snapshot and selected CV. The response
had `candidate_signal_status=ranked`, but its sole eligible item was `pending`, with
`recommendation_rank=null` and zero reasons. Therefore no actual ranked item or live
backend reason was observed, and the required VERIFIED label is prohibited.

## Browser Verification

Performed in the existing authenticated Codex In-app Browser on 2026-10-11
(Asia/Saigon); no credential was read or entered by the agent.

- Opened `/candidate/job-recommendations`; backend-selected default CV was displayed.
- Initial and explicit-CV GETs returned 200 and retained the single eligible job.
- Switched explicitly to CV `10089434`; URL gained its `cv_id`, old session was reset,
  and the refreshed pending response rendered under the new selection.
- The one response item stayed visible with “Đang chuẩn bị dữ liệu xếp hạng”. With one
  item only, server-vs-DOM order is trivially identical; no client reorder was observed.
- Direct navigation with `page=2` and no in-memory snapshot normalized back to page 1
  before presenting data. A real multi-page traversal was unavailable (`total=1`).
- Opened the existing Senior Fullstack Developer detail page and returned through the
  explicit “Quay lại gợi ý việc làm” link with CV query preserved. Apply was not clicked.
- Desktop, tablet and mobile show no horizontal overflow. DOM/text inspection found no
  cosine, percentage, score field, BGE-M3, Ollama or Semantic-v1 disclosure.
- The final mobile-sheet check placed initial focus on “Đóng bộ lọc”; Escape removed
  the dialog and restored focus to “Bộ lọc”. The explanatory CV copy now uses only
  user-facing language and no longer mentions backend implementation ownership.

Private ignored captures: `.impeccable/review/job-recommendation-desktop.png`,
`job-recommendation-tablet.png`, `job-recommendation-mobile.png`. They contain existing
account UI and are not public fixtures. Viewport override was reset afterward; the
verified recommendation tab remains open for inspection.

## Zero Model Call Evidence

Source/contract side is verified: the recommendation router calls the synchronous
`CandidateJobRecommendationService.list`; that path builds canonical inputs, reads
`RankingCache.vector`, calculates cosine from cached vectors and saves/loads snapshots.
It never calls `RankingCache.precompute`, the embedding factory, `/api/embed`, the AI
factory or `/api/chat`. Current local Ollama log files are stale (latest file timestamp
2026-10-09) and do not cover the 2026-10-11 E2E request window. No backend temporary
instrumentation was introduced. Therefore B1/B2 exact-window evidence is unavailable
and no browser-only zero-call claim is made; this independently prevents LIVE VERIFIED.

## Cleanup

No DEV DB writes, embedding warm-up, backfill, manual Apply, uploaded file, temporary
account or test record. Build outputs are ordinary tooling outputs. Backend production
code and ranking semantics remain unchanged. Temporary frontend response logging was
removed completely; a final reload produced no new diagnostic entry. No debug endpoint
or counter remains. Three private screenshots are narrowly gitignored and retained for
finish review.

## Limitations

No eligible ranked job existed in this account/session, so live rank/reason rendering
is unverified. Only one eligible job existed, so multi-item order and page-2 snapshot
traversal could not be exercised. 409 and snapshot-specific 422 remain automated-only.
No live unavailable/error item existed. Apply is automated-only by the no-DEV-write
policy. Exact-window provider-call log/instrument evidence remains unavailable.

## Finish Review

The independent Impeccable finish reviewer initially requested two product fixes:
complete keyboard behavior for the mobile filter sheet and user-facing CV-selection
copy. Both were implemented and verified. Its first screenshot pass then requested a
recapture because the browser was scrolled, causing sticky navigation to appear in the
middle of full-page captures. All three viewports were recaptured only after verified
`scrollY=0`; no product code changed for that evidence correction. Final reviewer
disposition: **ship**, with no remaining visual or contract issue. This disposition
does not override the separate live-ranked acceptance gate below.

## Header Tools Placement Refinement

On 2026-10-12, moved the recommendation entry into the existing candidate **Công cụ**
dropdown at the user’s request. The previous non-interactive “tools in development”
card was replaced with the live recommendation link and accurate description. Browser
verification on the authenticated session confirmed the desktop menu item is visible
with `href=/candidate/job-recommendations`; the **Việc làm** and account menus no
longer contain duplicates. At 390x844, the mobile **Công cụ** section exposes the same
link, selecting it closes the drawer and navigates to the route. All mobile navigation
disclosures now expose `aria-expanded` plus stable matching `aria-controls`; the live
browser confirmed false→true state and a visible controlled panel. No API, ranking,
snapshot, authorization or backend policy changed. Final regression after this move:
15 focused tests and 47 full frontend tests pass; TypeScript, Vite build and ESLint pass.
Private ignored evidence: `job-recommendation-tools-desktop.png` and
`job-recommendation-tools-mobile.png`. Independent finish-review disposition: **ship**.

## Final Status

**TASK 15C — UI CONTRACT VERIFIED — LIVE RANKED FLOW NOT VERIFIED.**

Do not mark Task 15 complete: the actual ranked-item/reason gate and exact-window
zero-model-call evidence were not satisfied.

