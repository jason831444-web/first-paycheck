# FirstPaycheck

FirstPaycheck is a production-minded MVP personal finance simulator for new grads and OPT workers starting their first U.S. job.

**Tagline:** Plan your first paycheck before you sign the lease.

## Problem

New graduates often receive an offer, pick an apartment, and only later discover how taxes, health insurance, rent, transit, car costs, and lifestyle spending interact. International students on OPT also need to understand how F-1 FICA exemption can change monthly take-home pay.

## Target Users

- New graduates comparing first-job budgets
- International students on OPT/F-1 evaluating salary and rent
- Early-career workers comparing NYC, Brooklyn, Jersey City, Hoboken, and NJ suburb lifestyles

## Features

- Salary, tax year, work state, residence, OPT/FICA, 401k, and health insurance inputs
- Detailed expense setup for housing, food, transportation, and lifestyle spending
- Approximate federal, FICA, NY, NYC, and NJ tax estimates
- Monthly take-home pay, expenses, leftover cash, savings rate, ratios, and risk level
- Rent recommendation ranges: safe, stretch, and risky
- Scenario comparison for Manhattan, Brooklyn, Jersey City, Hoboken, and NJ suburbs
- Editable JSON tax and city preset data
- Anonymous saved scenarios API
- Recharts visualizations for expense breakdown and scenario comparison

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Recharts
- Backend: FastAPI, Python, Pydantic
- Database: PostgreSQL
- ORM and migrations: SQLAlchemy, Alembic
- Containerization: Docker Compose

## Screenshots

Screenshots placeholder:

- Home page
- Simulator form
- Results dashboard
- Scenario comparison

## Local Setup

```bash
cd first-paycheck
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

Run database migrations:

```bash
docker compose exec backend alembic upgrade head
```

Run backend tests locally:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

Run frontend locally:

```bash
cd frontend
npm install
npm run dev
```

## API Overview

- `GET /health` returns backend status
- `POST /api/simulate` calculates a complete simulation
- `GET /api/city-presets` returns editable default cost presets
- `POST /api/scenarios` saves an anonymous scenario and result
- `GET /api/scenarios` lists saved scenarios
- `GET /api/scenarios/{id}` gets a saved scenario
- `DELETE /api/scenarios/{id}` deletes a saved scenario

## Calculation Notes

The tax engine is intentionally approximate for MVP planning. Federal brackets and FICA settings live in `backend/app/data`. NY, NYC, NJ, and cross-state estimates are simplified in service modules so more accurate rules can be added later.

## Future Improvements

- More accurate multi-state tax handling
- Authentication
- User accounts
- Saved scenario dashboard
- Real-time rent data integration
- AI budget advisor
- Student loan modeling
- Relocation cost planner
- Emergency fund planner
- H-1B / resident tax mode

## Disclaimer

This tool provides estimates for planning purposes only and is not tax, legal, or financial advice.
