# CV-PDF-01 v2

## Final Status

**CV-PDF-01 v2 — LOCAL CONTRACT VERIFIED**

The browser-print implementation, representative visual print-preview QA, Chromium print-pipeline verification, and full frontend regression are complete. The product uses the shared renderer, preserves local drafts and dirty state, prints at A4, keeps long content complete, and performs no business-data writes.

## Prerequisite Status

- `CV-TEMPLATE-LOCALE-QA-01 — PASS`
- `CV-TEMPLATE-LOCALE-01 v2 — LOCAL CONTRACT VERIFIED`
- `CV-PDF-01 — SAFE TO START`

The task was not blocked on locale QA.

## Frontend Worktree

Workspace: `C:\DATN\GJobFrontend`

The worktree was already dirty with the active CV builder/template work. Existing changes were preserved. This task added the print controller, print portal surface, print hook, export actions, A4 print CSS, and print tests. No reset, clean, commit, or unrelated overwrite was performed. `git diff --check` reported only existing LF-to-CRLF conversion warnings and no whitespace errors. HEAD remained `21a10b8 Gần hoàn thiện`.

## Backend Worktree

Workspace: `C:\DATN\GJobBackend`

The backend worktree was already dirty from earlier CV tasks. This task made **0 backend source changes** and did not touch the existing migrations. Read-only status inspection reported access warnings for existing temporary test directories. HEAD remained `c79a079 Gần hoàn thiện`.

## Pre-change Baseline

- Full frontend tests: **194/194 PASS**.
- TypeScript: `npx tsc -b --pretty false` — PASS.
- Full ESLint: PASS.
- Production build: PASS.
- Existing warnings: Vite test WebSocket port `24678` already in use; build chunk-size advisory only.

## Existing Print Architecture

Before this task, the renderer registry, seven renderers, A4 document surface, locale resolution, presentation resolution, and editor preview already existed. There was no dedicated browser-print surface or builder-CV export action.

## Export Strategy

The implementation uses the frozen browser-print strategy:

`CVTemplateRenderer → dedicated print portal → @media print → @page A4 → window.print()`

The user must choose **Save as PDF** in the browser print dialog. This is not a one-click PDF download and does not automate the OS save dialog.

## Why Browser Print

The CV remains semantic DOM text, so text remains selectable/searchable and browser pagination is used. No `jsPDF`, `html2canvas`, rasterized whole-page capture, Puppeteer service, server-side Chromium, or backend PDF endpoint was added.

## Shared Renderer Pipeline

Canvas, preview, and print all use `CVTemplateRenderer` and the existing renderer registry. The print path passes `mode="print"`; there is no duplicate PDF renderer.

## Print Surface

`CVPrintSurface` creates a dedicated portal directly under `document.body`. Screen CSS places it outside the viewport and hides it; print CSS hides every non-print root and exposes only the CV. It receives the exact CV content, selected template, resolved local/persisted presentation, locale, section visibility, and settled photo URL.

## Editor Local Draft Export

The editor export action uses current `contentDraft`, `presentationDraft`, current locale, locally selected template, section visibility, and local design overrides. It does not call Save first and does not invoke any persistence service.

## Saved CV Export

Builder-backed saved CV detail pages export persisted server state. Uploaded file CV behavior remains unchanged. The saved builder print surface uses the persisted template and presentation snapshot/overrides.

## A4 / @page

Print CSS declares `@page { size: A4 portrait; margin: 0; }`. The shared document surface is restored to natural `210mm` width and at least `297mm` height. Browser print margin controls remain browser-owned.

## Print CSS

Print rules hide editor chrome, reset transforms, shadows, borders and workspace constraints, restore visible overflow, preserve exact print colors, and apply practical heading/item break rules. Only the `.cv-print-root` direct body child is printed.

## Pagination

The print DOM uses visible overflow and natural document height. It does not force the CV onto one page, shrink the document using editor zoom, or truncate overflow. Normal-sized experience, education, project, and certificate items carry break-avoid behavior; browser pagination remains authoritative.

## Long Content

The long fixture rendered successfully through all seven print renderers in both locales and retained the final long-fixture content in DOM. Chromium print output confirmed physical continuation: long CVs produced 2–3 A4 pages, while the representative normal fixture produced one A4 page. Final experience, project, certificate, and language content remained present and selectable.

## Sidebar Continuation

The implementation prioritizes content completeness and does not force repeated sidebars. Visual checks confirmed readable continuation for `PROFESSIONAL_SIDEBAR` and `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR` in both locales. The sidebar may continue or end independently from the main column, but no content was clipped or lost.

## Creative Dark Printing

`print-color-adjust: exact` and `-webkit-print-color-adjust: exact` are applied to the print tree. Visual QA initially found a white remainder below content on the final dark page. The print surface now marks the dark document explicitly and applies the dark background at page/root level. Re-generated three-page vi/en output confirmed continuous dark background, preserved contrast, no white strip, and readable continuation.

## Font / Vietnamese Glyphs

