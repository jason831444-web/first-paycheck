"use client";

import { FormEvent, useState } from "react";
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Paycheck simulator</h1>
        <p className="mt-2 text-slate-600">Enter your offer, rent, and monthly spending assumptions.</p>
      </div>
      <Disclaimer />
      <form onSubmit={submit} className="mt-6 space-y-5">
        <SalaryForm form={form} update={update} />
        <ExpenseForm form={form} update={update} />
        {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button disabled={loading} className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">
            {loading ? "Calculating..." : "Run Simulation"}
          </button>
          <button type="button" onClick={saveScenario} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Save Scenario
          </button>
        </div>
      </form>
      {result ? (
        <div className="mt-8">
          <ResultDashboard result={result} />
        </div>
      ) : null}
    </main>
  );
}
