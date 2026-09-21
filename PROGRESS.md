# PROGRESS.md — Development Log

### 2026-09-14 — AI Response Schema Builder (Settings page + sibling reusable tool)
- **New sibling repo `schema-builder`** (`/Users/louis/coding/schema-builder`, standalone, not a submodule): a drag-and-drop React + TypeScript tool for visually building JSON Schemas matching the exact subset `ai-service/app/gemini_client.py::_dict_to_schema` accepts (`type`, `description`, `enum`, `properties`, `required`, `items`, `minimum`, `maximum`). Stateless — no backend, copy/download the resulting JSON. Its pure schema logic (`src/lib/{types,id,schema,tree}.ts`) is compiled to `lib/` via `npm run build:lib` and exported from the package root so it can be depended on by other projects, not just run as a standalone app.
- **`frontend/`**: added a new "Settings" view (`components/SettingsPage.tsx`, reachable from the sidebar and the header gear icon) embedding the same schema builder, restyled to CareerFlow's existing Tailwind design tokens and Material Symbols icons (`components/schema-builder/{SchemaBuilder,FieldRow,SchemaPreview,ImportDialog}.tsx`). `frontend/package.json` depends on the sibling repo via `"schema-builder": "file:../../schema-builder"` (npm installs this as a symlink) rather than duplicating the schema logic — a `build:lib` rerun in `schema-builder` is picked up immediately.
- Added `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` to both `schema-builder` and `frontend` for the drag-to-reorder field UX.

**Validation Performed**:
- `schema-builder`: `npm run build` (tsc + vite build), `npm run build:lib`, `npm run lint`, and `npm run test` (23 Vitest cases covering `toJsonSchema`/`fromJsonSchema` round-tripping and tree operations) all pass.
- `frontend`: `npx tsc --noEmit` shows no new errors (two pre-existing errors in `ProfilePage.tsx`, unrelated to this change, already existed before this session — see STATUS.md). `npx vite build` succeeds and bundles the `schema-builder` import correctly. Verified via `curl` that the dev server serves `SettingsPage.tsx` and `SchemaBuilder.tsx` without transform errors, and that `@dnd-kit/*` pre-bundle cleanly.
- Could not do a visual/interactive browser pass (Chrome automation extension was not connected in this environment) — the drag-and-drop interaction itself has not been manually clicked through. Recommend a manual check of Settings → drag-reorder, add/remove fields, object/array nesting, and Import/Copy/Download before relying on this in a real workflow.

**Remaining concerns**:
- No automated tests were added inside `frontend/` for the ported UI components (the underlying logic is tested in `schema-builder`; the frontend copy is a styled re-implementation of the same components, not covered by frontend tests since this project has no test harness set up).

### 2026-07-18 — AI Auto-Fill Job Posting Pipeline Added
- **AI Service**: Added `JOB_PARSE_SCHEMA` and the `POST /resume/parse-job-url` endpoint. It processes the scraped job text to extract the `company` name, `title`, and calculates fit analysis parameters (fit score, gaps, reasons) in one step.
- **Rust Backend**: Added the `parse_url_and_fill` route controller, proxying payload data directly to the Python FastAPI microservice, returning the parsed object alongside the extracted job description text. Registered under the `analyse_router` on path `POST /api/jobs/parse-url`.
- **React Frontend**: Overhauled `AddJobModal.tsx` to add an "Auto-fill with AI" button. When clicked, it loads, pre-fills the `Company Name` and `Job Title` inputs, and stores all parsed fit insights in the React state. When the user saves, the application immediately starts with all AI metrics populated (no need to click Analyse later). Added a fallback manual paste textarea if direct URL scraping is blocked.

**Validation Performed**:
- Vite production build compiles cleanly.
- Rust Axum backend compiled successfully inside Docker context.
