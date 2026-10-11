# Recruiter AI Ranking Frontend Integration

## 1. Status

**Current action flow PASS: Xếp hạng AI button → dialog → all / Top N results.**
Top N selects only ranked applicants after full ranking; non-ranked remain a separate
accessible group. Actual all/Top1 browser flow verified. Section20 is current:
backend746 tests, frontend18 tests,0 new model calls. Older sections are history.

**Current UX: AI ranking is available only in one job's applicant list, through
Tin tuyển dụng → chọn tin → Xem ứng viên.** Global Ứng viên has no AI controls,
metadata or AI request, even with a job filter/old AI URL. Section19 records the
scope change and current13-test/browser verification; section18 is warm-up history.

Production-cache warm-up and actual ranked browser retest passed on
2026-10-08 (Asia/Saigon). Exactly3 BGE-M3 calls prepared1 JD and2 CVs; subsequent
precompute reused all3 with0 calls. Real frontend GET returns200 and both applicants
ranked with populated rank/score. Desktop/mobile display correct ranks, actual order
changes, detail works and default order restores. Section18 is current evidence;
earlier PENDING/NOT-PASS sections are historical, not current coverage.

## 2. Objective

Small optional recruiter applicant ranking integration. Preserve existing UI/default
ordering,human actions and backend policy. No dashboard/auth redesign or Task15 work.

## 3. Existing Recruiter UI Reviewed

Reviewed applicant page,filters,desktop table/mobile cards,API/types,paginated-query
hook,detail returnTo/human action flow,matching panel and incumbent DESIGN.md.
Existing React19/TypeScript/Router/Axios/Tailwind4/Lucide stack retained.
Requested skills applied to a narrow Operate extension: preserve Plus Jakarta Sans,
slate/blue,component conventions;accessible native controls,text states,responsive
metadata. User's no-redesign constraint overrides new hero/AIDA/GSAP/font-system work.
Impeccable context script ran once;no global design-system replacement.

## 4. Backend Contract Used

Source schema and RUNNING http://localhost:8000/openapi.json inspected.
GET /api/v1/recruiters/applications and
GET /api/v1/recruiters/jobs/{job_id}/applications support sort=ai_match and
ranking_snapshot. Actual lowercase states:ranked,pending,unavailable,error.
Fields:ai_rank,ranking_status,semantic_match_score;response ranking_snapshot.
Optional/nullable frontend fields support old responses. Existing Axios service
already forwards typed query params;no new endpoint or policy/model call.

## 5. Sort UI

The job-scoped applicant page now exposes **Xếp hạng AI**, not an AI dropdown.
It opens the all/Top N dialog; only confirmation activates AI. A clear normal-list
action exits the result view. The global applicant page stays newest-only,
including when filtered by job; AI URL parameters are removed and never requested.
Default requests omit
AI sort/snapshot options,retaining existing server default. URL owns sort/filter/page
state. Changes reset page and snapshot. Invalid/tokenless later AI deep link safely
starts atpage1;no invalid later-page request guessed. Existing search/status/job
filters remain server-side. Sort keyboard/focus markup preserved.

## 6. Rank / Status Display

AI mode only:compact 'Xếp hạng AI #N' plus text status beneath name/in mobile card.
ranked→'Đã xếp hạng';pending→'Đang chờ xếp hạng';unavailable→'Chưa có dữ liệu AI';
error→'AI tạm thời không khả dụng'. Missing legacy fields→'Chưa có thông tin xếp hạng'.
Non-ranked neutral styling avoids implying a defective application. Default mode
hides AI metadata. No 'best/most suitable' claim. Table/card structure unchanged.

## 7. Score Display Policy

**Raw cosine != percentage/probability.** Raw score is not displayed or multiplied
by100. Null/zero do not become '0 điểm' or percentages. Rank/status only;all rows render.

## 8. Pagination / Snapshot Handling

Backend owns order;no local sort/filter/merge. Valid token is sent on subsequent
AI pages. Successful page1 token is persisted into CURRENT URL with replace,so
browser history and explicit detail returnTo preserve the traversal. A verification
GET uses that SAME token,not a new snapshot. Equivalent token promotion retains
displayed rows;request/context stamps prevent old default/page rows appearing as
new AI order. Abort/request guards remain in the existing hook.
Sort/filter/job selection or explicit refresh clears snapshot/page. AI409 offers
restart atpage1;503 offers default order. Invalid session rows are not presented as
current. Paging disabled while fetching/errors or absent required token;missing-token
response gets neutral recovery copy. No silent mixed-session navigation.

## 9. Missing AI Signal Handling

