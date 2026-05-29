# FirstPaycheck Architecture

FirstPaycheck is a full-stack MVP made of a Next.js frontend, a FastAPI backend, PostgreSQL persistence, and JSON-driven tax and city assumptions.

```text
User
  -> Next.js App Router frontend
    -> FastAPI API
      -> Simulation, tax, comparison, what-if, and insight services
      -> PostgreSQL saved budget plans
      -> JSON tax and city preset data
```

## Frontend

The frontend lives in `frontend/` and uses Next.js App Router, TypeScript, Tailwind CSS, Recharts, and ExcelJS.

Important app routes:

- `/` - Home page and product overview
- `/simulator` - Checklist-driven salary, tax, and budget simulator
- `/scenarios` - Major U.S. city comparison
- `/affordability` - Focused apartment affordability check
- `/saved` - Saved budget plans
- `/tools` - Planning tools hub
- `/apartments` - Apartment comparison and move-in cash planner
- `/offers` - Job offer comparison
- `/cashflow` - First 90 days cashflow
- `/goals` - Budget goal reverse calculator
- `/paycheck-calendar` - Paycheck timing and bill calendar

The frontend calls the backend through `frontend/lib/api.ts`. Report exports are generated client-side through `frontend/lib/exportReports.ts`.

## Backend

The backend lives in `backend/` and uses FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL, and pytest.

Important backend areas:

- `backend/app/api/routes/` - API route definitions
- `backend/app/services/` - Simulation, tax, comparison, what-if, and advisor insight logic
- `backend/app/schemas/` - Pydantic request and response models
- `backend/app/models/` - SQLAlchemy database models
- `backend/app/db/` - Database engine and session setup
- `backend/app/data/` - JSON data files for tax and city assumptions
- `backend/tests/` - Backend API and calculation tests

## API Flow

The main calculation flow starts when the frontend sends a `SimulationInput` to `POST /api/simulate`.

The backend then:

1. Calculates federal income tax.
2. Calculates FICA or applies FICA exemption.
3. Calculates state and local tax assumptions.
4. Calculates monthly expenses.
5. Calculates monthly leftover, savings rate, housing ratio, transportation ratio, affordability score, risk level, and rent recommendation.
6. Returns a `SimulationResult`.

Other endpoints reuse the same core simulation logic:

- `/api/compare-locations` builds a simulation input for each selected city preset.
- `/api/what-if` applies scenario patches and reruns simulations.
- `/api/insights` turns simulation metrics into recommendation cards.
- `/api/scenarios` saves and restores simulator state and result data.

## Database

PostgreSQL stores saved budget plans.

The saved scenario model stores:

- Scenario name
- Broad mapped simulation input fields
- Full active section IDs
- Full section values
- Custom expenses
- Mapped backend input
- Result JSON
- Created and updated timestamps

This lets the simulator restore a complete checklist-based budget plan even though the backend calculation schema is broader than the frontend section model.

## Tax and City Data

Tax and city assumptions are stored as editable JSON files:

- `backend/app/data/federal_tax_2026.json`
- `backend/app/data/fica_2026.json`
- `backend/app/data/state_tax_2026.json`
- `backend/app/data/city_presets.json`

The all-state tax file supports:

- `none`
- `flat`
- `progressive`
- `estimate`

This keeps the tax engine maintainable and makes yearly review easier.

## Deployment Considerations

The current Docker Compose setup is designed for local development and portfolio demo use.

Before production deployment, the project should add:

- Production Dockerfiles or deployment config
- Authentication and user-scoped saved plans
- Environment-specific CORS and API URLs
- Secure database credentials
- Database backups
- Frontend monitoring and backend logging
- Rate limiting for public APIs
- A yearly process for reviewing tax and city preset data

## Current Architecture Status

The architecture is solid for a portfolio-ready MVP. The strongest production-readiness gaps are authentication, user-specific saved data, planning-tool persistence, and production deployment hardening.
