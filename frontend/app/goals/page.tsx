"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Target } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { buildSimulationInput, defaultSalaryAssumptions, SalaryAssumptions } from "@/lib/planningTools";
import { SimulationResult } from "@/types/simulation";

type GoalMode = "save_amount" | "rent_ratio" | "leftover_min" | "max_rent";

interface GoalForm extends SalaryAssumptions {
  residence_location: string;
  residence_state: string;
  target_monthly_savings: number;
  target_rent_ratio: number;
  target_leftover: number;
  fixed_non_housing_expenses: number;
  transportation_estimate: number;
  food_lifestyle_estimate: number;
}

const defaultForm: GoalForm = {
  ...defaultSalaryAssumptions,
  residence_location: "New York, NY",
  residence_state: "NY",
  target_monthly_savings: 1500,
  target_rent_ratio: 0.3,
  target_leftover: 1200,
  fixed_non_housing_expenses: 550,
  transportation_estimate: 140,
  food_lifestyle_estimate: 1250,
};

function Field({ label, value, onChange, type = "number" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function GoalsPage() {
  const [mode, setMode] = useState<GoalMode>("save_amount");
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (patch: Partial<GoalForm>) => setForm((current) => ({ ...current, ...patch }));

  async function calculate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nextResult = await api.simulate(
        buildSimulationInput(form, {
          residence_location: form.residence_location,
          residence_state: form.residence_state,
          rent: 0,
          utilities: 0,
          internet: 0,
          transit_cost: form.transportation_estimate,
          groceries: form.food_lifestyle_estimate * 0.45,
          eating_out: form.food_lifestyle_estimate * 0.2,
          personal_spending: form.food_lifestyle_estimate * 0.25,
          subscriptions: form.food_lifestyle_estimate * 0.06,
          gym: form.food_lifestyle_estimate * 0.04,
          other_expenses: form.fixed_non_housing_expenses,
        }),
      );
      setResult(nextResult);
    } catch {
      setError("Could not calculate goal. Check the backend and inputs.");
    } finally {
      setLoading(false);
    }
  }

  const netMonthly = result?.net_monthly ?? 0;
  const nonHousing = form.fixed_non_housing_expenses + form.transportation_estimate + form.food_lifestyle_estimate;
  const savingsGoal = mode === "leftover_min" ? form.target_leftover : form.target_monthly_savings;
  const maxRentForSavings = Math.max(netMonthly - nonHousing - savingsGoal, 0);
  const ratioRentMax = Math.max(netMonthly * form.target_rent_ratio, 0);
  const maxAffordableRent = Math.min(maxRentForSavings, ratioRentMax || maxRentForSavings);
  const safeRentMax = netMonthly * 0.3;
  const stretchRentMax = netMonthly * 0.35;
  const maxTransportationBudget = Math.max(netMonthly - form.fixed_non_housing_expenses - form.food_lifestyle_estimate - savingsGoal - safeRentMax, 0);
  const flexibleCap = Math.max(netMonthly - safeRentMax - form.transportation_estimate - form.fixed_non_housing_expenses - savingsGoal, 0);
  const unrealistic = result ? maxRentForSavings <= 0 || maxAffordableRent < 800 : false;

  return (
    <main className="page-shell max-w-7xl">
      <div className="mb-6">
        <p className="eyebrow">Goals</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Budget goal calculator</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Start with your savings goal and find the rent, car, and spending limits that fit.</p>
      </div>

      <form onSubmit={calculate} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="section-card">
          <h2 className="section-title">Goal mode</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["save_amount", "I want to save a dollar amount per month."],
              ["rent_ratio", "I want rent below a percentage of take-home pay."],
              ["leftover_min", "I want monthly leftover at least a target."],
              ["max_rent", "I want to know my max affordable rent."],
            ].map(([id, label]) => (
              <label key={id} className={`rounded-2xl border px-4 py-3 text-sm font-medium ${mode === id ? "border-teal-300 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700"}`}>
                <input className="mr-2" type="radio" checked={mode === id} onChange={() => setMode(id as GoalMode)} />
                {label}
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Annual salary" value={form.annual_salary} onChange={(value) => update({ annual_salary: Number(value) })} />
            <Field label="Work state" value={form.work_state} type="text" onChange={(value) => update({ work_state: value.toUpperCase() })} />
            <Field label="Residence location" value={form.residence_location} type="text" onChange={(value) => update({ residence_location: value })} />
            <Field label="Residence state" value={form.residence_state} type="text" onChange={(value) => update({ residence_state: value.toUpperCase() })} />
            <Field label="401k %" value={form.contribution_401k_percent} onChange={(value) => update({ contribution_401k_percent: Number(value) })} />
            <Field label="Health insurance" value={form.health_insurance_monthly} onChange={(value) => update({ health_insurance_monthly: Number(value) })} />
            <Field label="Target monthly savings" value={form.target_monthly_savings} onChange={(value) => update({ target_monthly_savings: Number(value) })} />
            <Field label="Target leftover" value={form.target_leftover} onChange={(value) => update({ target_leftover: Number(value) })} />
            <label><span className="field-label">Target rent ratio</span><input className="field-input" type="number" step="0.01" value={form.target_rent_ratio} onChange={(event) => update({ target_rent_ratio: Number(event.target.value) })} /></label>
            <Field label="Fixed non-housing expenses" value={form.fixed_non_housing_expenses} onChange={(value) => update({ fixed_non_housing_expenses: Number(value) })} />
            <Field label="Transportation estimate" value={form.transportation_estimate} onChange={(value) => update({ transportation_estimate: Number(value) })} />
            <Field label="Food/lifestyle estimate" value={form.food_lifestyle_estimate} onChange={(value) => update({ food_lifestyle_estimate: Number(value) })} />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.fica_exempt} onChange={(event) => update({ fica_exempt: event.target.checked })} /> OPT/F-1 FICA exempt</label>
          </div>
          <button className="primary-button mt-5" disabled={loading}>{loading ? "Calculating..." : "Calculate goal"}</button>
          {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
        </section>

        <section className="section-card">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-700" />
            <h2 className="section-title">Goal result</h2>
          </div>
          {!result ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Enter a goal and run the calculator to see your estimated rent and spending limits.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="soft-panel"><p className="text-xs text-slate-500">Estimated net monthly</p><p className="mt-2 text-2xl font-semibold">{usd(netMonthly)}</p></div>
                <div className="soft-panel"><p className="text-xs text-slate-500">Max rent for goal</p><p className="mt-2 text-2xl font-semibold">{usd(maxAffordableRent)}</p></div>
                <div className="soft-panel"><p className="text-xs text-slate-500">Rent target</p><p className="mt-2 text-2xl font-semibold">{percent(form.target_rent_ratio)}</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-panel"><p className="text-xs text-slate-500">Safe rent max</p><p className="mt-2 text-xl font-semibold">{usd(safeRentMax)}</p></div>
                <div className="soft-panel"><p className="text-xs text-slate-500">Stretch rent max</p><p className="mt-2 text-xl font-semibold">{usd(stretchRentMax)}</p></div>
                <div className="soft-panel"><p className="text-xs text-slate-500">Max transportation budget</p><p className="mt-2 text-xl font-semibold">{usd(maxTransportationBudget)}</p></div>
                <div className="soft-panel"><p className="text-xs text-slate-500">Suggested flexible cap</p><p className="mt-2 text-xl font-semibold">{usd(flexibleCap)}</p></div>
              </div>
              <div className={`flex gap-3 rounded-2xl p-4 text-sm ${unrealistic ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
                {unrealistic ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                <p>
                  {unrealistic
                    ? `This goal may be difficult unless rent stays very low, transportation drops, or the savings target changes.`
                    : `To save ${usd(savingsGoal)}/month, your estimated max rent is ${usd(maxAffordableRent)}.`}
                </p>
              </div>
              <StatusBadge status={result.risk_level} />
            </div>
          )}
        </section>
      </form>
    </main>
  );
}
