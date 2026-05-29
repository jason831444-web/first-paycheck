"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { buildSimulationInput } from "@/lib/planningTools";
import { CityPreset, PayFrequency, SimulationResult, TransportationType } from "@/types/simulation";

interface OfferOption {
  id: string;
  name: string;
  annual_salary: number;
  bonus: number;
  relocation_stipend: number;
  work_state: string;
  location_id: string;
  pay_frequency: PayFrequency;
  fica_exempt: boolean;
  contribution_401k_percent: number;
  health_insurance_monthly: number;
  rent: number;
  transportation_type: TransportationType;
  transit_cost: number;
  car_payment: number;
  car_insurance: number;
  gas: number;
  parking: number;
  tolls: number;
  move_in_cash: number;
  notes: string;
}

interface OfferResult {
  offer: OfferOption;
  preset?: CityPreset;
  result: SimulationResult;
  annualLeftover: number;
  relocationAdjustedValue: number;
  effectiveMonthlyLeftover: number;
}

const defaultOffers: OfferOption[] = [
  {
    id: "offer-1",
    name: "NYC analyst offer",
    annual_salary: 105000,
    bonus: 5000,
    relocation_stipend: 0,
    work_state: "NY",
    location_id: "brooklyn-ny",
    pay_frequency: "biweekly",
    fica_exempt: true,
    contribution_401k_percent: 0,
    health_insurance_monthly: 150,
    rent: 2700,
    transportation_type: "public_transit",
    transit_cost: 140,
    car_payment: 0,
    car_insurance: 0,
    gas: 0,
    parking: 0,
    tolls: 0,
    move_in_cash: 7500,
    notes: "Higher salary, high rent.",
  },
  {
    id: "offer-2",
    name: "Austin product offer",
    annual_salary: 98000,
    bonus: 4000,
    relocation_stipend: 3000,
    work_state: "TX",
    location_id: "austin-tx",
    pay_frequency: "biweekly",
    fica_exempt: true,
    contribution_401k_percent: 0,
    health_insurance_monthly: 120,
    rent: 1900,
    transportation_type: "car",
    transit_cost: 0,
    car_payment: 425,
    car_insurance: 185,
    gas: 165,
    parking: 70,
    tolls: 35,
    move_in_cash: 5600,
    notes: "Lower salary, lower taxes and rent.",
  },
];

