# FirstPaycheck

**Plan your first paycheck before you sign the lease.**

FirstPaycheck is a full-stack financial planning simulator for new grads and OPT/F-1 workers starting their first U.S. job. It helps users estimate take-home pay, rent affordability, city tradeoffs, saved budget plans, exports, what-if analysis, advisor recommendations, apartment and job offer comparisons, move-in cash needs, and paycheck timing.

## Problem

New grads often compare job offers, rent, cities, and transportation costs using rough guesses. A salary can look strong on an offer letter but feel very different after federal tax, state tax, FICA, health insurance, rent, transportation, food, and first-month move-in costs.

International students on OPT/F-1 have an extra layer of uncertainty: FICA exemption, tax assumptions, immigration-related costs, first paycheck timing, and the cash needed before starting work. FirstPaycheck brings these decisions into one planning tool so users can pressure-test a first-job budget before committing to a lease, commute, or offer.

## Target Users

- New grads starting their first U.S. job
- OPT/F-1 workers estimating take-home pay
- People comparing NYC, NJ, Brooklyn, and major U.S. cities
- People deciding whether a specific apartment is affordable
- People comparing job offers across different locations

## Key Features

### Salary and Tax Simulator

- Annual salary, pay frequency, tax year, and filing status inputs
- Federal income tax estimate
- FICA calculation with OPT/F-1 exemption mode
- 401k contribution modeling
- Health insurance premium deduction
- State and local tax assumption notes
- Net monthly income, monthly expenses, monthly leftover, savings rate, risk level, and rent recommendation

### Modular Budget Builder

- Required sections: Income, Tax and OPT, Housing
- Checklist-driven optional sections
- Food, car ownership, transportation, debt, healthcare, immigration, relocation, subscriptions, lifestyle, savings, emergency fund, and custom expenses
- Multiple custom expense rows
- One-time cost amortization for move-in, relocation, immigration, and filing costs
- Inactive sections are excluded from calculations

### All-State Tax Estimate Engine

- All 50 U.S. states plus Washington, DC
- No-income-tax states
- Flat-tax states
- Progressive-tax states
- Effective-rate estimate states
- Simplified NYC local tax estimate
- Transparent tax assumption notes returned with simulation results

### City and Location Comparison

- Major U.S. city presets
- Searchable and filterable location picker
- Selected city comparison
- Net monthly income, rent, transportation cost, expenses, leftover, savings rate, affordability score, and risk level
- Tax assumption notes per location

### Saved Budget Plans

- Save full simulator state
- Preserve checked section IDs, section values, custom expenses, mapped backend input, and result data
- Restore saved plans through `/simulator?savedScenarioId=...`
- Duplicate and delete saved plans

### Export Reports

- Excel export for simulator results
- CSV export for simulator summary
- Excel export for location comparisons
- CSV export for comparison tables
- Clean filenames with dates
- Disclaimer and tax assumption sheets in Excel reports

### Affordability Check

- Focused "Can I afford this apartment?" flow
- Rent ratio and monthly leftover
- Safe and stretch rent estimates
- Car/no-car transportation what-if
- Recommendation result based on existing simulation logic

### What-if Analysis

- Rent +$300
- Rent -$300
- Salary -$10k
- Salary +$10k
- FICA exemption removed
- Add a car or increase car costs
- Food +$200
- Personal spending +$200
- 401k contribution +5%

### Advisor Insights

- Housing pressure insights
- Savings rate warnings
- Transportation burden notes
- FICA and tax assumption reminders
- Emergency fund guidance
- Debt and obligations notes
- Overall budget health recommendation

### Practical Planning Tools

- Apartment comparison board
- Move-in cash planner
- Job offer comparison
- First 90 days cashflow
- Budget goal calculator
- Paycheck calendar
- Tools Hub at `/tools`

## Product Walkthrough

