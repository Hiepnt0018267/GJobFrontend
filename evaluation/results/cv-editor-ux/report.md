# CV-EDITOR-UX-01 v2

## Final Status

**CV-EDITOR-UX-01 v2 — LOCAL CONTRACT VERIFIED**

The Candidate CV editor now uses a professional workspace with one local state owner, a dominant registry-backed A4 canvas, explicit-save semantics, guarded navigation, bounded zoom/Fit, and a full-screen local preview. All required automated gates and actual-browser QA passed.

## Worktree Snapshot

- Frontend HEAD: `21a10b8` (`Gần hoàn thiện`). The frontend was already dirty from the completed CV builder/template tasks; those changes were preserved.
- Backend HEAD: `c79a079` (`Gần hoàn thiện`). The backend was already dirty from preceding CV tasks; this task made no backend edits.
- No reset, clean, checkout, commit, migration, or database mutation was performed.
- Final `git diff --check` passed for both worktrees; only existing LF/CRLF conversion notices were emitted.

## Pre-change Baseline

- Full frontend tests: `173/173` passed.
- Candidate editor/renderer/template focused tests: passed.
- TypeScript: passed.
- Production build: passed.
- Full ESLint initially exposed one pre-existing `set-state-in-effect` issue in `ScrollReveal.tsx`; it was minimally corrected, then the full project passed.

## Existing CVInlineEditor Architecture

The former component combined canonical content controls, avatar handling, presentation controls, template selection, and a small preview. The production create/edit pages no longer import it. It remains as an unused compatibility/cleanup candidate so unrelated prior work was not destructively deleted.

## State Extraction

Pure editor rules were extracted to `cvEditorState.ts`: dirty comparison, save route selection, save availability/status, Fit calculation, template switching, section data/state derivation, and presentation patch construction.

## Editor State Owner

`CVWorkspaceEditor` is the single owner of `contentDraft`, `presentationDraft`, initial baselines, active tool/section, zoom mode/percent, preview state, save state, validation, photo draft, and pending navigation. Panels receive values and callbacks; no panel owns a duplicate CV draft.

## New Editor Shell

The production editor is decomposed into header, tool rail, context panel, canvas, zoom controls, preview dialog, and unsaved-changes dialog. Desktop/laptop uses an approximately 80 px rail, 340 px context panel, and the remaining width for the canvas.

## Header

Includes Back, editable CV name, accessible save status, Preview, and explicit Save. A new create flow starts as `Có thay đổi chưa lưu`; `Đã lưu` is not shown before a successful response and reconciliation.

## Tool Rail

Contains exactly: Nội dung, Thiết kế & Font, Thêm mục, Bố cục, Đổi mẫu CV, Thư viện CV. It uses existing Lucide icons and exposes selected state through `aria-pressed`. No AI control was added.

## Content Panel

Reuses the existing content and avatar behavior, grouped into personal information, objective, experience, education, skills, projects, certificates, and languages. Edits update `contentDraft` immediately and make zero API calls before Save.

## Design Panel

Owns only primary/secondary color where supported, font family/scale, line spacing, section spacing, heading style, and the full reset action. It does not expose section visibility.

## Layout Panel

Owns section visibility only. Hiding a section changes `candidateOverrides.section_visibility`; canonical content is retained.

## Add Section Panel

Derives visible-with-data, hidden-with-data, visible-empty, and empty states from canonical content plus resolved presentation. Actions show hidden content or navigate to the relevant content form. No empty experience/project/education/certificate item is fabricated.

## Template Switch Panel

Uses existing catalog records with search and the Vietnamese style filters Tất cả, Đơn giản, Chuyên nghiệp, Ấn tượng. Candidate-facing renderer keys are never displayed. A local switch preserves content and compatible section visibility while resetting incompatible visual overrides; no API call occurs until Save.

## CV Library Navigation

Thư viện CV uses the same `requestNavigation` guard as Back. Same-origin SPA links elsewhere in the mounted GJob shell are captured while dirty and routed through the same confirmation dialog.

## Canvas

The canvas is the dominant surface, uses the existing `CVTemplateRenderer`/registry path, centers the A4 document on a neutral background, and provides independent vertical/horizontal scrolling. No second renderer path was introduced.

## Zoom Architecture

Zoom is editor viewport state only, with explicit `MANUAL` and `FIT` modes and bounded steps `50/75/100/125/150`. It never changes CV content, presentation overrides, or PDF behavior.

## Fit-to-Width

`computeFitZoom` uses viewport width, A4 width, safe padding, and a 50–150% clamp. Clicking 100% exits Fit. Actual-browser QA found and fixed a 150% clipping defect by aligning the transformed document to the scaled compensation wrapper's top-left while the wrapper itself remains centered.

## ResizeObserver

One observer tracks canvas viewport width for Fit recalculation; another tracks natural document height for correct scaled scroll bounds. Fit recalculates automatically as the available canvas width changes.

## Full-screen Preview

Preview is a `document.body` portal covering the complete viewport, including the global GJob header. It renders the same local `contentDraft`, presentation draft, selected template, and renderer; Escape closes, focus is trapped, and closing restores focus to the Preview button. It performs no API call or implicit save.

## Dirty State

Dirty state compares canonical content independently from presentation. `content.template_id` is intentionally ignored because template ownership belongs to presentation. A new unsaved CV is treated as dirty from the outset.