pending/unavailable/error all remain renderable/openable. No score/rank/status-based
client eligibility filter. Missing metadata is not a fatal page error. Entire request
failure still uses existing error surface with AI-specific409/503 recovery.
Neutral skeleton copy says loading list,not 'AI analyzes every applicant'. Empty
state preserved. Default mode retains prior successful non-AI rows during refresh;
AI/default transitions never reuse a stale oppositely sorted response.

## 10. Human Review UX

Small note explains AI only helps ordering and recruiter must inspect CV before
deciding. All detail links remain active independent of AI state. Existing explicit
review/shortlist/reject/hire dialogs/actions untouched. Existing pairwise matching
panel remains an explicit button action;list integration does not trigger it/model.

## 11. Files Changed

- src/types/recruiterApplication.ts:exact sort/status unions,optional nullable fields.
- src/utils/recruiterRanking.ts:query/session helpers and status/rank presentation.
- src/components/recruiter/RecruiterApplicationRanking.tsx:compact metadata display.
- src/components/recruiter/RecruiterApplicationFilters.tsx:explicit native sort select.
- src/components/recruiter/RecruiterApplicationList.tsx:optional table/card metadata.
- src/pages/recruiter/RecruiterApplicationsPage.tsx:request/snapshot/recovery/navigation.
- tests/recruiter-ranking.test.mjs:Node/ViteSSR contract/render tests.
- package.json:test script,no new dependencies.
- This single report. LoginPage/backend/design-system files not changed.

## 12. Tests

**11 passed,0 failed**,node --test tests/recruiter-ranking.test.mjs.
Covers default no-AI params,exact AI sort,deep-link guard,snapshot/filter/page retention,
page1 history-entry query preservation,sort/search/status/job resets,mixed states,
null/zero/no percentage,backend render order,legacy responses,labelled default select,
both actual API paths/GET params. ViteSSR/React static render,not browser lifecycle E2E.
Final tsc-b PASS;vite build PASS;full eslint . PASS;git diff --check PASS.
Build warns about large existing aggregate chunk (~1.46MB,357KB gzip);no unrelated
bundle redesign/dependency install. Exact commands:

```text
node --test tests/recruiter-ranking.test.mjs
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
git diff --check
```

Shell helper failed setup refresh,so commands/read access used supported Node runtime.
Impeccable detector ran once;one conditional-color false positive was clarified via
separate blue/slate style mappings. Independent reviewer found initial history gap;
fix applied and reviewer scored it **resolved in source**,not a rendered/full-E2E pass.

## 13. Manual E2E Verification

**Historical PENDING-flow observation only, not ranked-flow acceptance.** Performed
in Codex In-app Browser, 2026-10-08 (Asia/Saigon). Authentication
prerequisite was resolved by the existing user session; no credentials were read or
guessed. Frontend localhost5173 and backend8000/docs respond200. Existing recruiter
data only: 8 applications across7jobs globally; selected owned job
af78ea14-d186-49e4-b4b5-9622af6f35d6 has2 applications. All8 AI states are PENDING.
Page size10 means no second page exists, even in the global list.

| Scenario | Actual browser result |
|---|---|
| Default newest | No AI metadata; selected-job applicant order captured |
| AI opt-in | sort=ai_match and response ranking_snapshot appear in URL; same2 applicants retained |
| Missing signal | Both pending applicants stay visible; global list retains all8 unique applications |
| Detail / human review | Pending applicant opens; review/reject buttons enabled, never clicked |
| UI Back | Exact AI list URL/token restored |
| Browser Back | Exact AI list URL/token restored |
| Reload | Same AI URL/token retained and rows return |
| Keyboard sort/default reset | ArrowUp on native sort restores newest, removes sort/token; original row order restored |
| Status/job filter changes | Old snapshot not reused; empty filtered state and restored rows correct; no stale mixed rows |
| Invalid snapshot /409 recovery | Unknown32hex token yields explicit restart/default actions; restart returns new token and all8 rows |
| Desktop1440x1000 | Table, controls and pending states readable; no horizontal overflow |
| Mobile390x844 | Stacked filters/cards, pending text and detail links readable; no horizontal overflow |

URL/query and rendered rows are the manual evidence; no browser network trace was
captured. Existing source/automated contract checks establish API parameter forwarding.
All pending rows retain fallback order: actual ranked-score reordering was NOT observed.
No percentages/raw cosine shown. No human action or explicit pairwise match triggered.
Viewport override reset afterward; authenticated list tab retained for inspection.

Private local captures (not benchmark/public data):
.impeccable/review/recruiter-ranking-desktop.jpg,
.impeccable/review/recruiter-ranking-mobile.jpg,
.impeccable/review/recruiter-ranking-mobile-cards.jpg.
Screenshots contain existing profile information and must not be published as fixtures.
A narrow .gitignore rule excludes these recruiter-ranking JPG captures; Git ignore
verification passes. Final git diff --check passes with existing line-ending warnings.