1. Open the simulator.
2. Enter salary, tax, and housing assumptions.
3. Add optional budget sections from the checklist.
4. Run the simulation.
5. Review take-home pay, expenses, leftover, risk level, and rent recommendation.
6. Read Advisor Insights and What-if Analysis.
7. Export the result to Excel or CSV.
8. Save the budget plan.
9. Compare the same salary across cities.
10. Use apartment, job offer, cashflow, goal, and paycheck-calendar tools for real decisions.

## Screenshots

Screenshot placeholders are listed below. Actual screenshots can be added under `docs/screenshots/`.

- `docs/screenshots/home.png`
  > Screenshot coming soon: Home page

- `docs/screenshots/simulator.png`
  > Screenshot coming soon: Simulator budget builder

- `docs/screenshots/results.png`
  > Screenshot coming soon: Result dashboard with insights

- `docs/screenshots/scenarios.png`
  > Screenshot coming soon: City comparison

- `docs/screenshots/affordability.png`
  > Screenshot coming soon: Apartment affordability check

- `docs/screenshots/apartments.png`
  > Screenshot coming soon: Apartment comparison board

- `docs/screenshots/saved.png`
  > Screenshot coming soon: Saved budget plans

- `docs/screenshots/tools.png`
  > Screenshot coming soon: Planning tools hub

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- ExcelJS

### Backend

- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL
- pytest

### Infrastructure

- Docker Compose

## Architecture Overview

FirstPaycheck uses a Next.js frontend, a FastAPI backend, and PostgreSQL for saved budget plans.

The frontend renders the simulator, comparison pages, saved plans, exports, and planning tools. It calls FastAPI endpoints for core calculations so tax and simulation logic stay centralized on the backend. PostgreSQL stores saved budget plans, while JSON data files store city cost presets and tax assumptions.

```text
Next.js frontend
  -> FastAPI backend
    -> PostgreSQL saved plans
    -> JSON tax and city data files
```

Key data files:

- `backend/app/data/federal_tax_2026.json`
- `backend/app/data/fica_2026.json`
- `backend/app/data/state_tax_2026.json`
- `backend/app/data/city_presets.json`

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## API Overview

- `GET /health` - Backend health check.
- `POST /api/simulate` - Runs the salary, tax, expense, affordability, and recommendation simulation.
- `GET /api/city-presets` - Returns editable U.S. city cost presets.
- `POST /api/compare-locations` - Compares selected locations using shared salary and tax assumptions.
- `POST /api/what-if` - Runs sensitivity scenarios against a base simulation input.
- `POST /api/insights` - Returns advisor recommendation cards for a simulation result.
- `POST /api/scenarios` - Saves a budget plan.
- `GET /api/scenarios` - Lists saved budget plans.
- `GET /api/scenarios/{id}` - Retrieves a saved plan.
- `PUT /api/scenarios/{id}` - Updates saved plan metadata/state.
- `POST /api/scenarios/{id}/duplicate` - Duplicates a saved plan.
- `DELETE /api/scenarios/{id}` - Deletes a saved plan.

The apartment, offer, cashflow, goal, and paycheck-calendar tools are currently frontend product tools. They reuse `/api/simulate` when full take-home pay calculations are needed.

## Data and Calculation Assumptions

FirstPaycheck is a planning estimate tool. It is not tax, legal, or financial advice.

- MVP assumptions focus on single filers.
- Federal income tax is estimated from project tax data.
- FICA is estimated from project FICA data and can be disabled for OPT/F-1 exemption scenarios.
- State income tax supports all 50 states plus DC through data-driven rules, but it is not filing-grade tax software.
- Some states use simplified brackets or effective-rate estimates to avoid false precision.
- Local taxes are not comprehensive; NYC resident local tax is the main explicit local-tax estimate.
- Multi-state credits, nonresident filing rules, treaty positions, itemized deductions, and payroll-specific edge cases are simplified.
- City cost presets are editable estimates, not live rent or cost-of-living data.
- Planning tools use practical MVP formulas and should be treated as decision-support estimates.

