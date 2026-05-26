"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Save } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ResultDashboard } from "@/components/ResultDashboard";
import { SalaryForm } from "@/components/SalaryForm";
import { api } from "@/lib/api";
import { SimulationInput, SimulationResult } from "@/types/simulation";

const defaults: SimulationInput = {
  name: "First job plan",
  annual_salary: 95000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  residence_location: "Brooklyn",
  fica_exempt: true,
  contribution_401k_percent: 5,
  health_insurance_monthly: 180,
  rent: 2600,
  utilities: 145,
  internet: 65,
  phone: 55,
  groceries: 500,
  eating_out: 350,
  transportation_type: "public_transit",
  transit_cost: 132,
  car_payment: 0,
  car_insurance: 0,
  gas: 0,
  parking: 0,
  tolls: 0,
  subscriptions: 80,
  gym: 75,
  personal_spending: 380,
  other_expenses: 150,
};

export default function SimulatorPage() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<SimulationInput>) => setForm((current) => ({ ...current, ...patch }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await api.simulate(form));
    } catch {
      setError("Simulation failed. Confirm the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScenario() {
    setError("");
    try {
      await api.saveScenario(form);
    } catch {
      setError("Could not save this scenario. The simulator result is still usable.");
    }
  }

  return (
    <main className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="section-card">
            <p className="eyebrow">Simulator</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Paycheck simulator</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your offer, rent, commute, and lifestyle costs to estimate monthly take-home and affordability.
            </p>
          </div>
          <Disclaimer />
        </aside>

        <form onSubmit={submit} className="space-y-5">
          <SalaryForm form={form} update={update} />
          <ExpenseForm form={form} update={update} />
          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
          <div className="section-card flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Ready to model this plan?</h2>
              <p className="section-subtitle">Run the estimate first, then save the scenario if it is useful.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button disabled={loading} className="primary-button">
                {loading ? "Calculating..." : "Run simulation"}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={saveScenario} className="secondary-button">
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save scenario
              </button>
            </div>
          </div>
        </form>
      </div>
      {result ? (
        <div className="mt-8">
          <ResultDashboard result={result} />
        </div>
      ) : null}
    </main>
  );
}
