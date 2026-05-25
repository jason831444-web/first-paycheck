"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
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
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Salary and tax assumptions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="text-sm font-medium text-slate-700">Annual salary</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.annual_salary} onChange={(event) => update({ annual_salary: Number(event.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Pay frequency</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as CompareLocationsRequest["pay_frequency"] })}>
              <option value="monthly">Monthly</option>
              <option value="semi_monthly">Semi-monthly</option>
              <option value="biweekly">Biweekly</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Tax year</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.tax_year} onChange={(event) => update({ tax_year: Number(event.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Filing status</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
              <option value="single">Single</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Work state</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.work_state} onChange={(event) => update({ work_state: event.target.value })}>
              {supportedWorkStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <input type="checkbox" checked={form.fica_exempt} onChange={(event) => update({ fica_exempt: event.target.checked })} />
            <span className="text-sm font-medium text-slate-700">OPT/F-1 FICA exempt</span>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">401k contribution %</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.contribution_401k_percent} onChange={(event) => update({ contribution_401k_percent: Number(event.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Health insurance monthly</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.health_insurance_monthly} onChange={(event) => update({ health_insurance_monthly: Number(event.target.value) })} />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Choose where you might live</h2>
        <p className="mt-1 text-sm text-slate-500">Each location uses editable default cost presets. Results are estimates for planning only.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="text-sm font-medium text-slate-700">Search city or state</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Search city or state" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Filter</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              {filters.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {selectedPresets.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedPresets.map((preset) => (
              <button key={preset.id} type="button" onClick={() => toggleLocation(preset.id)} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-900">
                {preset.display_name} x
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
                className={`rounded-lg border p-4 text-left shadow-sm transition ${selected ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <span className="block font-semibold text-slate-950">{preset.display_name}</span>
                <span className="mt-1 block text-sm text-slate-500">{preset.state} · {usd(preset.estimated_rent)} rent · {preset.transportation_type.replace("_", " ")}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">{preset.notes}</span>
              </button>
            );
          })}
        </div>

        <button onClick={compare} disabled={loading} className="mt-5 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">
          {loading ? "Comparing..." : "Compare selected locations"}
        </button>
      </div>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      {results.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Monthly leftover by location</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Tooltip formatter={(value: number) => usd(value)} />
                  <Bar dataKey="leftover" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Rent ratio by location</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" />
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
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
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
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.risk_level}</span>
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
