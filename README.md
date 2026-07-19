# LinkedIn Job Application Tracker

A high-fidelity toolset designed to help job seekers track, organize, and analyze their LinkedIn job applications. 

This project provides two main components:
1. **Google Sheets Compatible Excel Spreadsheet**: A professionally formatted Excel template (`job_applications_tracker.xlsx`) featuring dropdown lists for status tracking and conditional formatting that translates perfectly when imported to Google Sheets.
2. **Interactive Web Dashboard**: A premium, local-first web interface (`index.html`) backed by a native **PostgreSQL** database and served by a local **Node.js/Express** server. Features real-time visual charts, searchable/filterable job cards, and CSV export/import options.

---

## Features

### 1. Excel / Google Sheets Template
- **Preconfigured Columns**: Company, Job Title, Status, Applied Date, Job URL, Job Description, Contact Name, Notes.
- **Data Validation**: Dropdown menus for the "Status" column to keep tracking uniform.
- **Conditional Formatting**: Automatically highlights row backgrounds based on application state (e.g., green for Offered, yellow for Interviewing, gray for Rejected).

### 2. Full-Stack Web Dashboard
- **Glassmorphic UI**: Vibrant modern styling with responsiveness.
- **Analytics Cards**: Real-time stats on application status distribution and conversion rates.
- **PostgreSQL Database backend**: All application data persists inside a local PostgreSQL instance (no dummy mock data; starts clean).
- **Dynamic Database Initialization**: The table structure is automatically created on server boot (no SQL files to import manually).
- **Interactive Table & Cards**: Quick actions to filter by status, search by company/job title, and view complete job descriptions.
- **CSV Data sync**: Export data to a standard CSV, or import a CSV directly (enabling easy sync with Google Sheets).

---

## Getting Started

### Prerequisites
Make sure you have [Homebrew](https://brew.sh) installed on your macOS.

### Database Setup
1. Install PostgreSQL 15:
   ```bash
   brew install postgresql@15
   ```
2. Start the database service:
   ```bash
   brew services start postgresql@15
   ```
3. Create the database for the application:
   ```bash
   /opt/homebrew/opt/postgresql@15/bin/createdb job_tracker
   ```

### Running the Web Application
1. Install the backend dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to `http://localhost:8000`.
   *(Note: The database tables will be initialized automatically on startup).*

---

## Technical Stack
- **Spreadsheet Generator**: Python 3, `openpyxl`
- **Backend Server**: Node.js, Express, `pg` (PostgreSQL Client)
- **Frontend Client**: HTML5, CSS3 (Vanilla), JavaScript (ES6)
- **Data Storage**: Local PostgreSQL Database (database: `job_tracker`)