## 14. Test Data Cleanup

**No DEV or TEST DB records created/edited/deleted.** Tests use in-memory synthetic
applicants and stubbed Axios GET;SSR server closes after tests. No auth credential,
account/application fixture,live model,extraction or human-action request created.
No DB cleanup required. Local services not stopped/reconfigured. Build/cache outputs
are normal tooling outputs;no dataset/model/benchmark files touched.

## 15. Known Limitations

At the pre-warm-up verification, no live RANKED/UNAVAILABLE/ERROR examples existed.
Section18 now verifies actual RANKED responses; UNAVAILABLE/ERROR still have only
automated render coverage, not manual E2E. Multiple-page traversal is N/A for
8 records at page size10; automated query/token checks are not live page2 evidence.
503 was not induced by disrupting services/storage; its recovery branch was reviewed
in source, not exercised manually or certified by a browser fault-injection test.
No applicant records or model signals were manufactured to fill these gaps.
Node tests cover query helpers/markup/contracts; the actual history/back/reset flow
and desktop/mobile rendering described above were separately verified in browser.
Backend PENDING/proxy/fairness/quality limits remain unchanged. Older backend lacking
token can still serve default mode;AI later paging intentionally waits for a valid
snapshot. No auto polling,backfill,AI TopN UI or recommendation feature added.
Incumbent DESIGN.md preserved. This verification made no source changes and did not
rerun the already-passed build/test suite; prior results are not labeled new runs.

## 16. Historical Pre-Warm-Up Status

**NOT PASS / NOT END-TO-END VERIFIED.** Earlier demo-ready claim is withdrawn.
Current actual browser request returns200 but only PENDING; usable ranked response
and changed order remain unverified. No select/onChange failure reproduced after
reload. Backend/data readiness must be resolved before ranked-flow acceptance.

Read-only backend diagnosis separately found list ranking is cache-only: missing
CV/JD vectors return PENDING and list/refresh does not initiate embedding. Lifecycle
precompute is best-effort; old entities are not automatically backfilled. This is a
backend/data-readiness issue, not proof of a select-event defect. The default vector
cache directory was absent in that earlier filesystem check; actual runtime cache
configuration has not been verified, so that observation alone is not definitive.
No model warmup, source fix, policy change, DEV junk/write or new regression test.
Temporary diagnostic logging was fully removed; no service change remains. This
SAME report updated; no new Markdown report.

## 17. Actual Default-to-AI Recheck After Browser Reconnection

2026-10-08 (Asia/Saigon), existing authenticated recruiter session; no credential
handling. Initially retained tab showed old list markup without sort control even
though URL contained AI parameters. A real reload loaded the current ranking UI.
No source change was needed to restore it; exact stale-document cause is not proven.
Selected owned job af78ea14-d186-49e4-b4b5-9622af6f35d6 with2 existing applicants.

| Required observation | Actual result |
|---|---|
| Dropdown default to AI | Native select changed to ai_match; onChange effects observed |
| URL | job_id retained; sort=ai_match added; snapshot promoted into URL |
| Frontend GET | /api/v1/recruiters/applications, job_id above, page1, page_size10, sort=ai_match |
| Backend response | HTTP200 |
| ranking_snapshot | 2544ce8078684591b9b6b45cf883232e |
| Both item ai_rank | null |
| Both item ranking_status | pending |
| Both item semantic_match_score | null |
| Snapshot verification GET | Same token sent, HTTP200, same two pending items |
| UI rerender | AI note and both pending badges appear; detail links retained |
| Applicant order | Exact same two IDs as default; no ranked response to test alternative order |

Observed application IDs:5f879042-14ac-4c92-9529-0e4ce9d41892 and
f6c2af68-b66e-490c-be15-14ecfcbf4b53, in that order in response and UI.
Request/status/body-field evidence came from temporary allowlisted logging at the
actual Axios GET response boundary, read via browser console. Only endpoint/query,
status, snapshot, application IDs and ranking fields were logged; no auth headers,
CV text, contact details or full response dumps. This is not a HAR/wire capture.
Logging removed via apply_patch, git diff verifies service unchanged, page reloaded
and PENDING rendering reconfirmed without diagnostic code.

Read-only settings load from backend checkout resolved ranking_cache_root to
C:/DATN/GJobBackend/.cache/recruiter-ranking, with0 vector files and0 leases.
This checks current on-disk configuration, not the already-running server's in-memory
settings. Consistent with observed PENDING and source cache-miss behavior; no DB
session or model call was needed. Missing vector generation is not fixed by changing
select/query/snapshot guards. No backfill was authorized/executed.

Private ignored screenshot:.impeccable/review/recruiter-ranking-pending-recheck.jpg.
No automated tests rerun: diagnostic removed, no permanent runtime fix. Final
git diff --check PASS. Ranked-flow acceptance remains NOT PASS.

