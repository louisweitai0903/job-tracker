# PROGRESS.md — Development Log

### 2026-07-18 — AI Auto-Fill Job Posting Pipeline Added
- **AI Service**: Added `JOB_PARSE_SCHEMA` and the `POST /resume/parse-job-url` endpoint. It processes the scraped job text to extract the `company` name, `title`, and calculates fit analysis parameters (fit score, gaps, reasons) in one step.
- **Rust Backend**: Added the `parse_url_and_fill` route controller, proxying payload data directly to the Python FastAPI microservice, returning the parsed object alongside the extracted job description text. Registered under the `analyse_router` on path `POST /api/jobs/parse-url`.
- **React Frontend**: Overhauled `AddJobModal.tsx` to add an "Auto-fill with AI" button. When clicked, it loads, pre-fills the `Company Name` and `Job Title` inputs, and stores all parsed fit insights in the React state. When the user saves, the application immediately starts with all AI metrics populated (no need to click Analyse later). Added a fallback manual paste textarea if direct URL scraping is blocked.

**Validation Performed**:
- Vite production build compiles cleanly.
- Rust Axum backend compiled successfully inside Docker context.
