# FirstPaycheck Demo Script

This is a 5-minute recruiter or interview demo flow.

## Demo Goal

Show that FirstPaycheck is more than a calculator: it is a full-stack decision-support product for new grads and OPT/F-1 workers making first-job financial decisions.

## Suggested Sample Inputs

- Annual salary: `$105,000`
- Pay frequency: `Biweekly`
- Filing status: `Single`
- Work state: `NY`
- Residence location: `Brooklyn, NY`
- FICA exempt: `Yes`
- 401k contribution: `0%` or `5%`
- Health insurance: `$150/month`
- Rent: `$2,700`
- Utilities/internet: `$220`
- Add optional sections: Food, Transportation, Subscriptions, Custom expenses

## 5-Minute Walkthrough

### 1. Home Page

Open `/`.

Talking point:

> FirstPaycheck helps new grads and OPT/F-1 workers understand whether a salary, apartment, city, or job offer actually works after taxes and monthly expenses.

Show:

- Product positioning
- Start simulation CTA
- Planning tools section

### 2. Simulator

Open `/simulator`.

Talking point:

> The simulator is checklist-driven so users do not have to face one overwhelming form. Required basics are always visible, and optional budget sections can be added only when relevant.

Show:

- Required sections: Income, Tax and OPT, Housing
- Optional section checklist
- Add Food, Transportation, and Custom expenses

### 3. Run Simulation

Run a simulation.

Talking point:

> The backend centralizes the simulation logic, including federal tax, FICA, all-state state tax assumptions, expenses, affordability scoring, and risk classification.

Show:

- Net monthly income
- Total monthly expenses
- Monthly leftover
- Housing ratio
- Savings rate
- Rent recommendation
- Tax assumption notes

### 4. Advisor Insights and What-if Analysis

Scroll to Advisor Insights and What-if Analysis.

Talking point:

> The app interprets the numbers instead of just displaying them. It explains pressure points like rent, savings rate, transportation burden, FICA status, and emergency fund needs.

Show:

- Advisor insight cards
- Rent +$300
- Salary -$10k
- FICA removed
- Add a car

### 5. Export and Save

Use the result actions.

Talking point:

> Users can export a report for offline planning and save the entire budget plan, including checked sections and itemized values.

Show:

- Export to Excel
- Download CSV
- Save budget plan

### 6. Saved Plans

Open `/saved`.

Talking point:

> Saved plans preserve the full simulator state, not just a broad result payload.

Show:

- Saved plan card
- Open action
- Duplicate action
- Delete action

### 7. City Comparison

Open `/scenarios`.

Talking point:

> Users can compare the same salary across major U.S. cities and see how state taxes, rent, and transportation change the result.

Show:

- Select New York, Austin, Seattle, San Francisco
- Run comparison
- Show table, charts, tax notes, and export buttons

### 8. Tools Hub

Open `/tools`.

Talking point:

> The Tools Hub turns FirstPaycheck into a broader first-job planning suite.

Show:

- Apartment comparison
- Job offer comparison
- First 90 days cashflow
- Budget goal calculator
- Paycheck calendar
- Apartment affordability check

### 9. Apartment or Job Offer Comparison

Open `/apartments` or `/offers`.

Talking point:

> These tools answer the real follow-up questions users have after seeing their budget: which apartment is safer, which job offer is better after location costs, and how much cash is needed before move-in?

Show:

- Apartment rankings or offer rankings
- Monthly leftover
- Move-in cash
- Risk level

## Closing Pitch

> FirstPaycheck is a portfolio-ready full-stack MVP. It combines a FastAPI/PostgreSQL backend, a Next.js frontend, a data-driven tax engine, saved scenario state, exports, and practical planning tools into one cohesive product for first-job financial decisions.

## Backup Pages to Mention

- `/affordability` - Quick apartment rent check
- `/cashflow` - First 90 days cash pressure
- `/goals` - Reverse budget calculator
- `/paycheck-calendar` - Paycheck and bill timing

## Technical Questions to Be Ready For

- How does the simulator avoid duplicating tax logic on the frontend?
- How does saved scenario restore preserve frontend-only section state?
- How does the state tax data model support no-tax, flat, progressive, and estimate states?
- What would be needed before public production deployment?
- Which features are backend-backed versus frontend-only?
