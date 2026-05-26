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
      <span className="field-label">{label}</span>
      <input
        className="field-input"
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
    <div className="section-card">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Income</p>
          <h2 className="section-title">Salary setup</h2>
          <p className="section-subtitle">Start with your offer details and recurring paycheck assumptions.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <NumberField label="Annual salary" value={form.annual_salary} onChange={(annual_salary) => update({ annual_salary })} helper="Use gross base salary before taxes." />
        <label>
          <span className="field-label">Pay frequency</span>
          <select className="field-input" value={form.pay_frequency} onChange={(e) => update({ pay_frequency: e.target.value as SimulationInput["pay_frequency"] })}>
            <option value="monthly">Monthly</option>
            <option value="semi_monthly">Semi-monthly</option>
            <option value="biweekly">Biweekly</option>
          </select>
        </label>
        <NumberField label="Tax year" value={form.tax_year} onChange={(tax_year) => update({ tax_year })} />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="eyebrow">Tax and OPT</p>
        <h2 className="section-title">Residency assumptions</h2>
        <p className="section-subtitle">MVP estimates currently focus on single filers and simplified state logic.</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label>
          <span className="field-label">Filing status</span>
          <select className="field-input" value={form.filing_status} onChange={() => update({ filing_status: "single" })}>
            <option value="single">Single</option>
          </select>
        </label>
        <label>
          <span className="field-label">Work state</span>
          <select className="field-input" value={form.work_state} onChange={(e) => update({ work_state: e.target.value as SimulationInput["work_state"] })}>
            <option value="NY">NY</option>
            <option value="NJ">NJ</option>
          </select>
        </label>
        <label>
          <span className="field-label">Residence</span>
          <select className="field-input" value={form.residence_location} onChange={(e) => update({ residence_location: e.target.value as SimulationInput["residence_location"] })}>
            {["Manhattan", "Brooklyn", "Jersey City", "Hoboken", "NJ Suburb"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex min-h-[4.75rem] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <input className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-100" type="checkbox" checked={form.fica_exempt} onChange={(e) => update({ fica_exempt: e.target.checked })} />
          <span>
            <span className="block text-sm font-medium text-slate-800">OPT/F-1 FICA exempt</span>
            <span className="block text-xs text-slate-500">Set FICA to $0 when eligible.</span>
          </span>
        </label>
        <NumberField label="401k contribution %" value={form.contribution_401k_percent} onChange={(contribution_401k_percent) => update({ contribution_401k_percent })} />
        <NumberField label="Health insurance monthly" value={form.health_insurance_monthly} onChange={(health_insurance_monthly) => update({ health_insurance_monthly })} />
      </div>
    </div>
  );
}