function Field({ label, value, onChange, type = "number" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState(defaultOffers);
  const [presets, setPresets] = useState<CityPreset[]>([]);
  const [results, setResults] = useState<OfferResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const presetsById = useMemo(() => Object.fromEntries(presets.map((preset) => [preset.id, preset])), [presets]);

  useEffect(() => {
    api.cityPresets().then(setPresets).catch(() => setError("Could not load city presets."));
  }, []);

  function updateOffer(id: string, patch: Partial<OfferOption>) {
    setOffers((current) => current.map((offer) => (offer.id === id ? { ...offer, ...patch } : offer)));
  }

  function addOffer() {
    setOffers((current) => [...current, { ...defaultOffers[0], id: `offer-${Date.now()}`, name: `Offer ${current.length + 1}`, notes: "" }]);
  }

  async function compareOffers() {
    setLoading(true);
    setError("");
    try {
      const nextResults = await Promise.all(
        offers.map(async (offer) => {
          const preset = presetsById[offer.location_id];
          const result = await api.simulate(
            buildSimulationInput(
              {
                annual_salary: offer.annual_salary,
                pay_frequency: offer.pay_frequency,
                tax_year: 2026,
                filing_status: "single",
                work_state: offer.work_state,
                fica_exempt: offer.fica_exempt,
                contribution_401k_percent: offer.contribution_401k_percent,
                health_insurance_monthly: offer.health_insurance_monthly,
              },
              {
                name: offer.name,
                residence_location: preset?.display_name ?? offer.work_state,
                residence_state: preset?.state,
                rent: offer.rent,
                utilities: 160,
                internet: 70,
                transportation_type: offer.transportation_type,
                transit_cost: offer.transit_cost,
                car_payment: offer.car_payment,
                car_insurance: offer.car_insurance,
                gas: offer.gas,
                parking: offer.parking,
                tolls: offer.tolls,
              },
            ),
          );
          const annualLeftover = result.monthly_leftover * 12;
          const relocationAdjustedValue = annualLeftover + offer.bonus + offer.relocation_stipend - offer.move_in_cash;
          const effectiveMonthlyLeftover = result.monthly_leftover - Math.max(offer.move_in_cash - offer.relocation_stipend, 0) / 12;
          return { offer, preset, result, annualLeftover, relocationAdjustedValue, effectiveMonthlyLeftover };
        }),
      );
      setResults(nextResults);
    } catch {
      setError("Could not compare offers. Check the API and inputs.");
    } finally {
      setLoading(false);
    }
  }

  const bestMonthly = results.toSorted((a, b) => b.result.monthly_leftover - a.result.monthly_leftover)[0];
  const bestFirstYear = results.toSorted((a, b) => b.relocationAdjustedValue - a.relocationAdjustedValue)[0];
  const highestSalary = results.toSorted((a, b) => b.offer.annual_salary - a.offer.annual_salary)[0];
  const riskiest = results.toSorted((a, b) => a.result.affordability_score - b.result.affordability_score)[0];
  const lowestHousing = results.toSorted((a, b) => a.result.housing_ratio - b.result.housing_ratio)[0];

  return (
    <main className="page-shell max-w-[1480px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Offers</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Compare job offers</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Compare offers by take-home pay, city costs, transportation, move-in costs, and monthly leftover.</p>
        </div>
        <button className="secondary-button" type="button" onClick={addOffer}><Plus className="mr-2 h-4 w-4" /> Add offer</button>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {offers.map((offer) => (
          <article key={offer.id} className="section-card">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="section-title">{offer.name}</h2><p className="section-subtitle">{presetsById[offer.location_id]?.display_name}</p></div>
              <button className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" type="button" onClick={() => setOffers((current) => current.filter((item) => item.id !== offer.id))} aria-label="Remove offer"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Offer / company" value={offer.name} type="text" onChange={(value) => updateOffer(offer.id, { name: value })} />
              <Field label="Annual salary" value={offer.annual_salary} onChange={(value) => updateOffer(offer.id, { annual_salary: Number(value) })} />
              <Field label="Bonus" value={offer.bonus} onChange={(value) => updateOffer(offer.id, { bonus: Number(value) })} />
              <Field label="Relocation stipend" value={offer.relocation_stipend} onChange={(value) => updateOffer(offer.id, { relocation_stipend: Number(value) })} />
              <Field label="Work state" value={offer.work_state} type="text" onChange={(value) => updateOffer(offer.id, { work_state: value.toUpperCase() })} />
              <label><span className="field-label">Residence preset</span><select className="field-input" value={offer.location_id} onChange={(event) => updateOffer(offer.id, { location_id: event.target.value })}>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.display_name}</option>)}</select></label>
              <label><span className="field-label">Pay frequency</span><select className="field-input" value={offer.pay_frequency} onChange={(event) => updateOffer(offer.id, { pay_frequency: event.target.value as PayFrequency })}><option value="biweekly">Biweekly</option><option value="semi_monthly">Semi-monthly</option><option value="monthly">Monthly</option></select></label>
              <Field label="401k %" value={offer.contribution_401k_percent} onChange={(value) => updateOffer(offer.id, { contribution_401k_percent: Number(value) })} />
              <Field label="Health insurance" value={offer.health_insurance_monthly} onChange={(value) => updateOffer(offer.id, { health_insurance_monthly: Number(value) })} />
              <Field label="Expected rent" value={offer.rent} onChange={(value) => updateOffer(offer.id, { rent: Number(value) })} />
              <label><span className="field-label">Transportation mode</span><select className="field-input" value={offer.transportation_type} onChange={(event) => updateOffer(offer.id, { transportation_type: event.target.value as TransportationType })}><option value="public_transit">Public transit</option><option value="car">Car</option><option value="hybrid">Hybrid</option></select></label>
              <Field label="Transit cost" value={offer.transit_cost} onChange={(value) => updateOffer(offer.id, { transit_cost: Number(value) })} />
              <Field label="Car payment" value={offer.car_payment} onChange={(value) => updateOffer(offer.id, { car_payment: Number(value) })} />
              <Field label="Car insurance" value={offer.car_insurance} onChange={(value) => updateOffer(offer.id, { car_insurance: Number(value) })} />
              <Field label="Gas" value={offer.gas} onChange={(value) => updateOffer(offer.id, { gas: Number(value) })} />
              <Field label="Parking" value={offer.parking} onChange={(value) => updateOffer(offer.id, { parking: Number(value) })} />
              <Field label="Tolls" value={offer.tolls} onChange={(value) => updateOffer(offer.id, { tolls: Number(value) })} />
              <Field label="Move-in cash estimate" value={offer.move_in_cash} onChange={(value) => updateOffer(offer.id, { move_in_cash: Number(value) })} />
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={offer.fica_exempt} onChange={(event) => updateOffer(offer.id, { fica_exempt: event.target.checked })} /> OPT/F-1 FICA exempt</label>
            </div>
            <label className="mt-3 block"><span className="field-label">Notes</span><textarea className="field-input min-h-20" value={offer.notes} onChange={(event) => updateOffer(offer.id, { notes: event.target.value })} /></label>
          </article>
        ))}
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="primary-button" type="button" onClick={compareOffers} disabled={loading}>{loading ? "Comparing..." : "Compare offers"}</button>
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </div>

      {results.length ? (
        <section className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Best monthly leftover", bestMonthly?.offer.name, bestMonthly ? usd(bestMonthly.result.monthly_leftover) : ""],
              ["Best first-year fit", bestFirstYear?.offer.name, bestFirstYear ? usd(bestFirstYear.relocationAdjustedValue) : ""],
              ["Highest salary", highestSalary?.offer.name, highestSalary ? usd(highestSalary.offer.annual_salary) : ""],
              ["Riskiest offer", riskiest?.offer.name, riskiest?.result.risk_level],
              ["Lowest housing burden", lowestHousing?.offer.name, lowestHousing ? percent(lowestHousing.result.housing_ratio) : ""],
            ].map(([label, name, value]) => <div key={label} className="section-card"><p className="eyebrow">{label}</p><h3 className="mt-3 text-lg font-semibold">{name}</h3><p className="mt-2 text-sm text-slate-600">{value}</p></div>)}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="section-card lg:col-span-2">
              <h2 className="section-title">Offer comparison</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"><tr>{["Offer", "Location", "Salary", "Net monthly", "Rent", "Transportation", "Monthly leftover", "Annual leftover", "Move-in cash", "Risk"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item) => <tr key={item.offer.id}>
                      <td className="px-3 py-3 font-semibold">{item.offer.name}</td>
                      <td className="px-3 py-3">{item.preset?.display_name}</td>
                      <td className="px-3 py-3">{usd(item.offer.annual_salary)}</td>
                      <td className="px-3 py-3">{usd(item.result.net_monthly)}</td>
                      <td className="px-3 py-3">{usd(item.offer.rent)}</td>
                      <td className="px-3 py-3">{usd(item.result.expense_breakdown.transportation ?? 0)}</td>
                      <td className="px-3 py-3 font-semibold">{usd(item.result.monthly_leftover)}</td>
                      <td className="px-3 py-3">{usd(item.annualLeftover)}</td>
                      <td className="px-3 py-3">{usd(item.offer.move_in_cash)}</td>
                      <td className="px-3 py-3"><StatusBadge status={item.result.risk_level} /></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="section-card">
              <h2 className="section-title">Monthly leftover</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.map((item) => ({ name: item.offer.name, leftover: item.result.monthly_leftover, net: item.result.net_monthly }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <Tooltip formatter={(value) => usd(Number(value))} />
                    <Bar dataKey="leftover" fill="#0f766e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