The existing safe font stacks are reused and do not rely exclusively on one locally installed Windows font. Visual inspection confirmed Vietnamese glyphs such as `Kinh nghiệm`, `Ngôn ngữ`, `Chứng chỉ`, `Hiện tại`, and long English headings render without missing glyphs, clipping, or overlap.

## Locale

The current `vi`/`en` presentation locale is passed to the shared renderer. Automated tests verify Vietnamese/English headings and system labels using identical canonical CV content; candidate-authored content is not translated.

## Avatar / Images

Export waits for `document.fonts.ready` and for print-root images to load/error/decode, with bounded waits. Managed photos disable export while the dedicated print photo is loading. Existing valid/missing/failed avatar fallbacks remain in the renderer, so no PDF-specific duplicate contact/photo markup was added.

## Links

No rasterization or PDF-specific contact duplication was introduced. Existing renderer DOM and any semantic links remain available to the browser print engine. Final hyperlink behavior in the saved PDF is browser-dependent.

## Zoom Independence

Editor zoom, FIT mode, panels, and other editor UI state are excluded from `derivePrintRenderState`. The print surface always renders at natural physical document dimensions. Automated tests compare 50%, 150%, and UI-state variants through the same print state.

## Dirty-State Preservation

Export owns no Save path and changes no content/presentation baseline. Automated tests verify the local edit is present in print DOM while the derived dirty state remains unchanged and true.

## Export UX

Builder CV editor and saved builder CV detail expose **Xuất PDF**. Real asset preparation uses a short **Đang chuẩn bị** state. Preparation failure produces an error without clearing draft state. Duplicate export requests share one in-flight print promise.

## Document Title / Filename Limitations

The document title is sanitized and temporarily set before `window.print()`, then restored. This may improve the browser's suggested name, but no deterministic filename or automatic save destination is promised.

## Automated Print Tests

New automated coverage verifies:

- print state includes current content/template/presentation/locale/photo;
- editor zoom and UI state are excluded;
- safe title and restoration;
- asset readiness;
- one controlled print invocation for duplicate requests;
- dirty-state preservation;
- local section visibility;
- no persistence, embedding, precompute, or matching calls;
- A4/print CSS and non-clipping rules.

## Renderer Print Matrix

**28/28 print-render scenarios PASS**: seven renderers × normal/long fixtures × `vi`/`en`. No fixture mutation occurred. The combined focused CV contracts completed **39/39 PASS**.

## Visual Print Preview QA

**PASS.** The user confirmed the visual print-preview step complete. Independent QA then exercised the same Chromium print pipeline using a temporary DEV-only synthetic `.test` harness and ten temporary print outputs. All temporary harness, profiles, PDFs, rendered pages, and contact sheets were removed afterward.

Verified matrix and results:

- `SIMPLE_SINGLE_COLUMN`, `PROFESSIONAL_SIDEBAR`, `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR`, `CREATIVE_DARK_COLUMNS`;
- both `vi` and `en`;
- normal and long content;
- all ten outputs detected as A4 portrait (`594.96 × 841.92 pt`);
- normal output: one page; long output: two or three pages depending on renderer;
- no editor chrome, horizontal clipping, overlap, or truncated final content;
- page transitions, sidebar widths, avatar fallback, locale labels, margins, and Vietnamese glyphs remained readable;
- extracted PDF text remained selectable and contained the final experience, project, certificate, and locale markers;
- Creative Dark was re-tested after its page-background fix and passed in vi/en.

## Matching Firewall

The print modules contain no `cvService`, persistence, embedding, precompute, or matching calls. Print derives read-only renderer state and does not change canonical CV content or presentation versions.

## Focused Matching Regression

The frontend content/presentation firewall and related CV contracts passed in the focused **39/39** run and again in the full suite. Backend and canonical mappers were not changed, so no DB-backed score recomputation or full backend suite was run.

## Frontend Tests

Post-change full suite: **200/200 PASS**. The recurring Vite WebSocket warning for occupied port `24678` did not fail tests.

## TypeScript

`npx tsc -b --pretty false` — **PASS**.

## ESLint

- Full project `npm run lint` — **PASS**.
- Explicit touched-file ESLint — **PASS**.

## Production Build

`npm run build` — **PASS**, 2,125 modules transformed. The existing chunk-size advisory remains non-blocking.

## External-call Safety

Automated tests and synthetic QA used **0** Gemini, Ollama, translation, embedding, SMTP, Google, SePay, or arbitrary external HTTP calls. Chromium QA loaded only the local `localhost:5173` harness.

## DEV Database Writes

**0**. No business data was created, updated, or deleted; no Save button was clicked during QA.

## Limitations

- Browser print requires the user to choose Save as PDF and destination.
- Filename, margins, headers/footers, background-graphics settings, hyperlink retention, and exact page count remain browser/OS dependent.
- Product export still does not create a PDF programmatically; the temporary Chromium PDF files were QA evidence only and were removed.
- Browser/OS print settings can still affect margins, headers/footers, background-graphics behavior, hyperlink retention, and suggested filename.

## ATS-CV-01 Readiness

The semantic shared-renderer approach and completed print QA make **ATS-CV-01 safe to start**. No ATS badge, score, or classification was added in this task.
