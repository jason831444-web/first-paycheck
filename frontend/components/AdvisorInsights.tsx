"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Info, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { usd } from "@/lib/formatters";
import { AdvisorInsight, AdvisorInsightsResponse, AdvisorInsightSeverity, SimulationInput, SimulationResult } from "@/types/simulation";

interface AdvisorInsightsProps {
  input: SimulationInput;
  result: SimulationResult;
}

const severityStyles: Record<AdvisorInsightSeverity, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

const iconStyles: Record<AdvisorInsightSeverity, string> = {
  critical: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  positive: "bg-emerald-100 text-emerald-700",
};

function InsightIcon({ severity }: { severity: AdvisorInsightSeverity }) {
  const className = "h-4 w-4";
  if (severity === "critical") return <ShieldAlert className={className} aria-hidden="true" />;
  if (severity === "warning") return <AlertTriangle className={className} aria-hidden="true" />;
  if (severity === "positive") return <CheckCircle2 className={className} aria-hidden="true" />;
  return <Info className={className} aria-hidden="true" />;
}

function Impact({ insight }: { insight: AdvisorInsight }) {
  if (insight.estimated_monthly_impact === null || insight.estimated_monthly_impact === undefined || insight.estimated_monthly_impact <= 0) return null;

  return (
    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">
      <CircleDollarSign className="h-4 w-4 text-teal-700" aria-hidden="true" />
      Potential monthly impact: {usd(insight.estimated_monthly_impact)}
    </div>
  );
}

export function AdvisorInsights({ input, result }: AdvisorInsightsProps) {
  const [response, setResponse] = useState<AdvisorInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestKey = useMemo(() => JSON.stringify({ input, result }), [input, result]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setError("");
      })
      .then(() => api.getAdvisorInsights(input, result))
      .then((nextResponse) => {
        if (!cancelled) setResponse(nextResponse);
      })
      .catch(() => {
        if (!cancelled) {
          setResponse(null);
          setError("Advisor insights are unavailable right now. Your main simulation result is still valid.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [input, result, requestKey]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Advisor Insights</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Practical recommendations based on your rent, savings rate, transportation costs, and tax assumptions.
          </p>
        </div>
        <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Explainable planning guidance
        </p>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && response?.insights.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {response.insights.map((insight) => (
            <article key={insight.id} className={`rounded-3xl border p-4 shadow-sm ${severityStyles[insight.severity]}`}>
              <div className="flex items-start gap-3">
                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconStyles[insight.severity]}`}>
                  <InsightIcon severity={insight.severity} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                      {insight.category}
                    </span>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                      {insight.severity}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{insight.title}</h3>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">{insight.message}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-900">{insight.suggested_action}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {insight.metric_label && insight.metric_value ? (
                  <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 font-semibold text-slate-700">
                    {insight.metric_label}: {insight.metric_value}
                  </span>
                ) : null}
              </div>
              <Impact insight={insight} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
