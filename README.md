# CareerFlow AI Job Tracker

A high-fidelity, AI-powered toolset designed to help job seekers track, organize, and analyze their job applications. CareerFlow leverages Google Gemini 2.5 Pro to parse your resume, scrape job descriptions from URLs (like LinkedIn), and provide instant fit scoring, skill gap analysis, and tailored improvement tips.

This repository contains the **React Frontend** and the **Rust API Gateway**, operating seamlessly alongside a dedicated [Python AI Microservice](https://github.com/YOUR-USERNAME/ai-service).

---

## Features

### 1. Full-Stack Web Dashboard
- **Glassmorphic UI**: Vibrant modern styling with responsive design built using React and TailwindCSS.
- **Analytics Cards**: Real-time stats on your application pipeline (Applied, Interviewing, Offered).
- **PostgreSQL Database Backend**: Robust, persistent data storage using a high-performance Rust (`Axum` + `SQLx`) backend.

### 2. AI-Powered Application Tracking
- **Resume Parsing**: Upload your PDF resume, and the AI extracts structured skills, experience, and education. You can manually tweak this extracted JSON profile directly from the UI.
- **Smart URL Scraping**: Simply paste a LinkedIn job URL. The Rust backend safely scrapes the text using realistic browser headers, and the AI service automatically analyzes the role.
- **Deep Insights**: Receive an instant 0-100 fit score, an analysis of required skills you're missing, application urgency levels, and a summary of the hiring company's background via Google Search Grounding.
- **Inline Status Editing**: Quickly bump applications through your pipeline using intuitive inline dropdowns on the dashboard job cards.
- **AI Response Schema Builder**: A Settings page for visually building the JSON Schemas passed to `ai-service` as `schema_definition`, via drag-and-drop. Backed by the reusable sibling project [`schema-builder`](../schema-builder), which can be dropped into any project that talks to `ai-service`.

---

## Architecture Overview

The system runs on a microservice architecture entirely orchestrated by Docker Compose:
- **Frontend (`:3000`)**: React + TypeScript + Vite.
- **Backend (`:8000`)**: Rust + Axum. Serves as the database connection, API gateway, and static file server for production builds.
- **AI Service (`:8001`)**: Python + FastAPI. Hosted via a Git Submodule. Handles all Gemini LLM interactions.
- **Database (`:5432`)**: PostgreSQL 15.

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
- A valid **Gemini API Key**.

### 1. Clone the Repository
Since the AI service is managed as a Git Submodule, be sure to clone recursively:
```bash
git clone --recursive https://github.com/YOUR-USERNAME/job-tracker.git
cd job-tracker
```
*(If you already cloned without recursive, simply run `git submodule update --init --recursive`)*

### 2. Environment Setup
Copy the example environment file and fill in your Gemini API Key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 3. Run the Application
Start the entire stack using Docker Compose:
```bash
docker compose up -d --build
```
The application will be available at `http://localhost:8000`.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **Backend API Gateway**: Rust, Axum, SQLx.
- **AI Microservice**: Python, FastAPI, Google GenAI SDK (Gemini 2.5 Pro).
- **Data Storage**: PostgreSQL 15.
- **Deployment**: Docker Compose.
