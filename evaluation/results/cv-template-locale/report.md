# CV-TEMPLATE-LOCALE-01 v2

## Final Status

**CV-TEMPLATE-LOCALE-01 v2 — LOCAL CONTRACT VERIFIED**

**CV-TEMPLATE-LOCALE-QA-01 — PASS**

Implementation, automated verification, and post-change Visual QA are complete. The four required production renderers passed in both `vi` and `en` on the live local frontend, in the editor canvas and full-screen Preview.

## Frontend Worktree

- HEAD: `21a10b8` (`Gần hoàn thiện`).
- The worktree was already dirty from preceding CV tasks; all unrelated changes were preserved.
- No reset, clean, checkout, commit, or destructive operation was performed.
- Final `git diff --check` passed; only existing LF/CRLF conversion notices were emitted.

## Backend Worktree

- HEAD: `c79a079` (`Gần hoàn thiện`).
- The backend was already dirty from preceding CV tasks.
- This task made zero backend source, test, schema, or migration edits.
- Focused existing backend contracts were only executed against the verified test database.

## Pre-change Baseline

- Frontend tests: `182/182` passed.
- TypeScript: passed.
- Full lint and build were started during baseline; their initial output capture was handed off by the long-running command. Both were rerun after implementation and passed.
- Existing benign test warning: Vite HMR port `24678` was already in use by the running DEV server.

## Existing Locale Contract

The existing contract was reused unchanged: `CVPresentation.locale`, frontend `CVPresentationLocale`, and API values are exactly `vi | en`; backend default is `vi`.

## No-Migration Verification

No migration was created or changed by this task. No Alembic command was run. Existing uncommitted migration files belong to earlier CV tasks and were preserved.

## Frontend Locale Gaps

The source audit confirmed that renderer presentation, editor presentation draft, save-patch derivation, renderer headings, present labels, and system enum display were missing locale propagation. Those gaps are now implemented.

## CVRenderPresentation Locale

`CVRenderPresentation` now accepts optional `locale`; renderer resolution normalizes missing or invalid runtime input deterministically to `vi`. Resolved renderer presentation always carries a concrete locale.

## Editor Draft Locale

`CVEditorPresentationDraft` owns `locale`. Existing CVs initialize it from persisted presentation; legacy/missing state falls back to `vi`. Save reconciliation reloads the persisted locale.

## Central Label Dictionary

`src/components/cv/cvLocale.ts` is the single CV-document localization layer. It owns VI/EN section labels, presentation placeholders, present labels, enum labels, fallback normalization, and display-only date formatting.

## System Enum Localization