## 18. Targeted Existing-Data Cache Warm-Up / Current Final Verification

### Source Review / Plan / Pending Cause

Read MatchingInputService, canonical mapper boundaries, RecruiterApplicationRepository,
RankingCache identity/lease/vector/precompute, lifecycle precompute and BGE factory/
provider. Plan before execution: audit exactly the selected job/two application IDs;
reuse persisted structured data; warm only missing unique vectors; track each actual
HTTP embedding call; replay cache/data; verify real UI ranked response; remove temporary
instrumentation; update this SAME report. No whole-DB backfill or policy redesign.

Read-only DEV transaction (SET TRANSACTION READ ONLY, rollback) verified job
af78ea14-d186-49e4-b4b5-9622af6f35d6 and exactly2 owned applications. Canonical JD/CVs
are nonempty/schema-valid and pass supported-contact checks. All3 compatible vector
records were absent, not stale vectors accepted under a new label. Exact causes:
**B: compatible CV embeddings missing; C: compatible JD embedding missing.**
No evidence of canonical absence, profile mismatch, provider failure or orphan lease.
Legacy entities do not automatically backfill on list; lifecycle is best-effort.
Historical hook execution was not logged/proven, so E is plausible, not asserted fact.

| Application | Candidate | CV | Production structured source |
|---|---|---|---|
|5f879042-14ac-4c92-9529-0e4ce9d41892|11a0e284-4044-4515-84b4-58e6c3036846|4cbdb8da-7afc-4578-bc4a-2007cff0d670|UPLOADED, latest successful extraction27030e02-985c-493e-adb1-5f2299fb9305, not confirmed|
|f6c2af68-b66e-490c-be15-14ecfcbf4b53|8a67f3a5-9e7a-4069-bd98-c57babb1909d|881356f4-a77e-4771-bf63-bf6f174d1f0e|UPLOADED, confirmed authoritative CV fields; latest successful extraction08d54826-295f-496d-980e-c2ea0f6f38ae is not substituted for confirmed fields|

### Identity / Coverage / Production Warm-Up

Version:matching-canonical-v3-explicit-identity-contract; engine semantic-v1.
Profile fingerprint:bcfd85c8e892993fa3111882be45f8beb92a610d191edb4455abb2aed0a908cc.
BGE-M3 digest:7907646426070047a77226ac3e684fbbe8410524f7b4a74d02837e43f2146bab.
Production factory/profile:ollama,bge-m3,num_ctx8192,num_batch4096,truncate=false,
1024 dimensions. No alternate provider/profile, evaluation cache, text truncation
or vector relabeling. Cache:C:/DATN/GJobBackend/.cache/recruiter-ranking.

| Entity | Canonical model JSON SHA-256 | Canonical matching fingerprint | Semantic text SHA-256 |
|---|---|---|---|
|JD af78ea14-d186-49e4-b4b5-9622af6f35d6|0a6cbe77062a6e378d879f5505f14d968859fffd43a295ded91dcc29d3d102c5|ee56db7c7751060878e94390b24dde13caeb573852021a24b07f32b8782b4312|317e23d24781e73658a8deaaea47ce5c25816649744ac614a162f8e55e17e590|
|CV4cbdb8da-7afc-4578-bc4a-2007cff0d670|b080481ada6f6d5d7eced4e88c5dc02061b307d48f5122c9e7690fc73f363db2|648cca23758b405d7a7861d4e7e0ab68c7bde7b31a39d21d428b8a74a2701e11|d634ae031a1d5130993a0182f3c259783a0fcf78e2cd19a66ce8eef6c09d4664|
|CV881356f4-a77e-4771-bf63-bf6f174d1f0e|b8fd24ea43387832dc29e1765f7cc83bdac9da9a5905ef82b67b7be014d80a81|6acb1f7bf634b84820b82d02a7eed4f209d60ffe8cd7ee3d3052fbf79637adba|363f158d7d144bb53d02ed87308e7fc8d3f0973a0f003a36af174664d01451b2|

Called SAME production RankingCache.precompute sequentially on mapper-built inputs;
DB session closed before provider work, same lifecycle operation, no alternate
cache writer. Initial restricted attempt failed cache-write permission BEFORE any
embedding HTTP request; approved elevated retry completed. No authorization bypass.
In-memory HTTP send observer counted actual POST /api/embed, asserted each exact
source hash/profile and one input/request, enforced total<=3. Production provider
has no HTTP retry loop; no outer retry after any embedding response. Model-digest
checks before/after generation are metadata GETs, not embedding calls.

