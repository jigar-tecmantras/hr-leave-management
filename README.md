# HR Leave Management System (HR only)

A focused HR leave management platform where HR staff define leave policies, review employee leave requests, and monitor balances and approvals. The system ships with a Node.js/Express backend backed by SQLite and a Create React App frontend that talks to the secured API.

## Architecture

- **Backend:** Node.js + Express, SQLite (via `better-sqlite3`), lightweight authentication middleware using an `x-user-email` header, and audit logging for status transitions.
- **Frontend:** Create React App delivering an HR dashboard, leave request form, and reporting views. It switches between HR and employee personas for demos.

## Project Layout

```
frontend/         # React app (CRA) for HR dashboards and employee self-service
backend/          # Express REST API with business rules, data seeding, and reporting
backend/data/     # Persisted SQLite database file (ignored, generated at runtime)
```

## Getting started

### Backend

```bash
cd backend
npm install
npm run dev        # or `npm start` for production mode
```

The API listens on port `4000` by default and exposes the following important headers:

- `x-user-email` – required on every request to identify the user (HR or employee).

Sample identities seeded in the database:

| Name            | Email              | Role     |
|-----------------|--------------------|----------|
| HR Admin        | hr@example.com     | hr       |
| Alice (Engineering) | alice@example.com | employee |
| Bob (Marketing)     | bob@example.com   | employee |

### Frontend

```bash
cd frontend
npm install
npm start          # launches CRA on http://localhost:3000
```

The frontend proxies API calls to `http://localhost:4000`. Use the user switcher dropdown to simulate HR vs employee sessions.

### Usage

- HR users can manage leave types, instantly approve or deny pending requests, and view dashboards with pending approvals, upcoming vacations, and leave type usage.
- Employees can submit new leave requests, see their history, and cancel pending requests.
- The dashboard exposes aggregated summaries and leave balance reports.

## Testing & Improvements

- Backend validations guard against overlapping windows, insufficient balances, and invalid transitions.
- Future work: replace the header-based auth stub with a secure token system, add pagination/filtering, and wire up email notifications.
