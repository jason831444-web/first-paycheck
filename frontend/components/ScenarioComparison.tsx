"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Search, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { exportComparisonToCSV, exportComparisonToExcel } from "@/lib/exportReports";
import { percent, usd } from "@/lib/formatters";
import { StatusBadge } from "@/components/StatusBadge";
import { CityPreset, CompareLocationsRequest, LocationComparisonResult } from "@/types/simulation";

const defaultInput: CompareLocationsRequest = {
  annual_salary: 105000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  fica_exempt: true,
  contribution_401k_percent: 0,
  health_insurance_monthly: 150,
  location_ids: ["new-york-ny", "jersey-city-nj", "austin-tx"],
};

const filters = ["All", "Northeast", "West Coast", "South", "Midwest", "No state income tax"] as const;
const supportedWorkStates = ["NY", "NJ", "CA", "MA", "DC", "VA", "PA", "IL", "GA", "FL", "TX", "CO", "AZ", "WA"];
const noStateIncomeTaxStates = new Set(["TX", "FL", "WA"]);

export function ScenarioComparison() {
  const [form, setForm] = useState(defaultInput);
  const [presets, setPresets] = useState<CityPreset[]>([]);
  const [results, setResults] = useState<LocationComparisonResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  useEffect(() => {
    async function load() {
      try {
        setPresets(await api.cityPresets());
      } catch {
        setError("Could not load location presets. Check that the API is running.");
      }
    }
    load();
  }, []);

  function update(patch: Partial<CompareLocationsRequest>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function toggleLocation(locationId: string) {
    const selected = form.location_ids.includes(locationId);
    update({
      location_ids: selected ? form.location_ids.filter((item) => item !== locationId) : [...form.location_ids, locationId],
    });
  }

  async function compare() {
    if (form.location_ids.length < 2) {
      setError("Select at least two locations to compare.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.compareLocations({ ...form, annual_salary: form.annual_salary || 105000 });
      setResults(response.results);
    } catch {
      setError("Could not compare selected locations. Check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPresets = form.location_ids
    .map((id) => presets.find((preset) => preset.id === id))
    .filter((preset): preset is CityPreset => Boolean(preset));

  const visiblePresets = presets.filter((preset) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [preset.display_name, preset.city, preset.state, preset.metro_area].some((value) => value.toLowerCase().includes(term));
    const matchesFilter = filter === "All" || preset.region === filter || (filter === "No state income tax" && noStateIncomeTaxStates.has(preset.state));
    return matchesSearch && matchesFilter;
  });

  const chartRows = results.map((row) => ({
    location: row.display_name,
    leftover: row.monthly_leftover,
    housingRatio: Math.round(row.housing_ratio * 100),
  }));

  return (
    <div className="space-y-6">
      <div className="section-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Assumptions</p>
            <h2 className="section-title">Salary and tax setup</h2>
            <p className="section-subtitle">Use the same income assumptions across every selected city.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {form.location_ids.length} selected
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label>
            <span className="field-label">Annual salary</span>
            <input className="field-input" type="number" value={form.annual_salary} onChange={(event) => update({ annual_salary: Number(event.target.value) })} />
          </label>
          <label>
            <span className="field-label">Pay frequency</span>
            <select className="field-input" value={form.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as CompareLocationsRequest["pay_frequency"] })}>
              <option value="monthly">Monthly</option>
              <option value="semi_monthly">Semi-monthly</option>
              <option value="biweekly">Biweekly</option>
            </select>
          </label>
          <label>
            <span className="field-label">Tax year</span>
            <input className="field-input" type="number" value={form.tax_year} onChange={(event) => update({ tax_year: Number(event.target.value) })} />
          </label>
          <label>
            <span className="field-label">Filing status</span>
            <select className="field-input" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
              <option value="single">Single</option>
            </select>
          </label>
          <label>
            <span className="field-label">Work state</span>
            <select className="field-input" value={form.work_state} onChange={(event) => update({ work_state: event.target.value })}>
              {supportedWorkStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <input className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-100" type="checkbox" checked={form.fica_exempt} onChange={(event) => update({ fica_exempt: event.target.checked })} />
            <span className="text-sm font-medium text-slate-700">OPT/F-1 FICA exempt</span>
          </label>
          <label>
            <span className="field-label">401k contribution %</span>
            <input className="field-input" type="number" value={form.contribution_401k_percent} onChange={(event) => update({ contribution_401k_percent: Number(event.target.value) })} />
          </label>
          <label>
            <span className="field-label">Health insurance monthly</span>
            <input className="field-input" type="number" value={form.health_insurance_monthly} onChange={(event) => update({ health_insurance_monthly: Number(event.target.value) })} />
          </label>
        </div>
      </div>

      <div className="section-card">
        <p className="eyebrow">Cities</p>
        <h2 className="section-title">Choose where you might live</h2>
        <p className="section-subtitle">Search by city, state, or metro. Each card uses editable default cost presets.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="field-label">Search city or state</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input className="field-input pl-9" placeholder="Search city or state" value={search} onChange={(event) => setSearch(event.target.value)} />
            </span>
          </label>
          <label>
            <span className="field-label">Filter</span>
            <select className="field-input" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              {filters.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {selectedPresets.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedPresets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => toggleLocation(preset.id)} className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 transition hover:bg-teal-100">
                {preset.display_name}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visiblePresets.map((preset) => {
            const selected = form.location_ids.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => toggleLocation(preset.id)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${selected ? "border-teal-600 bg-teal-50 shadow-teal-900/5" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="block font-semibold text-slate-950">{preset.display_name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{preset.state}</span>
                </span>
                <span className="mt-2 block text-sm text-slate-500">{usd(preset.estimated_rent)} rent · {preset.transportation_type.replace("_", " ")}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">{preset.notes}</span>
              </button>
            );
          })}
        </div>

        <button onClick={compare} disabled={loading} className="primary-button mt-5">
          {loading ? "Comparing..." : "Compare selected locations"}
        </button>
      </div>

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      {results.length > 0 ? (
        <div className="section-card flex flex-col gap-4 border-teal-100 bg-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Export Budget Report</p>
            <h2 className="section-title">Download comparison results</h2>
            <p className="section-subtitle">Download a report for offline planning or apartment comparisons.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void exportComparisonToExcel(results)} className="primary-button">
              <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
              Export comparison to Excel
            </button>
            <button type="button" onClick={() => exportComparisonToCSV(results)} className="secondary-button">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Download comparison CSV
            </button>
          </div>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="section-card">
            <h2 className="section-title">Monthly leftover by location</h2>
            <p className="section-subtitle">Estimated cash cushion after recurring expenses.</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="location" />
                  <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Tooltip formatter={(value: number) => usd(value)} />
                  <Bar dataKey="leftover" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="section-card">
            <h2 className="section-title">Rent ratio by location</h2>
            <p className="section-subtitle">Housing pressure as a share of take-home pay.</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="location" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="housingRatio" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  {["Location", "State", "Net monthly", "Rent", "Transportation", "Expenses", "Leftover", "Housing ratio", "Savings rate", "Risk"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((row) => (
                  <tr key={row.location_id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">{row.display_name}</td>
                    <td className="px-4 py-3">{row.state}</td>
                    <td className="px-4 py-3">{usd(row.net_monthly)}</td>
                    <td className="px-4 py-3">{usd(row.rent)}</td>
                    <td className="px-4 py-3">{usd(row.transportation_cost)}</td>
                    <td className="px-4 py-3">{usd(row.total_expenses)}</td>
                    <td className="px-4 py-3 font-semibold">{usd(row.monthly_leftover)}</td>
                    <td className="px-4 py-3">{percent(row.housing_ratio)}</td>
                    <td className="px-4 py-3">{percent(row.savings_rate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.risk_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4 text-xs leading-5 text-slate-500">
            {[...new Set(results.flatMap((row) => row.tax_assumption_notes))].map((note) => <p key={note}>{note}</p>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