**Exactly3 new BGE embedding calls /3 HTTP requests; all200:** JD first, then the
two CVs above. All3 cached vectors validate as ranked/1024dim under exact identity.
Repeated precompute on all3 unchanged entities produces **0 additional calls**.
No pairwise duplicate embeddings. Cache records retained as intended production data.

### Actual Backend / Browser Retest

Existing logged-in recruiter, same job/two applicants, actual dropdown event.
Default→AI sends GET /api/v1/recruiters/applications with job_id above,page1,
page_size10,sort=ai_match; HTTP200, snapshot74e416a30ec0478d836b09f445c22295.

| Ranked application | ai_rank | ranking_status | Backend raw semantic_match_score | Business status |
|---|---:|---|---:|---|
|f6c2af68-b66e-490c-be15-14ecfcbf4b53|1|ranked|0.4854392920317073|SUBMITTED|
|5f879042-14ac-4c92-9529-0e4ce9d41892|2|ranked|0.44992692063411044|SUBMITTED|

Actual order reverses default's5f879... thenf6c2...; both retained. Same-snapshot
verification GET200 repeats exactly the scores/ranks. Fresh AI session snapshot
585aa464a1b0435fa2837e95aee23286 returns the same ranked response again. GET ranking
is cache-only by audited production source and these3 identity-compatible hits;
no provider/precompute invocation in list requests. Cache-read re-audit after actual
requests confirms3/3 ranked hits, exact canonical hashes/fingerprints unchanged.

UI shows Xếp hạng AI #1/#2 and Đã xếp hạng on desktop1440x1000 and mobile390x844.
No percentage/raw score rendered, no horizontal overflow. Ranked applicant opens
detail; human-action buttons remain available and never clicked. UI Back preserves
snapshot. Switching to newest removes AI sort/token, hides AI metadata and restores
exact default order. Second AI selection repeats ranked order. Actual browser
evidence, NOT SSR/mock acceptance. One badge locator hit a hidden desktop/mobile
duplicate; fresh AX/screenshot confirmed visible ranks, not a product defect.

Old PENDING snapshot remains unchanged after warm-up by design; switching default→AI
creates a new snapshot. Reloading an old token alone does not recompute availability.

Temporary allowlisted Axios response logging captured only endpoint/query/status,
snapshot/application IDs/business status and ranking fields; no auth/raw CV/contact
payloads. Logging fully removed, git diff shows service unchanged; final page reload
still renders ranked cache response. Private ignored screenshots:
.impeccable/review/recruiter-ranking-ranked-desktop.jpg and
.impeccable/review/recruiter-ranking-ranked-mobile.jpg. Viewport reset afterward.

### Safety / Tests / Cleanup / Follow-Up

No extraction/Qwen/Gemini, candidate/job/application mutation, junk records, migration,
threshold, auto-reject/hide, changed default/policy/cosine/Semantic-v1 or frontend fix.
Before/after selected source/extraction identities, canonical hashes and SUBMITTED
statuses match. DB access read-only; no commit. Frozen evaluation artifacts untouched.
Only production vector cache/snapshots, existing report and private captures written.
No disposable DB data or lingering task process. Valid3 vectors intentionally kept.
Temporary in-memory observers exited; temporary frontend diagnostic code removed.

No permanent production code change, so no unnecessary new tests/full DEV pytest.
Historical11 tests/type-check/build/lint remain prior regression evidence, not rerun
results. Current real readiness/cache/browser checks PASS; git diff --check PASS.
Multiple-page live check N/A for2 applicants, per task; existing automated query
coverage unchanged. Broader legacy data may need a targeted operator/admin backfill
path later; not implemented or run here. This does not certify recruitment quality.

**FINAL: PASS — RECRUITER AI RANKING / BACKEND + FRONTEND / END-TO-END VERIFIED.**
**READY FOR TASK 15 — AI JOB RECOMMENDATION.** Task15 not started in this task.

## 19. Job-Scoped-Only AI Ranking UX

2026-10-08 (Asia/Saigon), user-requested scope refinement, no backend policy change.
Required flow: **Tin tuyển dụng → chọn một tin → Xem ứng viên → AI match**.
Ordinary global **Ứng viên** remains newest-order browsing/search/status/job filtering.
Selecting a job filter in the global directory does NOT enable AI.

Implementation:
- RecruiterApplicationFilters exposes ranking sort only with showRankingSort=true;
  both ordinary global and job-scoped layouts retain3 aligned desktop controls.
- RecruiterApplicationsPage passes route isJobScoped into query builder and controls.
- recruiterListScopeQuery strips sort/ranking_snapshot/ai_top_n from global deep links;
  ordinary search/status/job/page remain. Query requests are non-AI immediately,
  before the URL-cleanup effect, so no transient forbidden global-AI request.
- Job-scoped default stays newest; AI remains explicit opt-in. Same snapshot guards,
  ranked badges, detail returnTo and human review behavior retained.
