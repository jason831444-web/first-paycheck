"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { usd } from "@/lib/formatters";
import { SavedBudgetPlan } from "@/types/simulation";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function SavedPlansPage() {
  const [plans, setPlans] = useState<SavedBudgetPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listScenarios()
      .then(setPlans)
      .catch(() => setError("Could not load saved budget plans."))
      .finally(() => setLoading(false));
  }, []);

  async function duplicatePlan(id: number) {
    setError("");
    try {
      const copy = await api.duplicateScenario(id);
      setPlans((current) => [copy, ...current]);
    } catch {
      setError("Could not duplicate this budget plan.");
    }
  }

  async function deletePlan(id: number) {
    if (!window.confirm("Delete this budget plan?")) return;
    setError("");
    try {
      await api.deleteScenario(id);
      setPlans((current) => current.filter((plan) => plan.id !== id));
    } catch {
      setError("Could not delete this budget plan.");
    }
  }

  return (
    <main className="page-shell">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="page-heading">
          <p className="eyebrow">Saved plans</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Saved budget plans</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">Revisit, duplicate, and compare your first-job budget scenarios.</p>
        </div>
        <Link href="/simulator" className="primary-button">
          New budget plan
        </Link>
      </div>

      {error ? <p className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      {loading ? <div className="section-card text-sm text-slate-600">Loading saved plans...</div> : null}

      {!loading && plans.length === 0 ? (
        <div className="section-card text-center">
          <h2 className="section-title">No saved plans yet</h2>
          <p className="section-subtitle">Run a simulation and save your first budget plan.</p>
          <Link href="/simulator" className="primary-button mt-5">
            Open simulator
          </Link>
        </div>
      ) : null}

      {!loading && plans.length > 0 ? (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const result = plan.result;
            const restoredResult = plan.result_data;
            const netMonthly = restoredResult?.net_monthly ?? result?.net_monthly;
            const leftover = restoredResult?.monthly_leftover ?? result?.monthly_leftover;
            const risk = restoredResult?.risk_level ?? result?.risk_level;

            return (
              <article key={plan.id} className="section-card">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{plan.name ?? "Untitled budget plan"}</h2>
                      {risk ? <StatusBadge status={risk} /> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {usd(plan.annual_salary)} salary · {plan.residence_location} · saved {formatDate(plan.created_at)}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="soft-panel">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Net monthly</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{netMonthly !== undefined ? usd(netMonthly) : "Not run"}</p>
                      </div>
                      <div className="soft-panel">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Monthly leftover</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{leftover !== undefined ? usd(leftover) : "Not run"}</p>
                      </div>
                      <div className="soft-panel">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sections</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{plan.active_sections?.length ?? 0} optional</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 lg:justify-end">
                    <Link href={`/simulator?savedScenarioId=${plan.id}`} className="primary-button">
                      <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                      Open
                    </Link>
                    <button type="button" onClick={() => void duplicatePlan(plan.id)} className="secondary-button">
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      Duplicate
                    </button>
                    <button type="button" onClick={() => void deletePlan(plan.id)} className="secondary-button text-rose-700 hover:border-rose-200 hover:bg-rose-50">
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
