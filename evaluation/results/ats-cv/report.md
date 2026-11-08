# ATS-CV-01 v2

## Final Status

**ATS-CV-01 v2 — LOCAL CONTRACT VERIFIED**

All seven renderers received an evidence-backed qualification. The qualification source is renderer-level, versioned as `ats-v1`, exposed read-only through the public/admin APIs, and consumed by Candidate/Admin UI. No renderer was labelled before SSR, browser DOM, and representative real-PDF evidence was collected.

## Frontend Worktree

Workspace: `C:\DATN\GJobFrontend`

The worktree was already dirty with the active CV builder/template work. Existing changes were preserved. No reset, clean, commit, or unrelated overwrite was performed.

## Backend Worktree

Workspace: `C:\DATN\GJobBackend`

The worktree was already dirty with the earlier CV content/presentation and template work. Existing changes were preserved. Backend changes in this task are limited to a renderer qualification contract, derived read-only API fields, catalog filtering, and focused tests.

## Pre-change Baseline

- Latest completed frontend baseline from `CV-PDF-01 v2`: **200/200 PASS**.
- Current pre-change TypeScript: PASS.
- Current pre-change production build: PASS, 2,125 modules.
- Current pre-change ESLint completed without diagnostics; the process-session wrapper required manual closure after the Node process exited.
- Initial backend test attempt was safely blocked because the guarded test database was not reachable from the restricted process. The same focused suite was later run outside that restriction against the guarded `gjob_db_test` database and passed.

## Existing ATS State

No pre-existing `ats_status`, `ats_friendly`, or ATS style existed in the frontend template types, backend `CVTemplate` model, public schema, or Admin schema. The product therefore began this task in the safe conceptual state `UNREVIEWED`.

## Architecture Decision

The backend qualification manifest is the canonical source:

`layout_key → renderer qualification manifest → derived ats_status/version → public/admin API → Candidate/Admin UI`

The frontend does not infer ATS capability from renderer names. Candidate filtering sends `ats_status=ATS_FRIENDLY`; the backend converts that status to the qualified renderer-key set.

## Renderer Qualification Manifest

The centralized manifest is `app/contracts/cv_renderer_ats_qualifications.json`. Every current renderer key has one entry containing status and evidence summary. The Python contract returns `UNREVIEWED` for a missing/unknown renderer rather than granting a positive status.

## Qualification Version

Qualification version: **`ats-v1`**.

The version is returned by public and Admin template responses. A material renderer DOM/layout change requires explicit requalification and a new evidence version; the current implementation intentionally does not silently infer continued validity.

## Migration Decision

Migration count: **0**.

No template-level ATS column was added. Status is derived from `layout_key`, preventing independently stale or manually edited states for templates sharing a renderer.

## Core Required Fields

When populated and visible, qualification requires readable text for Candidate name, email, phone, objective, experience role/company/description/date, education school/degree/date/description, and skills.

## Conditional Required Fields

When populated and visible, project, certificate, and language names/content must remain readable. Skill level and language proficiency system enums must remain localized visible text.

## Optional Extended Fields

`project_url`, `credential_url`, certificate lifecycle dates, and secondary metadata are not core ATS pass blockers in `ats-v1` because current renderers do not consistently promise their display.

## Intentionally Omitted Fields

Privacy-sensitive or product-excluded fields such as date of birth are not required for ATS qualification. Missing Candidate data is not replaced with fake placeholders and does not fail the renderer.

## ATS Test Fixtures

ATS fixtures live only in test infrastructure and use deterministic `ATS_*` markers. They are deep-frozen before SSR qualification. Production `sampleCVData.ts` was not populated with qualification markers.

## 42 Core Matrix

**42/42 PASS**: seven renderers × minimal/normal/long fixtures × `vi`/`en`.

The matrix verifies render success, marker completeness, renderer-specific DOM order, locale headings/system enums, empty-section behavior, long-tail preservation, and zero canonical fixture mutation.

## Contract Extension Tests

PASS for all seven renderers:

- visible/hidden section behavior;
- avatar present and missing, plus source-level failed-image fallback contract;
- color/font/heading/spacing overrides;
- missing email/phone without junk placeholders;
- visible link text where rendered;
- localized skill/language system enums;
- unusual long item and final tail marker.