- Backend still supports its existing endpoints; this is a frontend feature-scope
  rule, not a backend authorization restriction or ranking-policy rewrite.

Current automated verification: **13 passed,0 failed in8.22s**; TypeScript-b PASS,
Vite production build PASS (2038 modules, existing large-chunk warning), full ESLint
PASS. Added regression for global AI deep links including job filter and ordinary
page preservation; global control absence and job-scoped default→AI selection.
Impeccable Operate guidance kept incumbent controls/layout, no visual-world redesign;
changed-target detector returned[]/exit0. No new dependency or generated imagery.

Actual browser verification, existing session/data/caches only:
- Reloaded old global AI URL: ranking parameters removed, job filter retained,
  default rows shown,0 sort controls and no rank/AI note.
- Clicked Tin tuyển dụng, selected the existing job, then clicked Xem ứng viên.
- On /recruiter/jobs/af78ea14-d186-49e4-b4b5-9622af6f35d6/applications,
  selected AI match; URL carries sort=ai_match and snapshot
  ba30eee173494481b7e7f62ad42d4209. Both actual cached applicants render rank1/2
  and Đã xếp hạng. No mock data substituted for manual evidence.
- Desktop1440x1000, mobile390x844 and current user viewport captured; global and
  scoped screens preserve readable controls/detail links, mobile no horizontal
  overflow. Global AI deep link tested again on mobile: no AI controls/ranks.
- Viewport reset; job-scoped AI tab left for inspection. No business button clicked.

Private ignored evidence under .impeccable/review/:
recruiter-ranking-global-only-desktop.jpg, recruiter-ranking-global-only-mobile.jpg,
recruiter-ranking-job-only-desktop.jpg, recruiter-ranking-job-only-mobile.jpg,
recruiter-ranking-job-only-user.jpg. These contain existing applicant profile data;
do not publish. No new model call/cache warm-up/DEV write/evaluation-data change.
Existing3 production vectors reused; no new Markdown report. DESIGN.md unchanged.

Independent finish reviewer disposition: **ship**, narrow scoped-contract review.
Read all changed source and5 screenshots; no blocking issue with first-request
global gating, controls/badges, job-scoped snapshot behavior or visible layout.
Reviewer did not independently rerun browser/tests or certify computed contrast/
all accessibility states. No fix/rebuild/recapture owed. Documentation stays in this
surface report; no global DESIGN.md refresh because visual identity did not change.
Final git diff --check PASS. **PASS for job-scoped-only frontend AI UX.**

## 20. AI Ranking Action Modal + Ranked-Only Top N Result Mode

### Scope / Source Review / Plan

2026-10-08 (Asia/Saigon). Replace the job-scoped AI dropdown with an explicit button
and small accessible dialog, without redesigning other recruiter screens. Source
review covered endpoints/owner filters, service/canonical/cache/snapshot boundaries,
legacy ai_top_n, schemas, synthetic ranking/freeze/robustness tests; frontend page,
filters/list/rank metadata, query helpers, detail state and incumbent action-dialog
motion/surfaces. Plan stated before edits: explicit request contract; full ranking
before ranked-only selection; preserve every non-ranked row; transport pagination
after selection; full-pool snapshot; modal/query/groups/normal return; synthetic tests,
guarded full suite, cached real-browser verification, one report and cleanup.

### Request / Backward Compatibility / Result Membership

New opt-in request, on the existing job endpoint:

```text
GET /api/v1/recruiters/jobs/{job_id}/applications?sort=ai_match&ranking_mode=all
GET /api/v1/recruiters/jobs/{job_id}/applications?sort=ai_match&ranking_mode=top_n&top_n=10
```

page/page_size remain transport controls, not AI limits. ranking_mode is all/top_n;
top_n must be a positive integer, required for top_n and forbidden for all. Reject
mixing new mode with legacy ai_top_n, top_n without mode, or AI options with default
sort. Invalid options422 before canonical/cache ranking work. Legacy ai_top_n callers
retain their old contract; new frontend uses ONLY new explicit mode/top_n semantics.
This compatibility path does not make old mixed slicing the new UI's behavior.

Authorization and business filters run before ranking. Existing cache-only resolver
evaluates the complete logical pool, globally sorts ranked rows with unchanged cosine
and stable default-order ties. New mode then partitions:
- all: every ranked row plus every pending/unavailable/error row;
- top_n: first min(N,ranked count) ranked rows plus EVERY non-ranked row.

No padding with missing states; their ai_rank/score stay null. Explicit Top N is a
user-requested result slice, not suitability eligibility or automatic business hiding.
Ranked rows below N remain available in the normal/full list. No threshold, reject,
shortlist/hire, status mutation or claim of absolute suitability.