## Navigation Guard

Back, Thư viện CV, editor-triggered navigation, and same-origin anchor navigation share the unsaved confirmation path. Staying keeps every draft unchanged; leaving executes the deferred destination once.

## Browser Back / beforeunload

`beforeunload` protects reload and tab/window close and was verified against Chrome's native warning. `BrowserRouter` declarative mode does not expose React Router's clean `useBlocker` API, so native browser Back is not replaced with a custom SPA blocker; no `popstate` history loop was introduced. Intentional GJob links are still protected through capture-phase interception.

## Save Routing

Pure routing covers `none`, `content`, `presentation`, and `combined`. Existing backend endpoints and snapshot ownership are unchanged; the frontend never sends `template_config_snapshot`.

## Save Status

Supported statuses are `Đã lưu`, `Có thay đổi chưa lưu`, `Đang lưu...`, and `Lưu thất bại`. Save is disabled for no-op/saving states and enabled for a new or dirty CV.

## Ctrl/Cmd+S

The editor prevents the browser default and delegates Ctrl/Cmd+S to the same validated explicit-save function.

## Save Failure Preservation

Errors set `ERROR`, show clear feedback, release the save lock, and retain content, presentation, template, visibility, and pending photo drafts for retry.

## Save Success Reconciliation

After a successful API response, the returned canonical CV and presentation snapshot/overrides replace both initial baselines and drafts before status becomes `SAVED`. Duplicate saves are prevented with a synchronous ref lock.

## Pure State Helpers

Direct helpers cover dirty derivation, save routing/status/availability, Fit zoom, template switching, section data/state, and presentation patch/reset semantics.

## Unit Tests

The final suite has `182/182` passing tests. Editor tests directly execute pure helpers and SSR component structure; renderer tests execute the registry and render real normal/minimal/long fixtures. Source assertions are supplementary, not the primary contract evidence.

## Renderer Regression

All seven registry keys render normal, minimal, and long fixtures. Actual-browser QA used the production workspace with a deterministic in-memory long-CV fixture to inspect `SIMPLE_SINGLE_COLUMN`, `PROFESSIONAL_SIDEBAR`, `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR`, and `CREATIVE_DARK_COLUMNS`. The temporary QA entry was removed afterward. QA also found and fixed the creative renderer's shared white-surface precedence bug.

## Matching Contract

No matching, embedding, scoring, recommendation, or canonical schema logic was changed. Template, style, language labels, visibility, zoom, and unapplied drafts remain outside CV–JD matching.

## Responsive QA

Chrome responsive mode confirmed exact `1440×900` and `1366×768` viewports. At both sizes the rail, context panel, dominant canvas, centered A4 surface, Fit behavior, and independent scroll areas remained usable. Narrow mobile behavior stacks the rail/panel/canvas without claiming an advanced mobile editor.

## Accessibility

Buttons and controls have accessible labels, tools/templates expose selected state, the rail is keyboard operable, form fields are labeled, save status uses a live status role, preview supports Escape/focus trap/focus restoration, and unsaved navigation uses an alert dialog.

## Visual QA

- Opened the actual authenticated Candidate create editor at `/candidate/cvs/create?templateId=10000000-0000-0000-0000-000000000001`.
- Inspected Content, Design, Add Section, Layout, Template, canvas, local template changes, full-screen preview, 50/100/150/Fit, dirty status, library guard, and native reload warning.
- Verified exact laptop viewports through Chrome responsive mode.
- Because DEV catalog data had no active records for the four new renderer keys, inspected them without DB writes through a temporary local page importing the production `CVWorkspaceEditor` and long shared fixture; removed both temporary files after QA.
- Confirmed long-document vertical scrolling and fixed the two visual defects found during this process.

## Frontend Tests

`npm test`: **182 passed, 0 failed, 0 skipped**. Vite printed benign HMR WebSocket port-in-use notices because the local DEV server was open; test results were unaffected.

## TypeScript

`npx tsc --noEmit`: passed.

## ESLint

`npm run lint`: passed. The explicit touched-file ESLint run also passed.

## Production Build

`npm run build`: passed; 2,121 modules transformed. Existing warning remains for the approximately 663 kB `HomePage` chunk.

## External-call Safety

Automated tests made 0 Gemini, Ollama, embedding-provider, SMTP, Google, SePay, or external HTTP calls. The editor QA fixture itself was local and in-memory.

## DEV Writes

Database writes: **0**. Save was never clicked during visual QA. No Admin mutation, migration, seed, or backend endpoint write was performed.

## Limitations

- Native browser Back cannot use a custom blocker under the current declarative `BrowserRouter`; intentional in-app links plus reload/close are protected, and this limitation is documented instead of adding a fragile history loop.
- The old `CVInlineEditor.tsx` remains unused and can be deleted in a later cleanup after confirming no out-of-tree consumer imports it.
- The current DEV template catalog contains many old test-named records and only three active renderer layout types; production component QA for the four new layouts therefore used the removed deterministic in-memory fixture.
- The existing HomePage chunk-size warning is unrelated to this task.

## Next Task Readiness

`CV-I18N-01` is safe to start. The canonical content/presentation boundary, single editor state owner, registry-backed canvas, local draft behavior, and matching isolation are now stable. `CV-I18N-01`, `CV-PDF-01`, `ATS-CV-01`, and all `AI-CV-*` work were not implemented here.
