"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { usd } from "@/lib/formatters";
import { CityPreset, SimulationInput, SimulationResult } from "@/types/simulation";

interface Row {
  preset: CityPreset;
  result: SimulationResult;
}

const baseInput: SimulationInput = {
  annual_salary: 95000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  residence_location: "Brooklyn",
  fica_exempt: true,
  contribution_401k_percent: 5,
  health_insurance_monthly: 180,
  rent: 0,
  utilities: 0,
  internet: 0,
  phone: 0,
  groceries: 0,
  eating_out: 0,
  transportation_type: "public_transit",
  transit_cost: 0,
  car_payment: 0,
  car_insurance: 0,
  gas: 0,
  parking: 0,
  tolls: 0,
  subscriptions: 0,
  gym: 0,
  personal_spending: 0,
  other_expenses: 0,
};

export function ScenarioComparison() {
  const [salary, setSalary] = useState(baseInput.annual_salary);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const presets = await api.cityPresets();
        const computed = await Promise.all(
          presets.map(async (preset) => {
            const result = await api.simulate({
              ...baseInput,
              annual_salary: salary,
              residence_location: preset.residence_location,
              transportation_type: preset.transportation_type,
              rent: preset.estimated_rent,
              utilities: preset.utilities,
              internet: preset.internet,
              phone: preset.phone,
              groceries: preset.groceries,
              eating_out: preset.eating_out,
              transit_cost: preset.transit_cost,
              car_payment: preset.car_payment,
              car_insurance: preset.car_insurance,
              gas: preset.gas,
              parking: preset.parking,
              tolls: preset.tolls,
              subscriptions: preset.subscriptions,
              gym: preset.gym,
              personal_spending: preset.personal_spending,
              other_expenses: preset.other_expenses,
            });
            return { preset, result };
          }),
        );
        setRows(computed);
      } catch {
        setError("Could not load scenario comparison. Check that the API is running.");
      }
    }
    load();
  }, [salary]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-slate-700">Compare salary</span>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
        </label>
      </div>
      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Monthly leftover by location</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows.map((row) => ({ name: row.preset.name, leftover: row.result.monthly_leftover }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip formatter={(value: number) => usd(value)} />
              <Bar dataKey="leftover" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map(({ preset, result }) => (
          <div key={preset.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-950">{preset.name}</h3>
                <p className="text-sm text-slate-500">{preset.transportation_type.replace("_", " ")}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{result.risk_level}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Net monthly</dt><dd className="font-semibold">{usd(result.net_monthly)}</dd></div>
              <div><dt className="text-slate-500">Rent</dt><dd className="font-semibold">{usd(preset.estimated_rent)}</dd></div>
              <div><dt className="text-slate-500">Transportation</dt><dd className="font-semibold">{usd(result.expense_breakdown.transportation)}</dd></div>
              <div><dt className="text-slate-500">Expenses</dt><dd className="font-semibold">{usd(result.total_expenses)}</dd></div>
              <div><dt className="text-slate-500">Leftover</dt><dd className="font-semibold">{usd(result.monthly_leftover)}</dd></div>
              <div><dt className="text-slate-500">Score</dt><dd className="font-semibold">{result.affordability_score}/100</dd></div>
            </dl>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500">Scenario numbers are estimates and use editable default cost presets.</p>
    </div>
  );
}
