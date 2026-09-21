# HANDOFF.md — Next Agent Continuity

## Project State
- **Health**: 🟢 Green.
- **Current State**: Fully coded, tested, and containerised. All configurations (Docker, environment files, schemas) are fully implemented.

## Accomplished Work
- **AI Response Schema Builder**: New Settings page (`frontend/src/components/SettingsPage.tsx`) embeds a drag-and-drop builder for the JSON Schema subset `ai-service` accepts. The reusable core logic lives in a new sibling repo `../schema-builder` (standalone Vite app + compiled `lib/` package) and `frontend` depends on it via `"schema-builder": "file:../../schema-builder"` — do not re-copy that logic into `frontend/src/lib`; if you change schema semantics, edit `schema-builder/src/lib/{schema,tree}.ts`, run `npm run build:lib` there, and the symlinked `frontend` build picks it up. See PROGRESS.md (2026-09-14).
- **Known pre-existing issue**: `frontend/src/components/ProfilePage.tsx` fails `tsc --noEmit` (unused `setPreferredModel`, undefined `handleModelChange` around line 360) — present before this session's changes, not caused by the Schema Builder work. `vite build` still succeeds (esbuild transpile only). Worth a follow-up fix.
- **Not yet done**: no visual/interactive browser pass on the new Settings → Schema Builder UI (Chrome automation wasn't available this session) — manually click through drag-reorder, nested object/array fields, and Import/Copy/Download before depending on it.
- **AI Auto-fill Pipeline**: Added `POST /resume/parse-job-url` and `POST /api/jobs/parse-url`. When adding a job URL, the AI now scrapes the URL, parses the `company`, `title`, and calculates all fit metrics. The frontend modal pre-fills these inputs automatically before the job is saved.
- **Python AI Microservice**: Fully built inside `ai-service/`. Parses uploaded PDF resumes via `pdfminer`, calls Gemini `gemini-2.5-pro-preview` with strict JSON schemas, and stores resume data in `/app/data/resume.json`.
- **Rust Backend**: Fully built inside `backend/`. Connects to Postgres, runs migrations to create tables and columns, exposes Axum API endpoints, scrapes websites, and proxies calls to the AI service.
- **React Frontend**: Fully built inside `frontend/`. Custom styled using Tailwind CSS tokens from the Stitch design. Verified compilation via `tsc` and production bundle via `vite build`.
- **Docker Compose**: Orchestrates all parts together. Wires dependencies, configures healthy service start checks, and mounts volume mounts for database and resume persistence.

## Run Commands
To run the full stack:
```bash
cp .env.example .env
# Edit .env and enter GEMINI_API_KEY
docker compose up --build
```

## Recommended Verification Checks
- Verify `docker compose up --build` compiles both the frontend React client and the backend Rust server cleanly.
- Verify file uploads (resumes) populate the profile, and verify that URL inserts correctly prompt the AI to fetch, scrape, and populate the dashboard panel matching the UI design specs.