These checks are reported separately and do not inflate the 42-scenario count.

## Browser DOM Evidence

**8/8 representative browser cases PASS** in headless Chrome against the real Vite renderer pipeline. Every case produced a visible document surface with all core/conditional markers and valid `innerText` positions. Cases covered the four single-flow renderers plus all three multi-column renderers, with normal/long and vi/en coverage.

## Raw PDF Text Evidence

**8/8 real browser-print PDFs PASS** using both `pypdf` and `pdfplumber`:

- `MODERN` en normal;
- `CLASSIC` en normal;
- `MINIMAL` en normal;
- `SIMPLE_SINGLE_COLUMN` vi normal;
- `SIMPLE_SINGLE_COLUMN` en long;
- `PROFESSIONAL_SIDEBAR` en long;
- `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR` en long;
- `CREATIVE_DARK_COLUMNS` en long.

All required markers and the long-tail marker were present. Outputs were one to three pages. Temporary PDFs, images, browser profiles, and DOM dumps were removed after verification.

## Normalized PDF Evidence

Normalization was conservative: Unicode NFC, non-breaking-space replacement, and whitespace-run collapsing only. It did not remove arbitrary character-level spacing. Marker completeness and observed order were checked independently for both extractors.

## Unicode / Vietnamese Extraction

PASS. Both extractors preserved coherent `Kinh nghiệm`, `Kỹ năng`, `Ngôn ngữ`, and `Chứng chỉ` text in the Vietnamese PDF. No mojibake or pathological character-by-character spacing was detected.

## Reading Order

- `MODERN`, `CLASSIC`, and `MINIMAL`: both PDF extractors agreed on a coherent single-flow order.
- `SIMPLE_SINGLE_COLUMN`: both extractors agreed on a coherent single-column order; Projects precedes Skills by renderer design.
- Multi-column renderers retained all content, but extractor order differed materially between `pypdf` and `pdfplumber`, justifying `ATS_CAUTION`.

## Multi-column Risk

- `PROFESSIONAL_SIDEBAR`: HIGH/MATERIAL; sidebar-first DOM and extractor disagreement.
- `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR`: HIGH/MATERIAL; contacts/supporting content can move relative to main-column content.
- `CREATIVE_DARK_COLUMNS`: HIGH/MATERIAL; summary/supporting column and experience column can be traversed differently by extractors.

No multi-column renderer lost core content, so none met the threshold for `NOT_ATS_FRIENDLY`.

## Renderer Qualification Matrix

| Renderer | Text Preservation | Core Completeness | Conditional Completeness | Reading Order | Multi-column Risk | Long CV | vi | en | PDF Evidence | ATS Status | Version | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MODERN | PASS | PASS | PASS | PASS | LOW | PASS | PASS | PASS | PASS | ATS_FRIENDLY | ats-v1 | Shared single-flow legacy document contract |
| CLASSIC | PASS | PASS | PASS | PASS | LOW | PASS | PASS | PASS | PASS | ATS_FRIENDLY | ats-v1 | Same semantic/text flow as MODERN |
| MINIMAL | PASS | PASS | PASS | PASS | LOW | PASS | PASS | PASS | PASS | ATS_FRIENDLY | ats-v1 | Same semantic/text flow without decorative risk |
| SIMPLE_SINGLE_COLUMN | PASS | PASS | PASS | PASS | LOW | PASS | PASS | PASS | PASS | ATS_FRIENDLY | ats-v1 | Single column; Projects intentionally precedes Skills |
| PROFESSIONAL_SIDEBAR | PASS | PASS | PASS | CAUTION | HIGH | PASS | PASS | PASS | PASS | ATS_CAUTION | ats-v1 | Sidebar-first DOM; extractors disagree on traversal |
| PROFESSIONAL_CLEAN_RIGHT_SIDEBAR | PASS | PASS | PASS | CAUTION | HIGH | PASS | PASS | PASS | PASS | ATS_CAUTION | ats-v1 | Main/supporting-column traversal varies by extractor |
| CREATIVE_DARK_COLUMNS | PASS | PASS | PASS | CAUTION | HIGH | PASS | PASS | PASS | PASS | ATS_CAUTION | ats-v1 | Two-column reading order varies while text remains complete |