Single response items is the transport page of selected-ranked + all-unranked. New
metadata:ranking_mode,requested_top_n,ranked_available_count,returned_ranked_count,
unranked_count. total is selected ranked + non-ranked; total_pages=ceil(total/page_size).
UI groups the current page by backend status ONLY, never scores/sorts/slices locally.
If a group lives on another transport page, its full count and explicit paging copy
remain visible. All non-ranked rows are retained in logical results, not forced into
the first network response. N>page_size can span pages. No silent dropped query/pool.

### Snapshot / Navigation

New grouped contract snapshots store the complete ranked pool BEFORE Top N slicing.
Binding adds ranked-only-top-n-v1 contract identity and ranking_mode alongside N,
owner/filter/page-size/applicant/canonical/runtime identities. Whole-pool snapshot
validation prevents duplicates, invented ranks/scores or omissions. Subsequent pages
derive the same selected membership and counts from frozen snapshot rows, without
new vector lookups. Mode/N/filter changes need a new token; old-contract snapshots
are not relabeled. Existing expiry409 and safe default/503 recovery retained.

Frontend action confirmation resets page/token, sets mode/N, closes dialog; filter
changes retain mode/N but reset page/token. Detail returnTo retains mode/N/page/token.
Về danh sách thường clears sort/mode/N/legacyN/token/page and keeps business filters.
An incompatible response missing grouped metadata fails closed with normal-list
recovery instead of pretending the old mixed response is a correct Top N result.
Global Ứng viên still has no AI action and strips all AI URL options before requests.

### UI / Accessibility / Copy

Xếp hạng AI opens native dialog with accessible title/description, all and Top N radio
options, N initially10, Hủy/Xem kết quả. No AI activation before confirmation. Reopening
an active result seeds current mode/N. N is a positive safe JavaScript integer for
exact query serialization, not a relevance threshold. Invalid/blank/fractional values
disable submit; no arbitrary product maximum introduced. Existing dialog styling and
motion retained; native top layer provides background inertness and Escape behavior.
Focus returns to trigger on close. Actual browser found Tab could escape at the last
control; added explicit shared Tab/ShiftTab boundary helper, regression and manual
retest. Final Tab wraps to close and ShiftTab wraps to confirm, both inside dialog.

Headings: Xếp hạng ứng viên bằng AI / Top N theo xếp hạng AI and
Chưa thể xếp hạng (count). No phrase phù hợp nhất, fake non-ranked rank or percentage.
Compact human-review note retained. All detail/human review entry points remain;
no business-action button clicked. All three requested skills used for compact Operate
clarity, typography/contrast/focus/responsiveness and restrained micro-interactions;
precise no-unrelated-redesign brief overrides cinematic hero/GSAP/new-font defaults.
DESIGN.md/world unchanged. Detector returned[]/exit0 once; independent reviewer
disposition **ship** after source and all five viewport captures, no material fixes
owed. Reviewer did not independently execute tests/browser or certify every a11y state.

### Tests / Commands / Real Browser Evidence

- Targeted backend: **80 passed,2 warnings in2.07s**, --noconftest, synthetic fixtures.
  Covers all5+2pending, Top10 from20ranked+3pending after full-pool resolution,
  transport-page continuity, fewer6ranked+4missing/no padding, all missing states,
  zero ranked, invalid mode/N/domain/API422 without AI work, mode/N snapshot changes,
  unchanged business statuses and legacy/frozen-policy regression.
- Full backend: **746 passed,3 warnings in196.49s (0:03:16)**, existing guarded
  gjob_db_test only. TEST_DATABASE_URL validated against DEV, actual database name
  checked, child credentials kept in memory/redacted. No new DB/config/migration file.
  Existing test schema bootstrap/fixture cleanup only, no DEV test fallback.
- Final frontend: **18 passed,0 failed in1.54s**. Covers button/default opt-in, modal
  options/default10/invalid N, focus boundaries, correct all/Top N query, global gate,
  mode/filter/normal resets, returnTo snapshot state, group/no-padding/no-fake-rank,
  no client reordering, exact endpoint GET forwarding and prior regressions.
- Final TypeScript-b, Vite build (2041 modules), full ESLint: PASS. Existing large
  bundle warning remains (~1.47MB/359KB gzip); no unrelated dependency/code splitting.
- Frontend git diff --check: PASS (existing LF/CRLF warnings). Backend checkout has
  no Git metadata, so its git diff --check returned129/N/A; direct whitespace check
  on all five edited backend files found0 trailing-whitespace lines. Not called PASS
  for an unavailable backend Git diff.

Initial targeted test run had1 synthetic endpoint401 because its auth override
inspected lazy included app routes rather than the router's dependency objects.
Fixed the fixture override; rerun80passed. No production auth relaxed. Early pytest
cache permission warnings avoided in final runs with -p no:cacheprovider.