## Local Development

Run the full stack with Docker Compose:

```bash
cd /Users/yoonjaeseong/Desktop/projects/first-paycheck
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- API docs: http://localhost:8000/docs

Stop the stack:

```bash
Ctrl + C
docker compose down
```

## Running Tests

Validate Docker Compose configuration:

```bash
cd /Users/yoonjaeseong/Desktop/projects/first-paycheck
docker compose config
```

Run backend tests:

```bash
cd backend
python3 -m pytest -q
```

Run frontend build and lint:

```bash
cd frontend
npm run build
npm run lint
```

## Project Structure

```text
first-paycheck/
  backend/
  frontend/
  docker-compose.yml
  README.md

backend/app/
  api/
  services/
  schemas/
  models/
  data/
  db/

frontend/app/
  simulator/
  scenarios/
  affordability/
  saved/
  tools/
  apartments/
  offers/
  cashflow/
  goals/
  paycheck-calendar/
```

## Current Status

FirstPaycheck is a portfolio-ready MVP, not yet a production public finance service.

Current verification status:

- Tested locally
- Backend tests passing
- Frontend build and lint passing
- Docker Compose local startup works
- Core simulator, saved plans, exports, city comparison, what-if analysis, advisor insights, and planning tools are implemented

## Known Limitations

- No authentication yet
- Saved plans are anonymous/global until user accounts are added
- Some planning tools are frontend-only and not persisted
- Exports do not include every itemized section detail yet
- No real-time rent API or live cost-of-living feed
- No certified tax accuracy
- Local taxes are not comprehensive
- Production deployment configuration still needs final setup
- Frontend automated tests are not yet implemented

## Future Improvements

- Authentication and user-scoped saved plans
- Shareable read-only budget links
- PDF export
- Expanded Excel reports with Advisor Insights, What-if Analysis, and itemized section data
- Persistence for apartment, job offer, cashflow, goal, and paycheck-calendar tools
- Production deployment
- Mobile navigation/hamburger menu
- Admin editor for city and tax presets
- Real rent data integration
- More local tax support
- Frontend tests

## Resume-Ready Bullets

- Built a full-stack financial planning MVP for new grads using Next.js, FastAPI, PostgreSQL, SQLAlchemy, and Alembic.
- Designed a data-driven tax simulation engine supporting federal tax, FICA, all U.S. states plus DC, and simplified local tax assumptions.
- Implemented saved budget plans with full JSON simulator state, scenario restore, duplication, deletion, and Excel/CSV exports.
- Added decision-support features including what-if analysis, advisor recommendations, city comparison, apartment comparison, job offer comparison, and paycheck timing tools.
- Created a tested backend API suite with pytest coverage and Docker Compose local orchestration.
- Built a modular checklist budget builder that maps detailed frontend budget sections into backend simulation inputs.

## Demo Script

1. Start on the home page.
2. Open Simulator.
3. Add optional budget sections.
4. Run a simulation.
5. Show tax notes, Advisor Insights, and What-if Analysis.
6. Export to Excel.
7. Save the plan.
8. Open it from Saved Plans.
9. Compare salary across cities.
10. Show Apartment Comparison and Job Offer Comparison.

Full demo guide: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

## Portfolio Summary

Short:

FirstPaycheck is a tax-aware personal finance simulator that helps new grads estimate take-home pay, compare rent and city options, save budget plans, and stress-test financial decisions before starting their first U.S. job.

Long:

FirstPaycheck is a full-stack decision-support tool for new grads and OPT/F-1 workers. It combines a FastAPI/PostgreSQL backend with a Next.js frontend, a data-driven tax engine, modular budget builder, saved scenario state, Excel/CSV export, city, apartment, and job offer comparison, what-if analysis, and advisor insights to help users make realistic first-job financial decisions.

## Disclaimer

This tool provides estimates for planning purposes only and is not tax, legal, or financial advice.