## MODERN

`ATS_FRIENDLY`. Single-flow DOM and both extractors agree on name/contact/objective/experience/education/skills/projects/certificates/languages order.

## CLASSIC

`ATS_FRIENDLY`. Visual centering does not alter the shared coherent document order.

## MINIMAL

`ATS_FRIENDLY`. Reduced decoration retains the shared coherent document order.

## SIMPLE_SINGLE_COLUMN

`ATS_FRIENDLY`. Core and conditional fields, long-tail content, vi/en labels, and raw Vietnamese extraction passed.

## PROFESSIONAL_SIDEBAR

`ATS_CAUTION`. Content is complete, but sidebar-first DOM reads skills/education/languages before objective/experience, and the two PDF extractors produced different column traversal.

## PROFESSIONAL_CLEAN_RIGHT_SIDEBAR

`ATS_CAUTION`. Content is complete, but contact/supporting content and main-column content are traversed differently between extractors.

## CREATIVE_DARK_COLUMNS

`ATS_CAUTION`. Text, contrast, long-tail content, and dark continuation remain intact, but multi-column order varies between extractors.

## Public API

Public template responses expose read-only `ats_status` and `qualification_version`. The catalog accepts the typed `ats_status` filter and filters by renderer keys derived from the canonical manifest.

## Candidate ATS Badge

Only `ATS_FRIENDLY` renders the positive “Thân thiện ATS” badge. The explanation states that GJob checked text readability/structure and does not guarantee every ATS vendor. `UNREVIEWED`, `ATS_CAUTION`, and `NOT_ATS_FRIENDLY` do not receive the positive badge.

## Candidate ATS Filter

The existing catalog filter panel includes “Thân thiện ATS”. It sends `ATS_FRIENDLY` qualification metadata to the API and does not hardcode renderer names in JSX.

## Admin ATS Read-only UX

Admin list/detail surfaces show the qualification badge; detail also shows `qualification_version`. Create/edit payloads and the Admin form contain no writable ATS checkbox or override.

## Matching Firewall

ATS status exists only in renderer/template presentation metadata and API responses. Canonical CV content, fingerprinting, embeddings, cache, ranking, recommendations, precompute, and `content_version` were not changed. The focused backend suite included the existing matching regression contract and passed.

## Frontend Tests

- Focused CV/ATS suite: **48/48 PASS**.
- Full frontend suite: **205/205 PASS**.
- Recurring non-failing warnings: Vite WebSocket port `24678` already in use; one dependency-cache rename `EPERM` warning during the full parallel suite. Test result remained fully green.

## Backend Tests

Focused template/API/matching suite: **40/40 PASS** against the guarded `gjob_db_test` database. Two dependency deprecation warnings were non-failing.

## TypeScript

`npx tsc -b --pretty false` — PASS.

## ESLint

Full-project ESLint — PASS without diagnostics. Touched-file ESLint is included in the final verification pass.

## Production Build

PASS, 2,126 modules transformed. Existing chunk-size advisory remains non-blocking.

## External-call Safety

External calls: **0**. Tests and QA made no Gemini, Ollama, embedding, translation, SMTP, Google, SePay, or arbitrary external HTTP calls. Browser QA accessed only local `localhost:5173`.

## DEV Database Writes

DEV business-data writes: **0**. No DEV migration or seed was executed. Backend tests were guarded to `gjob_db_test`.

## Limitations

- ATS qualification means passing GJob's `ats-v1` technical checks, not guaranteed compatibility with every vendor.
- Multi-column PDFs showed real traversal differences between independent extractors; those renderers intentionally remain `ATS_CAUTION`.
- The long right-sidebar print case produced an extra blank trailing page in Chromium QA while retaining all text; this is a pagination inefficiency, not ATS content loss.
- The synthetic no-space marker name can visually overflow the narrow left sidebar; real names with spaces wrap normally, and extracted text remained complete.
- Qualification invalidation is version/process based; there is no automatic source checksum that changes status after a renderer edit.

## AI-CV-RECOMMEND-01 Readiness

**SAFE TO START.** The renderer qualification boundary is now explicit and read-only. A future recommender may consume status as presentation metadata but must not use it to mutate Candidate content or replace CV–JD matching.
