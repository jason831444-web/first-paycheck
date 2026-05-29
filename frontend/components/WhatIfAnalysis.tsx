"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { SimulationInput, SimulationResult, WhatIfResponse } from "@/types/simulation";

interface WhatIfAnalysisProps {
  input: SimulationInput;
  baseResult: SimulationResult;
}

function deltaTone(delta: number) {
  if (delta > 0) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (delta < 0) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <ArrowUpRight className="h-4 w-4" aria-hidden="true" />;
  if (delta < 0) return <ArrowDownRight className="h-4 w-4" aria-hidden="true" />;
  return <Minus className="h-4 w-4" aria-hidden="true" />;
}

function formatDelta(delta: number) {
  if (delta > 0) return `+${usd(delta)} vs base`;
  if (delta < 0) return `-${usd(Math.abs(delta))} vs base`;
  return `${usd(0)} vs base`;
}

export function WhatIfAnalysis({ input, baseResult }: WhatIfAnalysisProps) {
  const [analysis, setAnalysis] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestKey = useMemo(() => JSON.stringify(input), [input]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setError("");
      })
      .then(() => api.getWhatIfAnalysis(input))
      .then((response) => {
        if (!cancelled) setAnalysis(response);
      })
      .catch(() => {
        if (!cancelled) {
          setAnalysis(null);
          setError("What-if analysis is unavailable right now. Your main simulation result is still valid.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [input, requestKey]);

  return (
    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Sensitivity</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">What-if analysis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Stress-test your first-job budget against realistic changes.
          </p>
        </div>
        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Base leftover: {usd(baseResult.monthly_leftover)}
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-500">These scenarios are estimates based on your current inputs.</p>

      {loading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && analysis?.results.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analysis.results.map((scenario) => (
            <article key={scenario.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{scenario.label}</h3>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{scenario.description}</p>
                </div>
                <StatusBadge status={scenario.result.risk_level} />
              </div>

              <div className="mt-4">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{usd(scenario.result.monthly_leftover)} left</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${deltaTone(
                    scenario.monthly_leftover_delta,
                  )}`}
                >
                  <DeltaIcon delta={scenario.monthly_leftover_delta} />
                  {formatDelta(scenario.monthly_leftover_delta)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Savings rate</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{percent(scenario.result.savings_rate)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Housing ratio</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{percent(scenario.result.housing_ratio)}</dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-5 text-slate-600">{scenario.insight}</p>
              {scenario.risk_changed ? (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                  Risk level changes in this scenario.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
