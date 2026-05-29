"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { buildSimulationInput, defaultSalaryAssumptions, divideSafe, downloadCsv, SalaryAssumptions } from "@/lib/planningTools";
import { CityPreset, SimulationResult } from "@/types/simulation";

interface ApartmentOption {
  id: string;
  name: string;
  listing_url: string;
  location_id: string;
  rent: number;
  sqft: number;
  utilities: number;
  internet: number;
  in_unit_laundry: boolean;
  laundry_cost: number;
  parking_cost: number;
  commute_cost: number;
  car_required: boolean;
  broker_fee: number;
  security_deposit: number;
  move_in_fee: number;
  application_fee: number;
  furniture: number;
  notes: string;
}

interface ApartmentResult {
  option: ApartmentOption;
  preset?: CityPreset;
  result: SimulationResult;
  monthlyHousing: number;
  monthlyTransportation: number;
  moveInCash: number;
  costPerSqft: number;
}

const defaultApartments: ApartmentOption[] = [
  {
    id: "apt-1",
    name: "Transit studio",
    listing_url: "",
    location_id: "brooklyn-ny",
    rent: 2600,
    sqft: 480,
    utilities: 150,
    internet: 70,
    in_unit_laundry: false,
    laundry_cost: 35,
    parking_cost: 0,
    commute_cost: 140,
    car_required: false,
    broker_fee: 0,
    security_deposit: 2600,
    move_in_fee: 250,
    application_fee: 20,
    furniture: 1800,
    notes: "Good transit, smaller space.",
  },
  {
    id: "apt-2",
    name: "Roomier car commute",
    listing_url: "",
    location_id: "austin-tx",
    rent: 1900,
    sqft: 720,
    utilities: 175,
    internet: 70,
    in_unit_laundry: true,
    laundry_cost: 0,
    parking_cost: 70,
    commute_cost: 0,
    car_required: true,
    broker_fee: 0,
    security_deposit: 1900,
    move_in_fee: 150,
    application_fee: 75,
    furniture: 2200,
    notes: "Lower rent, car required.",
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

function SalaryAssumptionFields({ assumptions, update }: { assumptions: SalaryAssumptions; update: (patch: Partial<SalaryAssumptions>) => void }) {
  return (
    <div className="section-card">
      <h2 className="section-title">Salary and tax assumptions</h2>
      <p className="section-subtitle">Applied to every apartment option.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Annual salary" value={assumptions.annual_salary} onChange={(value) => update({ annual_salary: Number(value) })} />
        <label>
          <span className="field-label">Pay frequency</span>
          <select className="field-input" value={assumptions.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as SalaryAssumptions["pay_frequency"] })}>
            <option value="biweekly">Biweekly</option>
            <option value="semi_monthly">Semi-monthly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <Field label="Tax year" value={assumptions.tax_year} onChange={(value) => update({ tax_year: Number(value) })} />
        <Field label="Work state" value={assumptions.work_state} onChange={(value) => update({ work_state: value.toUpperCase() })} type="text" />
        <Field label="401k %" value={assumptions.contribution_401k_percent} onChange={(value) => update({ contribution_401k_percent: Number(value) })} />
        <Field label="Health insurance" value={assumptions.health_insurance_monthly} onChange={(value) => update({ health_insurance_monthly: Number(value) })} />
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={assumptions.fica_exempt} onChange={(event) => update({ fica_exempt: event.target.checked })} />
          OPT/F-1 FICA exempt
        </label>
      </div>
    </div>
  );
}

