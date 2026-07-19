# STATUS.md — Project State

## Current Version
- **v2.1.0** (Vite + React + Tailwind Frontend, Rust/Axum Web Backend, Python FastAPI AI microservice)

## Project Health
- 🟢 **Green** — All systems fully coded, validated, and containerised. Production Vite build builds with zero TypeScript errors.

## Completed Features
- **URL Auto-fill Pipeline**: Paste a link in the "New Application" modal, click "Auto-fill", and AI automatically extracts the company name, job title, and calculates all resume fit analysis parameters immediately.
- **Containerisation**: Full multi-service `docker-compose.yml` config connecting PostgreSQL 15, FastAPI AI service, and Axum backend.
- **AI Microservice**: Core Python app wrapping Gemini 2.5 Pro Preview with Pydantic validations, PDF resume extraction, profile strength scoring, and volume-backed resume caching.
- **Rust Web Backend**: Clean Axum server implementing PostgreSQL pool connection, automatic schema setup and migrations, job application CRUD endpoints, and AI client proxy interfaces.
- **React Frontend**: Modern Vite + React SPA styled exactly to the design specifications, implementing dynamic State flow, active pipeline dashboard, job insights panel (with fit scoring rings), and profile upload hub.

## Known Limitations / Tech Debt
- **Scraping blockages**: Certain job sites (like LinkedIn) block direct bot scraping via User-Agents.
  - *Mitigation*: Rust backend detects scraping failure and instructs frontend to display a fallback text-area box allowing the user to paste the job description text manually.

## Next Milestones
- Deploy application stack to production server (e.g. AWS, Render, Fly.io).
