"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Car, Home } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { CityPreset, SimulationInput, SimulationResult, TransportationType } from "@/types/simulation";

const defaults: SimulationInput = {
  name: "Apartment affordability check",
  annual_salary: 105000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  residence_location: "Brooklyn",
  residence_state: "NY",
  fica_exempt: true,
  contribution_401k_percent: 5,
  health_insurance_monthly: 180,
  rent: 2600,
  utilities: 150,
  internet: 65,
  phone: 0,
  groceries: 450,
  eating_out: 250,
  transportation_type: "public_transit",
  transit_cost: 132,
  car_payment: 0,
  car_insurance: 0,
  gas: 0,
  parking: 0,
  tolls: 0,
  subscriptions: 75,
  gym: 0,
  personal_spending: 250,
  other_expenses: 0,
};

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function decisionTitle(result: SimulationResult) {
  if (result.risk_level === "Comfortable") return "Comfortable";
  if (result.risk_level === "Manageable") return "Manageable, but rent-heavy";
  if (result.risk_level === "Tight") return "Tight";
  return "Risky";
}

export function AffordabilityChecker() {
  const [form, setForm] = useState<SimulationInput>(defaults);
  const [presets, setPresets] = useState<CityPreset[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [noCarResult, setNoCarResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .cityPresets()
      .then(setPresets)
      .catch(() => setError("Could not load city presets. You can still enter details manually."));
  }, []);

  const update = (patch: Partial<SimulationInput>) => setForm((current) => ({ ...current, ...patch }));

  function applyPreset(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) return;
    update({
      residence_location: preset.display_name,
      residence_state: preset.state,
      work_state: preset.state,
      rent: preset.estimated_rent,
      transportation_type: preset.transportation_type,
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNoCarResult(null);

    try {
      const nextResult = await api.simulate(form);
      setResult(nextResult);

      if (form.transportation_type === "car" || form.transportation_type === "hybrid") {
        const withoutCar = await api.simulate({
          ...form,
          transportation_type: "public_transit",
          car_payment: 0,
          car_insurance: 0,
          gas: 0,
          parking: 0,
          tolls: 0,
        });
        setNoCarResult(withoutCar);
      }
    } catch {
      setError("Could not run the affordability check. Confirm the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  const carImpact = result && noCarResult ? noCarResult.monthly_leftover - result.monthly_leftover : 0;
  const rentRatio = result ? `This rent takes ${percent(result.housing_ratio)} of your estimated take-home pay.` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,680px)_minmax(320px,1fr)] lg:items-start">
      <form onSubmit={submit} className="section-card space-y-6">
        <div>
          <p className="eyebrow">Rent check</p>
          <h2 className="section-title">Apartment details</h2>
          <p className="section-subtitle">Use your offer, rent, and commute assumptions for a focused decision.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumberField label="Annual salary" value={form.annual_salary} onChange={(annual_salary) => update({ annual_salary })} />
          <label>
            <span className="field-label">Pay frequency</span>
            <select className="field-input" value={form.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as SimulationInput["pay_frequency"] })}>
              <option value="monthly">Monthly</option>
              <option value="semi_monthly">Semi-monthly</option>
              <option value="biweekly">Biweekly</option>
            </select>
          </label>
          <NumberField label="Tax year" value={form.tax_year} onChange={(tax_year) => update({ tax_year })} />
          <label>
            <span className="field-label">Filing status</span>
            <select className="field-input" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
              <option value="single">Single</option>
            </select>
          </label>
          <label>
            <span className="field-label">City preset</span>
            <select className="field-input" defaultValue="" onChange={(event) => applyPreset(event.target.value)}>
              <option value="">Manual location</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Work state</span>
            <input className="field-input" value={form.work_state} onChange={(event) => update({ work_state: event.target.value.toUpperCase() })} />
          </label>
          <label>
            <span className="field-label">Residence location</span>
            <input className="field-input" value={form.residence_location} onChange={(event) => update({ residence_location: event.target.value })} />
          </label>
          <label>
            <span className="field-label">Residence state</span>
            <input className="field-input" value={form.residence_state ?? ""} onChange={(event) => update({ residence_state: event.target.value.toUpperCase() })} />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <input className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-100" type="checkbox" checked={form.fica_exempt} onChange={(event) => update({ fica_exempt: event.target.checked })} />
            <span className="text-sm font-medium text-slate-700">OPT/F-1 FICA exemption</span>
          </label>
          <NumberField label="401k contribution %" value={form.contribution_401k_percent} onChange={(contribution_401k_percent) => update({ contribution_401k_percent })} />
          <NumberField label="Health insurance monthly premium" value={form.health_insurance_monthly} onChange={(health_insurance_monthly) => update({ health_insurance_monthly })} />
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="section-title">Rent and monthly costs</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <NumberField label="Monthly rent" value={form.rent} onChange={(rent) => update({ rent })} />
            <NumberField label="Utilities estimate" value={form.utilities} onChange={(utilities) => update({ utilities })} />
            <NumberField label="Internet estimate" value={form.internet} onChange={(internet) => update({ internet })} />
            <label>
              <span className="field-label">Transportation mode</span>
              <select className="field-input" value={form.transportation_type} onChange={(event) => update({ transportation_type: event.target.value as TransportationType })}>
                <option value="public_transit">Public transit</option>
                <option value="car">Car</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <NumberField label="Transit cost" value={form.transit_cost} onChange={(transit_cost) => update({ transit_cost })} />
            <NumberField label="Car payment" value={form.car_payment} onChange={(car_payment) => update({ car_payment })} />
            <NumberField label="Car insurance" value={form.car_insurance} onChange={(car_insurance) => update({ car_insurance })} />
            <NumberField label="Gas" value={form.gas} onChange={(gas) => update({ gas })} />
            <NumberField label="Parking" value={form.parking} onChange={(parking) => update({ parking })} />
            <NumberField label="Tolls" value={form.tolls} onChange={(tolls) => update({ tolls })} />
            <NumberField label="Basic food/lifestyle estimate" value={form.groceries + form.eating_out + form.subscriptions + form.personal_spending} onChange={(value) => update({ groceries: value, eating_out: 0, subscriptions: 0, personal_spending: 0 })} />
          </div>
        </div>

        {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}

        <button disabled={loading} className="primary-button">
          {loading ? "Checking..." : "Check affordability"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <aside className="section-card lg:sticky lg:top-24">
        {!result ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
              <Home className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 section-title">Enter apartment details</h2>
            <p className="section-subtitle max-w-sm">Enter apartment details to see if this rent fits your first paycheck.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Decision</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{decisionTitle(result)}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{rentRatio}</p>
              </div>
              <StatusBadge status={result.risk_level} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="soft-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Monthly leftover</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{usd(result.monthly_leftover)}</p>
              </div>
              <div className="soft-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rent ratio</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{percent(result.housing_ratio)}</p>
              </div>
              <div className="soft-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Safe rent max</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{usd(result.rent_recommendation.safe_max_rent)}</p>
              </div>
              <div className="soft-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Stretch rent max</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{usd(result.rent_recommendation.stretch_max_rent)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4">
              <p className="text-sm font-semibold text-teal-950">Affordability score: {result.affordability_score}/100</p>
              <p className="mt-2 text-sm leading-6 text-teal-900">{result.recommendation_text}</p>
            </div>

            {result.housing_ratio > 0.35 ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                A safer rent target would be around {usd(result.rent_recommendation.safe_max_rent)}-{usd(result.rent_recommendation.stretch_max_rent)}.
              </p>
            ) : null}

            {form.transportation_type !== "public_transit" && noCarResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <p className="text-sm font-semibold text-slate-950">Car cost what-if</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Current transportation leaves {usd(result.monthly_leftover)}. Without car costs, estimated leftover is {usd(noCarResult.monthly_leftover)}, a difference of {usd(carImpact)}.
                </p>
              </div>
            ) : null}

            <p className="text-xs leading-5 text-slate-500">This estimate is for planning only and is not tax, legal, or financial advice.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