export default function ApartmentsPage() {
  const [assumptions, setAssumptions] = useState(defaultSalaryAssumptions);
  const [presets, setPresets] = useState<CityPreset[]>([]);
  const [apartments, setApartments] = useState(defaultApartments);
  const [results, setResults] = useState<ApartmentResult[]>([]);
  const [planner, setPlanner] = useState({ emergency_buffer: 2500, current_savings: 8000, monthly_savings_capacity: 1200, moving_cost: 700, travel: 300, temporary_housing: 0, supplies: 450 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.cityPresets().then(setPresets).catch(() => setError("Could not load city presets."));
  }, []);

  const presetsById = useMemo(() => Object.fromEntries(presets.map((preset) => [preset.id, preset])), [presets]);
  const bestFinancialFit = results.toSorted((a, b) => b.result.monthly_leftover - a.result.monthly_leftover)[0];
  const lowestMoveIn = results.toSorted((a, b) => a.moveInCash - b.moveInCash)[0];
  const bestValue = results.filter((item) => item.costPerSqft > 0).toSorted((a, b) => a.costPerSqft - b.costPerSqft)[0];
  const riskiest = results.toSorted((a, b) => a.result.affordability_score - b.result.affordability_score)[0];
  const bestTransit = results.filter((item) => !item.option.car_required).toSorted((a, b) => b.result.monthly_leftover - a.result.monthly_leftover)[0];
  const selectedForPlanner = apartments[0];
  const upfrontCashNeeded = selectedForPlanner
    ? selectedForPlanner.rent + selectedForPlanner.security_deposit + selectedForPlanner.broker_fee + selectedForPlanner.application_fee + selectedForPlanner.move_in_fee + selectedForPlanner.furniture + planner.supplies + planner.moving_cost + planner.travel + planner.temporary_housing + planner.emergency_buffer
    : 0;
  const savingsGap = Math.max(upfrontCashNeeded - planner.current_savings, 0);
  const monthsToTarget = planner.monthly_savings_capacity > 0 ? Math.ceil(savingsGap / planner.monthly_savings_capacity) : Infinity;

  function updateApartment(id: string, patch: Partial<ApartmentOption>) {
    setApartments((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addApartment() {
    setApartments((current) => [
      ...current,
      {
        ...defaultApartments[0],
        id: `apt-${Date.now()}`,
        name: `Apartment ${current.length + 1}`,
        notes: "",
      },
    ]);
  }

  async function runComparison() {
    setLoading(true);
    setError("");
    try {
      const nextResults = await Promise.all(
        apartments.map(async (option) => {
          const preset = presetsById[option.location_id];
          const carCosts = option.car_required ? { car_payment: 425, car_insurance: 190, gas: 170, parking: option.parking_cost, tolls: 30 } : { parking: option.parking_cost };
          const result = await api.simulate(
            buildSimulationInput(assumptions, {
              name: option.name,
              residence_location: preset?.display_name ?? "New York, NY",
              residence_state: preset?.state,
              rent: option.rent,
              utilities: option.utilities + option.laundry_cost,
              internet: option.internet,
              transportation_type: option.car_required ? "car" : "public_transit",
              transit_cost: option.car_required ? 0 : option.commute_cost,
              ...carCosts,
              groceries: 500,
              eating_out: 300,
              other_expenses: 100,
            }),
          );
          const monthlyHousing = option.rent + option.utilities + option.internet + option.laundry_cost + option.parking_cost;
          const moveInCash = option.rent + option.security_deposit + option.broker_fee + option.move_in_fee + option.application_fee + option.furniture;
          return {
            option,
            preset,
            result,
            monthlyHousing,
            monthlyTransportation: result.expense_breakdown.transportation ?? 0,
            moveInCash,
            costPerSqft: divideSafe(option.rent, option.sqft),
          };
        }),
      );
      setResults(nextResults);
    } catch {
      setError("Could not run apartment comparison. Check inputs and backend status.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    downloadCsv(
      "firstpaycheck-apartment-comparison.csv",
      results.map((item) => ({
        Apartment: item.option.name,
        Location: item.preset?.display_name ?? "",
        Rent: item.option.rent,
        Sqft: item.option.sqft,
        "Cost / sqft": item.costPerSqft.toFixed(2),
        "Move-in cash": item.moveInCash,
        "Monthly leftover": item.result.monthly_leftover,
        "Housing ratio": percent(item.result.housing_ratio),
        Risk: item.result.risk_level,
        Notes: item.option.notes,
      })),
    );
  }

  return (
    <main className="page-shell max-w-[1480px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Apartments</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Compare apartments</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Compare rent, move-in cash, commute costs, and monthly leftover before you sign a lease.</p>
        </div>
        <button className="secondary-button" type="button" onClick={addApartment}>
          <Plus className="mr-2 h-4 w-4" /> Add apartment
        </button>
      </div>

      <SalaryAssumptionFields assumptions={assumptions} update={(patch) => setAssumptions((current) => ({ ...current, ...patch }))} />

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        {apartments.map((apartment) => (
          <article key={apartment.id} className="section-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="section-title">{apartment.name}</h2>
                <p className="section-subtitle">{presetsById[apartment.location_id]?.display_name ?? "Choose a location"}</p>
              </div>
              <button className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" type="button" onClick={() => setApartments((current) => current.filter((item) => item.id !== apartment.id))} aria-label="Remove apartment">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Apartment name" value={apartment.name} type="text" onChange={(value) => updateApartment(apartment.id, { name: value })} />
              <label>
                <span className="field-label">Location preset</span>
                <select className="field-input" value={apartment.location_id} onChange={(event) => updateApartment(apartment.id, { location_id: event.target.value })}>
                  {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.display_name}</option>)}
                </select>
              </label>
              <Field label="Listing URL" value={apartment.listing_url} type="url" onChange={(value) => updateApartment(apartment.id, { listing_url: value })} />
              <Field label="Monthly rent" value={apartment.rent} onChange={(value) => updateApartment(apartment.id, { rent: Number(value) })} />
              <Field label="Square feet" value={apartment.sqft} onChange={(value) => updateApartment(apartment.id, { sqft: Number(value) })} />
              <Field label="Utilities" value={apartment.utilities} onChange={(value) => updateApartment(apartment.id, { utilities: Number(value) })} />
              <Field label="Internet" value={apartment.internet} onChange={(value) => updateApartment(apartment.id, { internet: Number(value) })} />
              <Field label="Laundry cost" value={apartment.laundry_cost} onChange={(value) => updateApartment(apartment.id, { laundry_cost: Number(value) })} />
              <Field label="Parking cost" value={apartment.parking_cost} onChange={(value) => updateApartment(apartment.id, { parking_cost: Number(value) })} />
              <Field label="Transit / commute" value={apartment.commute_cost} onChange={(value) => updateApartment(apartment.id, { commute_cost: Number(value) })} />
              <Field label="Broker fee" value={apartment.broker_fee} onChange={(value) => updateApartment(apartment.id, { broker_fee: Number(value) })} />
              <Field label="Security deposit" value={apartment.security_deposit} onChange={(value) => updateApartment(apartment.id, { security_deposit: Number(value) })} />
              <Field label="Move-in fee" value={apartment.move_in_fee} onChange={(value) => updateApartment(apartment.id, { move_in_fee: Number(value) })} />
              <Field label="Application fee" value={apartment.application_fee} onChange={(value) => updateApartment(apartment.id, { application_fee: Number(value) })} />
              <Field label="Furniture/setup" value={apartment.furniture} onChange={(value) => updateApartment(apartment.id, { furniture: Number(value) })} />
              <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700">
                <label className="flex items-center gap-2"><input type="checkbox" checked={apartment.in_unit_laundry} onChange={(event) => updateApartment(apartment.id, { in_unit_laundry: event.target.checked })} /> In-unit laundry</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={apartment.car_required} onChange={(event) => updateApartment(apartment.id, { car_required: event.target.checked })} /> Car required</label>
              </div>
            </div>
            <label className="mt-3 block">
              <span className="field-label">Notes</span>
              <textarea className="field-input min-h-20" value={apartment.notes} onChange={(event) => updateApartment(apartment.id, { notes: event.target.value })} />
            </label>
            {apartment.listing_url ? <Link className="mt-3 inline-flex items-center text-sm font-semibold text-teal-700" href={apartment.listing_url}>Open listing <ExternalLink className="ml-1 h-3 w-3" /></Link> : null}
          </article>
        ))}
      </section>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="primary-button" type="button" onClick={runComparison} disabled={loading}>{loading ? "Comparing..." : "Run comparison"}</button>
        {results.length ? <button className="secondary-button" type="button" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Download CSV</button> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </div>

      {results.length ? (
        <section className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Best financial fit", bestFinancialFit?.option.name, bestFinancialFit ? usd(bestFinancialFit.result.monthly_leftover) : ""],
              ["Lowest move-in cash", lowestMoveIn?.option.name, lowestMoveIn ? usd(lowestMoveIn.moveInCash) : ""],
              ["Best value / sqft", bestValue?.option.name, bestValue ? `$${bestValue.costPerSqft.toFixed(2)}` : ""],
              ["Most risky option", riskiest?.option.name, riskiest?.result.risk_level],
              ["Best transit-friendly", bestTransit?.option.name ?? "No transit option", bestTransit ? usd(bestTransit.result.monthly_leftover) : ""],
            ].map(([label, name, value]) => (
              <div key={label} className="section-card">
                <p className="eyebrow">{label}</p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{name}</h3>
                <p className="mt-2 text-sm text-slate-600">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="section-card lg:col-span-2">
              <h2 className="section-title">Comparison table</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>{["Apartment", "Location", "Rent", "Sqft", "Cost / sqft", "Move-in cash", "Monthly leftover", "Housing ratio", "Risk", "Notes"].map((heading) => <th className="px-3 py-3" key={heading}>{heading}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item) => (
                      <tr key={item.option.id}>
                        <td className="px-3 py-3 font-semibold text-slate-950">{item.option.name}</td>
                        <td className="px-3 py-3">{item.preset?.display_name}</td>
                        <td className="px-3 py-3">{usd(item.option.rent)}</td>
                        <td className="px-3 py-3">{item.option.sqft}</td>
                        <td className="px-3 py-3">${item.costPerSqft.toFixed(2)}</td>
                        <td className="px-3 py-3">{usd(item.moveInCash)}</td>
                        <td className="px-3 py-3 font-semibold">{usd(item.result.monthly_leftover)}</td>
                        <td className="px-3 py-3">{percent(item.result.housing_ratio)}</td>
                        <td className="px-3 py-3"><StatusBadge status={item.result.risk_level} /></td>
                        <td className="px-3 py-3 text-slate-500">{item.option.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="section-card">
              <h2 className="section-title">Monthly leftover</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.map((item) => ({ name: item.option.name, leftover: item.result.monthly_leftover, moveIn: item.moveInCash }))}>
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

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-card">
          <h2 className="section-title">Move-in cash planner</h2>
          <p className="section-subtitle">Uses the first apartment as the base option and adds moving buffer assumptions.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Kitchen/home supplies" value={planner.supplies} onChange={(value) => setPlanner((current) => ({ ...current, supplies: Number(value) }))} />
            <Field label="Moving truck/company" value={planner.moving_cost} onChange={(value) => setPlanner((current) => ({ ...current, moving_cost: Number(value) }))} />
            <Field label="Travel to new city" value={planner.travel} onChange={(value) => setPlanner((current) => ({ ...current, travel: Number(value) }))} />
            <Field label="Temporary housing" value={planner.temporary_housing} onChange={(value) => setPlanner((current) => ({ ...current, temporary_housing: Number(value) }))} />
            <Field label="Emergency buffer" value={planner.emergency_buffer} onChange={(value) => setPlanner((current) => ({ ...current, emergency_buffer: Number(value) }))} />
            <Field label="Current savings" value={planner.current_savings} onChange={(value) => setPlanner((current) => ({ ...current, current_savings: Number(value) }))} />
            <Field label="Monthly savings capacity" value={planner.monthly_savings_capacity} onChange={(value) => setPlanner((current) => ({ ...current, monthly_savings_capacity: Number(value) }))} />
          </div>
        </div>
        <div className="section-card">
          <h2 className="section-title">Move-in readiness</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="soft-panel"><p className="text-xs text-slate-500">Upfront cash needed</p><p className="mt-2 text-2xl font-semibold">{usd(upfrontCashNeeded)}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">Savings gap</p><p className="mt-2 text-2xl font-semibold">{usd(savingsGap)}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">Months to target</p><p className="mt-2 text-2xl font-semibold">{Number.isFinite(monthsToTarget) ? monthsToTarget : "Not reachable"}</p></div>
          </div>
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${savingsGap > 0 ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
            {savingsGap > 0
              ? planner.monthly_savings_capacity <= 0
                ? "At your current savings capacity, this move-in target is not reachable without additional savings or reducing upfront costs."
                : `You need about ${monthsToTarget} month(s) to close the move-in cash gap.`
              : "Current savings cover this move-in target, including the selected buffer."}
          </p>
        </div>
      </section>
    </main>
  );
}
