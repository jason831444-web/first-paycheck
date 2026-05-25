"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { percent, usd } from "@/lib/formatters";
import { CityPreset, CompareLocationsRequest, LocationComparisonResult, ResidenceLocation } from "@/types/simulation";

const defaultInput: CompareLocationsRequest = {
  annual_salary: 105000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  fica_exempt: true,
  contribution_401k_percent: 0,
  health_insurance_monthly: 150,
  locations: ["Manhattan", "Brooklyn", "Jersey City"],
};

export function ScenarioComparison() {
  const [form, setForm] = useState(defaultInput);
  const [presets, setPresets] = useState<CityPreset[]>([]);
  const [results, setResults] = useState<LocationComparisonResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  function toggleLocation(location: ResidenceLocation) {
    const selected = form.locations.includes(location);
    update({
      locations: selected ? form.locations.filter((item) => item !== location) : [...form.locations, location],
    });
  }

  async function compare() {
    if (form.locations.length < 2) {
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

  const chartRows = results.map((row) => ({
    location: row.location,
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
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.annual_salary} onChange={(e) => update({ annual_salary: Number(e.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Pay frequency</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.pay_frequency} onChange={(e) => update({ pay_frequency: e.target.value as CompareLocationsRequest["pay_frequency"] })}>
              <option value="monthly">Monthly</option>
              <option value="semi_monthly">Semi-monthly</option>
              <option value="biweekly">Biweekly</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Tax year</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.tax_year} onChange={(e) => update({ tax_year: Number(e.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Filing status</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
              <option value="single">Single</option>
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Work state</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.work_state} onChange={(e) => update({ work_state: e.target.value as CompareLocationsRequest["work_state"] })}>
              <option value="NY">NY</option>
              <option value="NJ">NJ</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <input type="checkbox" checked={form.fica_exempt} onChange={(e) => update({ fica_exempt: e.target.checked })} />
            <span className="text-sm font-medium text-slate-700">OPT/F-1 FICA exempt</span>
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">401k contribution %</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.contribution_401k_percent} onChange={(e) => update({ contribution_401k_percent: Number(e.target.value) })} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">Health insurance monthly</span>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.health_insurance_monthly} onChange={(e) => update({ health_insurance_monthly: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Select locations to compare</h2>
        <p className="mt-1 text-sm text-slate-500">Each location uses editable default cost presets. Results are estimates for planning only.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {presets.map((preset) => {
            const selected = form.locations.includes(preset.residence_location);
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => toggleLocation(preset.residence_location)}
                className={`rounded-lg border p-4 text-left shadow-sm transition ${selected ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <span className="block font-semibold text-slate-950">{preset.name}</span>
                <span className="mt-1 block text-sm text-slate-500">{usd(preset.estimated_rent)} rent preset</span>
              </button>
            );
          })}
        </div>
        <button onClick={compare} disabled={loading} className="mt-5 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60">
          {loading ? "Comparing..." : "Compare selected locations"}
        </button>
      </div>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}

      {results.length > 0 ? <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
      </div> : null}

      {results.length > 0 ? <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Housing ratio by location</h2>
        <div className="mt-4 h-72">
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
      </div> : null}

      {results.length > 0 ? <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {["Location", "Net monthly", "Rent", "Transportation", "Expenses", "Leftover", "Housing ratio", "Savings rate", "Risk"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((row) => (
                <tr key={row.location}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{row.location}</td>
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
      </div> : null}
    </div>
  );
}