```text
venv\Scripts\python.exe -B -m pytest --noconftest -p no:cacheprovider tests/test_ranking_result_mode.py tests/test_applicant_ranking.py tests/test_ranking_robustness.py tests/test_ranking_policy_freeze.py tests/test_ranking_fairness_guards.py -q --tb=short
venv\Scripts\python.exe -B -m pytest -p no:cacheprovider -q --tb=short
node --test tests/recruiter-ranking.test.mjs
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
git diff --check
```

Full pytest launched in a guarded secret-redacted child process, not an unguarded
shell using DEV. Default shell helper unavailable; frontend build/lint also ran via
approved process tools. Read-only cache/source diagnostics and browser actions added.

Actual existing recruiter/job/two-applicant browser flow:
- Normal page2rows, action opens without changing URL/request to AI; Top option shows
  N10. N0 disables confirm. ESC closes and restores trigger focus; Cancel unchanged.
- all confirm: exact job endpoint GET200, ranking_modeall, no top_n, counts2/2/0,
  snapshot2e63b24928de4e7785f3ebc8a69b21f3, both actual ranks1/2 rendered.
- Return normal: both original rows/default order available.
- Top1 confirm: GET200, ranking_modetop_n,top_n1, available2/returned1/unranked0,
  snapshotf66548b7aca34e5eaed4f814fd08a024, exactly1 ranked detail link. Actual result:
  applicationf6c2af68-b66e-490c-be15-14ecfcbf4b53,rank1,score0.4854392920317073,
  statusSUBMITTED. Other application's status also remainsSUBMITTED in all/default.
- Same-token verification returns same response. Detail/UI Back restores exact
  Top1 URL/mode/N/token. Status filter retainsN1, resets token to
  bd657b770fc94872b317178257b11142. Normal return retains filter and shows both rows.
- Desktop1440x1000/mobile390x844/user viewport captured; no percentage or horizontal
  overflow. Initial immediate-resize desktop modal capture was malformed; replaced
  after DOM-confirmed512px bounds/settled capture, not shipped as valid evidence.
  Keyboard boundary fix confirmed in actual browser and final captures refreshed.
- Global URL with mode/N/token normalizes to /recruiter/applications with0 AI actions.

Request/status/body evidence used temporary allowlisted Axios response logging,
not a HAR. Logged only endpoint/query/status/counts/snapshot/application IDs/ranking
fields, no auth/contact/raw CV/provider output. Logging removed, service diff empty;
final page still works without instrumentation. No live non-ranked demo records or
multiple pages exist: those cases are SYNTHETIC TEST coverage, not manual evidence.

### Files / Safety / Cleanup / Final Status

Backend edits:app/schemas/recruiter_application.py, app/routers/recruiter_applications.py,
app/services/recruiter_application_service.py, app/services/applicant_ranking_service.py;
new tests/test_ranking_result_mode.py. Frontend:types/recruiterApplication.ts,
utils/recruiterRanking.ts, new utils/dialogFocus.ts, RecruiterApplicationFilters.tsx,
RecruiterApplicationsPage.tsx, new RecruiterRankingDialog.tsx/RecruiterRankingResults.tsx,
tests/recruiter-ranking.test.mjs and this SAME report. No permanent API service logging.

**New model calls: BGE0,Qwen0,Gemini0.** Existing three1024dim ranked cache records
retain warm-up computed_at1791437467.7760148/1791437469.7303479/1791437471.9524562
and profilebcfd85c8e892993fa3111882be45f8beb92a610d191edb4455abb2aed0a908cc.
Semantic-v1 core hash unchanged:
0c347e9dd24ab68b10e2c95a3eea7d634e40a9c094c07e206aed0e62d1319fdf.
No extraction, embedding regenerate, threshold, protected-attribute feature,
business record/status mutation, DEV junk, ORM migration or frozen evaluation/policy
artifact modification. Policy/scorer/profile not retuned; only explicit result
presentation contract added. Default list remains. Synthetic fixtures clean up;
no task batch/temporary script remains. Valid production vectors not deleted.

Private ignored captures:.impeccable/review/recruiter-ranking-action-dialog-desktop.jpg,
action-dialog-mobile.jpg, action-dialog-user.jpg, action-results-desktop.jpg,
action-results-mobile.jpg (all filenames carry recruiter-ranking- prefix). Existing
profile information must not be published. Viewport reset, local tab retained.
This is the ONLY report updated for the refinement; no extra Markdown summary.

**FINAL: PASS — RECRUITER AI RANKING ACTION FLOW — END-TO-END VERIFIED.**
Ready for Task15. Task15 requires its own recommendation brief/acceptance scope;
no recommendation/tuning work was inferred or started in this refinement.
