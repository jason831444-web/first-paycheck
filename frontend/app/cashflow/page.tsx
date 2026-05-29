"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { usd } from "@/lib/formatters";
import { addMonths, formatDisplayMonth } from "@/lib/planningTools";

interface CashflowForm {
  starting_cash: number;
  job_start_date: string;
  first_paycheck_date: string;
  pay_frequency: "biweekly" | "semi_monthly" | "monthly";
  net_paycheck_amount: number;
  monthly_rent: number;
  monthly_essentials: number;
  monthly_lifestyle: number;
  move_in_costs: number;
  relocation_costs: number;
  reimbursement_amount: number;
  reimbursement_date: string;
}

const defaultForm: CashflowForm = {
  starting_cash: 9000,
  job_start_date: "2026-06-15",
  first_paycheck_date: "2026-06-28",
  pay_frequency: "biweekly",
  net_paycheck_amount: 3200,
  monthly_rent: 2400,
  monthly_essentials: 1100,
  monthly_lifestyle: 650,
  move_in_costs: 5200,
  relocation_costs: 1200,
  reimbursement_amount: 2000,
  reimbursement_date: "2026-08-15",
};

function Field({ label, value, onChange, type = "number" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function paychecksInMonth(form: CashflowForm, month: Date) {
  const firstPaycheck = new Date(`${form.first_paycheck_date}T12:00:00`);
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  if (form.pay_frequency === "monthly") {
    return firstPaycheck <= end && firstPaycheck >= start ? 1 : firstPaycheck < start ? 1 : 0;
  }

  if (form.pay_frequency === "semi_monthly") {
    const dates = [new Date(month.getFullYear(), month.getMonth(), 15), new Date(month.getFullYear(), month.getMonth() + 1, 0)];
    return dates.filter((date) => date >= firstPaycheck && date >= start && date <= end).length;
  }

  let count = 0;
  const cursor = new Date(firstPaycheck);
  while (cursor <= end) {
    if (cursor >= start) count += 1;
    cursor.setDate(cursor.getDate() + 14);
  }
  return count;
}

export default function CashflowPage() {
  const [form, setForm] = useState(defaultForm);
  const update = (patch: Partial<CashflowForm>) => setForm((current) => ({ ...current, ...patch }));
  const rows = useMemo(() => {
    const start = new Date(`${form.job_start_date}T12:00:00`);
    let cash = form.starting_cash;
    return Array.from({ length: 4 }).map((_, index) => {
      const month = addMonths(start, index);
      const startingCash = cash;
      const paychecks = paychecksInMonth(form, month);
      const paycheckIncome = paychecks * form.net_paycheck_amount;
      const reimbursementDate = form.reimbursement_date ? new Date(`${form.reimbursement_date}T12:00:00`) : null;
      const reimbursement = reimbursementDate && reimbursementDate.getFullYear() === month.getFullYear() && reimbursementDate.getMonth() === month.getMonth() ? form.reimbursement_amount : 0;
      const oneTimeCosts = index === 0 ? form.move_in_costs + form.relocation_costs : 0;
      const recurringExpenses = form.monthly_rent + form.monthly_essentials + form.monthly_lifestyle;
      const endingCash = startingCash + paycheckIncome + reimbursement - oneTimeCosts - recurringExpenses;
      const lowestCash = Math.min(startingCash - oneTimeCosts, endingCash);
      cash = endingCash;
      return { index, month, startingCash, paychecks, paycheckIncome, reimbursement, oneTimeCosts, recurringExpenses, endingCash, lowestCash };
    });
  }, [form]);
  const lowest = rows.reduce((min, row) => (row.lowestCash < min.lowestCash ? row : min), rows[0]);
  const firstMonth = rows[0];
  const rentBeforeFirstPaycheck = new Date(`${form.first_paycheck_date}T12:00:00`).getDate() > 1;

  return (
    <main className="page-shell max-w-7xl">
      <div className="mb-6">
        <p className="eyebrow">Cashflow</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">First 90 days cashflow</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">See whether your savings can cover move-in costs, paycheck timing, and the first few months of bills.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="section-card">
          <h2 className="section-title">Inputs</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Starting cash" value={form.starting_cash} onChange={(value) => update({ starting_cash: Number(value) })} />
            <Field label="Job start date" type="date" value={form.job_start_date} onChange={(value) => update({ job_start_date: value })} />
            <Field label="First paycheck date" type="date" value={form.first_paycheck_date} onChange={(value) => update({ first_paycheck_date: value })} />
            <label>
              <span className="field-label">Pay frequency</span>
              <select className="field-input" value={form.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as CashflowForm["pay_frequency"] })}>
                <option value="biweekly">Biweekly</option>
                <option value="semi_monthly">Semi-monthly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <Field label="Net paycheck amount" value={form.net_paycheck_amount} onChange={(value) => update({ net_paycheck_amount: Number(value) })} />
            <Field label="Monthly rent" value={form.monthly_rent} onChange={(value) => update({ monthly_rent: Number(value) })} />
            <Field label="Monthly essentials" value={form.monthly_essentials} onChange={(value) => update({ monthly_essentials: Number(value) })} />
            <Field label="Monthly lifestyle" value={form.monthly_lifestyle} onChange={(value) => update({ monthly_lifestyle: Number(value) })} />
            <Field label="Move-in costs" value={form.move_in_costs} onChange={(value) => update({ move_in_costs: Number(value) })} />
            <Field label="Relocation costs" value={form.relocation_costs} onChange={(value) => update({ relocation_costs: Number(value) })} />
            <Field label="Reimbursement amount" value={form.reimbursement_amount} onChange={(value) => update({ reimbursement_amount: Number(value) })} />
            <Field label="Reimbursement date" type="date" value={form.reimbursement_date} onChange={(value) => update({ reimbursement_date: value })} />
          </div>
        </section>

        <section className="section-card">
          <h2 className="section-title">90-day risk snapshot</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="soft-panel"><p className="text-xs text-slate-500">Lowest cash point</p><p className="mt-2 text-2xl font-semibold">{usd(lowest.lowestCash)}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">Month 1 paychecks</p><p className="mt-2 text-2xl font-semibold">{firstMonth.paychecks}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">Suggested buffer</p><p className="mt-2 text-2xl font-semibold">{usd(Math.max(form.monthly_rent + form.monthly_essentials, Math.abs(Math.min(lowest.lowestCash, 0))))}</p></div>
          </div>
          <div className={`mt-4 flex gap-3 rounded-2xl p-4 text-sm ${lowest.lowestCash < 0 || rentBeforeFirstPaycheck ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your lowest cash point is {usd(lowest.lowestCash)} in {formatDisplayMonth(lowest.month)}.
              {rentBeforeFirstPaycheck ? " Your first paycheck arrives after rent is due, so keep extra cash available." : " Paycheck timing appears manageable in the first month."}
            </p>
          </div>
        </section>
      </div>

      <section className="section-card mt-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-teal-700" />
          <h2 className="section-title">Month-by-month table</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>{["Period", "Starting cash", "Paychecks", "One-time costs", "Recurring expenses", "Reimbursement", "Ending cash", "Lowest cash", "Risk"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.index}>
                  <td className="px-3 py-3 font-semibold">{row.index === 0 ? "Move-in period" : formatDisplayMonth(row.month)}</td>
                  <td className="px-3 py-3">{usd(row.startingCash)}</td>
                  <td className="px-3 py-3">{row.paychecks} / {usd(row.paycheckIncome)}</td>
                  <td className="px-3 py-3">{usd(row.oneTimeCosts)}</td>
                  <td className="px-3 py-3">{usd(row.recurringExpenses)}</td>
                  <td className="px-3 py-3">{usd(row.reimbursement)}</td>
                  <td className="px-3 py-3 font-semibold">{usd(row.endingCash)}</td>
                  <td className="px-3 py-3">{usd(row.lowestCash)}</td>
                  <td className="px-3 py-3">{row.lowestCash < 0 ? "Risky" : row.lowestCash < form.monthly_rent ? "Tight" : "Okay"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