All current skill levels (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`) and language proficiencies (`BASIC`, `CONVERSATIONAL`, `PROFESSIONAL`, `FLUENT`, `NATIVE`) render localized labels. Unknown/free-form values are preserved verbatim.

## Present / Date Formatting

Ongoing items render `Hiện tại` or `Present`. Deterministic year/month/day values render locale-aware display strings without mutating stored values or inventing missing precision. Unsafe or free-form date strings are preserved.

## Renderer Integration

The shared renderer path passes locale to all seven registered layouts. Hardcoded document headings, present markers, and raw enum displays were removed from `CVDocumentView` and `CVStructuredLayout`.

## Candidate Locale Control

The Design panel now exposes `Ngôn ngữ mẫu CV` with `Tiếng Việt` and `English`. Changing it only updates the local presentation draft.

## Dirty State

Locale participates only in presentation dirty state. Automated tests prove `vi → en` sets `presentationDirty=true`, `contentDirty=false`, and `en → vi` returns to clean when no other field changed.

## Existing CV Save

Locale-only changes derive `{ locale: 'en' }` and route to the existing presentation endpoint. The content endpoint is not selected. Save reconciliation restores a clean persisted draft.

## New CV Save Flow

New CVs are created first. The returned builder CV locale is then compared with the draft. Default `vi` causes no redundant PATCH; `en` causes a presentation PATCH only after `cv.id` exists. Visual overrides can share that same post-create presentation PATCH.

## Template Switch

Template switching preserves the Candidate-selected locale, preserves section visibility, resets the existing visual-override subset as before, and performs no API request before Save.

## Reset Behavior

Design reset still clears only `candidateOverrides`. Locale is a separate draft field and remains unchanged, including when locale is `en`.

## Catalog Preview Locale

Candidate catalog preview now passes `locale: 'vi'` explicitly and retains its non-persisting behavior.

## Editor Preview Locale

Canvas and full-screen Preview share the same renderer element and current local locale draft, so unsaved locale selection is reflected without an API call.

## Content Immutability

VI and EN render from the same canonical fixture objects. Candidate-entered names, companies, job titles, descriptions, schools, projects, skills, technologies, certificates, and language names remain unchanged.

## Deep-Frozen Fixtures

Renderer locale fixtures are recursively frozen before rendering. All renders complete without mutation exceptions, and serialized canonical content remains byte-identical before and after rendering.

## 42-Combination Renderer Matrix

All `7 renderers × 3 fixture sizes × 2 locales = 42` combinations rendered successfully. Minimal fixtures also prove empty sections do not emit VI or EN headings.

## Matching Regression

A dedicated in-memory `vi → en` verification using the frozen matching helpers passed: canonical mapping, CV fingerprint, and cache identity stayed identical; `content_version` stayed unchanged; baseline score delta was `0.0` (within `1e-12`). No embedding or precompute call was made.

## Focused Backend Contract Tests

- `.env` target name: `gjob_db_test`.
- Direct `SELECT current_database()`: `gjob_db_test`.
- `tests/test_cv_presentation.py` plus `tests/test_match_regression_contract.py`: `22/22` passed.
- Only existing deprecation warnings were emitted.

## Frontend Tests

Full suite: `191/191` passed, up from the pre-change `182/182`. Focused CV suite: `41/41` passed.

## TypeScript

`npx tsc --noEmit`: passed.

## ESLint

`npm run lint`: passed. Explicit touched-file ESLint also passed.

## Production Build

`npm run build`: passed; 2,122 modules transformed. The existing approximately 663 kB `HomePage` chunk warning remains unrelated to this task.

## Visual QA

Visual QA ran on `http://localhost:5173` in Chrome using the actual production `CVWorkspaceEditor` and the real renderer components. A temporary local-only harness supplied a long synthetic fixture (`example.test` contact data); it performed no Save and was removed immediately after QA. The existing authenticated Candidate editor tab and its unsaved data were preserved.

- Primary viewport: `1440 × 900`.
- Representative viewport: `1366 × 768`.
- At `1366 × 768`, every renderer was checked in `vi` and `en` on both canvas and full-screen Preview.
- At `1440 × 900`, every renderer was rechecked on canvas and full-screen Preview with the longer English labels; the dark layout was also the Reset-behavior verification target.

| Renderer | vi Canvas | vi Preview | en Canvas | en Preview | Result |
| --- | --- | --- | --- | --- | --- |
| `SIMPLE_SINGLE_COLUMN` | Pass | Pass | Pass | Pass | **PASS** |
| `PROFESSIONAL_SIDEBAR` | Pass | Pass | Pass | Pass | **PASS** |
| `PROFESSIONAL_CLEAN_RIGHT_SIDEBAR` | Pass | Pass | Pass | Pass | **PASS** |
| `CREATIVE_DARK_COLUMNS` | Pass | Pass | Pass | Pass | **PASS** |

Observed labels included all section headings, `Hiện tại`/`Present`, skill levels, and language proficiencies. Candidate-authored Vietnamese content remained unchanged when the presentation locale switched to English. No clipped headings, column overflow, glyph corruption, unreadable contrast, or canvas/Preview divergence was found. The right-sidebar renderer intentionally presents contact values without a `Contact` heading, so no static contact label is applicable there.

Template switching preserved the selected locale across multiple renderers. Reset verification changed the font from Inter to Roboto, invoked `Khôi phục thiết kế và bố cục mặc định`, and confirmed the font returned to Inter while locale remained English.

## External-call Safety

Automated verification made zero translation, Gemini, Ollama, embedding-provider, SMTP, Google, SePay, or external HTTP calls. Matching verification used deterministic in-memory vectors/helpers.

## DEV Writes

DEV database writes: **0**. No Save action, Admin mutation, migration command, or DEV endpoint mutation was performed. Focused DB tests ran only against verified `gjob_db_test`.

## Limitations

- The unused legacy `CVInlineEditor.tsx` still contains its older private draft type; active Candidate routes use `CVWorkspaceEditor` and are fully localized.
- The existing HomePage chunk-size warning remains.

## CV-PDF-01 Readiness

The locale architecture, renderer matrix, save routing, matching firewall, and required Visual QA are verified. **CV-PDF-01 — SAFE TO START.**
