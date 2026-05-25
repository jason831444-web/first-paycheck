"use client";

import { SimulationInput } from "@/types/simulation";

interface Props {
  form: SimulationInput;
  update: (patch: Partial<SimulationInput>) => void;
}

export function NumberField({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export function SalaryForm({ form, update }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Salary and tax setup</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <NumberField label="Annual salary" value={form.annual_salary} onChange={(annual_salary) => update({ annual_salary })} />
        <label>
          <span className="text-sm font-medium text-slate-700">Pay frequency</span>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.pay_frequency} onChange={(e) => update({ pay_frequency: e.target.value as SimulationInput["pay_frequency"] })}>
            <option value="monthly">Monthly</option>
            <option value="semi_monthly">Semi-monthly</option>
            <option value="biweekly">Biweekly</option>
          </select>
        </label>
        <NumberField label="Tax year" value={form.tax_year} onChange={(tax_year) => update({ tax_year })} />
        <label>
          <span className="text-sm font-medium text-slate-700">Filing status</span>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
            <option value="single">Single</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Work state</span>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.work_state} onChange={(e) => update({ work_state: e.target.value as SimulationInput["work_state"] })}>
            <option value="NY">NY</option>
            <option value="NJ">NJ</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Residence</span>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.residence_location} onChange={(e) => update({ residence_location: e.target.value as SimulationInput["residence_location"] })}>
            {["Manhattan", "Brooklyn", "Jersey City", "Hoboken", "NJ Suburb"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <input type="checkbox" checked={form.fica_exempt} onChange={(e) => update({ fica_exempt: e.target.checked })} />
          <span className="text-sm font-medium text-slate-700">OPT/F-1 FICA exempt</span>
        </label>
        <NumberField label="401k contribution %" value={form.contribution_401k_percent} onChange={(contribution_401k_percent) => update({ contribution_401k_percent })} />
        <NumberField label="Health insurance monthly" value={form.health_insurance_monthly} onChange={(health_insurance_monthly) => update({ health_insurance_monthly })} />
      </div>
    </div>
  );
}
