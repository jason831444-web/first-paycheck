"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { usd } from "@/lib/formatters";
import { addMonths, formatDisplayMonth, lastDayOfMonth } from "@/lib/planningTools";

interface Bill {
  id: string;
  name: string;
  amount: number;
  due_day: number;
}

interface CalendarForm {
  pay_frequency: "biweekly" | "semi_monthly" | "monthly";
  first_paycheck_date: string;
  net_paycheck_amount: number;
  rent_due_day: number;
  rent_amount: number;
  months: number;
}

const defaultForm: CalendarForm = {
  pay_frequency: "biweekly",
  first_paycheck_date: "2026-06-12",
  net_paycheck_amount: 3200,
  rent_due_day: 1,
  rent_amount: 2400,
  months: 6,
};

const defaultBills: Bill[] = [
  { id: "bill-1", name: "Utilities", amount: 160, due_day: 10 },
  { id: "bill-2", name: "Internet", amount: 70, due_day: 15 },
  { id: "bill-3", name: "Phone", amount: 65, due_day: 20 },
];

function Field({ label, value, onChange, type = "number" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function payDatesForMonth(form: CalendarForm, month: Date) {
  const first = new Date(`${form.first_paycheck_date}T12:00:00`);
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  if (form.pay_frequency === "monthly") {
    const day = Math.min(first.getDate(), lastDayOfMonth(month.getFullYear(), month.getMonth()));
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date >= first ? [date] : [];
  }

  if (form.pay_frequency === "semi_monthly") {
    return [new Date(month.getFullYear(), month.getMonth(), 15), new Date(month.getFullYear(), month.getMonth(), lastDayOfMonth(month.getFullYear(), month.getMonth()))].filter((date) => date >= first);
  }

  const dates: Date[] = [];
  const cursor = new Date(first);
  while (cursor <= end) {
    if (cursor >= start) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 14);
  }
  return dates;
}

export default function PaycheckCalendarPage() {
  const [form, setForm] = useState(defaultForm);
  const [bills, setBills] = useState(defaultBills);
  const update = (patch: Partial<CalendarForm>) => setForm((current) => ({ ...current, ...patch }));
  const months = useMemo(() => {
    const first = new Date(`${form.first_paycheck_date}T12:00:00`);
    return Array.from({ length: form.months }).map((_, index) => {
      const month = addMonths(first, index);
      const payDates = payDatesForMonth(form, month);
      const paycheckIncome = payDates.length * form.net_paycheck_amount;
      const billsTotal = bills.reduce((sum, bill) => sum + bill.amount, 0) + form.rent_amount;
      const firstPayDate = payDates[0]?.getDate() ?? 99;
      const rentBeforePaycheck = form.rent_due_day < firstPayDate;
      const recommendedBuffer = rentBeforePaycheck ? form.rent_amount + bills.filter((bill) => bill.due_day < firstPayDate).reduce((sum, bill) => sum + bill.amount, 0) : Math.max(form.rent_amount, billsTotal - paycheckIncome);
      return {
        month,
        payDates,
        paycheckIncome,
        billsTotal,
        rentBeforePaycheck,
        recommendedBuffer: Math.max(recommendedBuffer, 0),
        isThreePaycheckMonth: form.pay_frequency === "biweekly" && payDates.length === 3,
      };
    });
  }, [form, bills]);
  const maxBuffer = Math.max(...months.map((month) => month.recommendedBuffer));

  function updateBill(id: string, patch: Partial<Bill>) {
    setBills((current) => current.map((bill) => (bill.id === id ? { ...bill, ...patch } : bill)));
  }

  return (
    <main className="page-shell max-w-7xl">
      <div className="mb-6">
        <p className="eyebrow">Paycheck calendar</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Paycheck calendar</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Plan around rent, bills, and two-paycheck or three-paycheck months.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="section-card">
          <h2 className="section-title">Paycheck setup</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label><span className="field-label">Pay frequency</span><select className="field-input" value={form.pay_frequency} onChange={(event) => update({ pay_frequency: event.target.value as CalendarForm["pay_frequency"] })}><option value="biweekly">Biweekly</option><option value="semi_monthly">Semi-monthly</option><option value="monthly">Monthly</option></select></label>
            <Field label="First paycheck date" type="date" value={form.first_paycheck_date} onChange={(value) => update({ first_paycheck_date: value })} />
            <Field label="Net paycheck amount" value={form.net_paycheck_amount} onChange={(value) => update({ net_paycheck_amount: Number(value) })} />
            <Field label="Rent due day" value={form.rent_due_day} onChange={(value) => update({ rent_due_day: Number(value) })} />
            <Field label="Rent amount" value={form.rent_amount} onChange={(value) => update({ rent_amount: Number(value) })} />
            <Field label="Simulation months" value={form.months} onChange={(value) => update({ months: Math.max(1, Number(value)) })} />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Recurring bills</h3>
            <button className="secondary-button px-3 py-2" type="button" onClick={() => setBills((current) => [...current, { id: `bill-${Date.now()}`, name: "New bill", amount: 50, due_day: 15 }])}><Plus className="mr-2 h-4 w-4" /> Add bill</button>
          </div>
          <div className="mt-3 space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_120px_100px_auto]">
                <input className="field-input mt-0" value={bill.name} onChange={(event) => updateBill(bill.id, { name: event.target.value })} />
                <input className="field-input mt-0" type="number" value={bill.amount} onChange={(event) => updateBill(bill.id, { amount: Number(event.target.value) })} />
                <input className="field-input mt-0" type="number" value={bill.due_day} onChange={(event) => updateBill(bill.id, { due_day: Number(event.target.value) })} />
                <button className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" type="button" onClick={() => setBills((current) => current.filter((item) => item.id !== bill.id))}><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-teal-700" />
            <h2 className="section-title">Timing insights</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="soft-panel"><p className="text-xs text-slate-500">Recommended buffer</p><p className="mt-2 text-2xl font-semibold">{usd(maxBuffer)}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">3-paycheck months</p><p className="mt-2 text-2xl font-semibold">{months.filter((month) => month.isThreePaycheckMonth).length}</p></div>
            <div className="soft-panel"><p className="text-xs text-slate-500">Rent timing warnings</p><p className="mt-2 text-2xl font-semibold">{months.filter((month) => month.rentBeforePaycheck).length}</p></div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {months.filter((month) => month.isThreePaycheckMonth || month.rentBeforePaycheck).slice(0, 4).map((month) => (
              <p key={month.month.toISOString()} className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-900">
                {month.isThreePaycheckMonth ? `${formatDisplayMonth(month.month)} has 3 paychecks. ` : ""}
                {month.rentBeforePaycheck ? `Rent is due before your first paycheck this month; keep at least ${usd(month.recommendedBuffer)} available before the 1st.` : ""}
              </p>
            ))}
          </div>
        </section>
      </div>

      <section className="section-card mt-5">
        <h2 className="section-title">Month-by-month paycheck table</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500"><tr>{["Month", "Paychecks", "Paycheck income", "Bills + rent", "Timing warning", "Minimum buffer"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {months.map((month) => (
                <tr key={month.month.toISOString()}>
                  <td className="px-3 py-3 font-semibold">{formatDisplayMonth(month.month)}</td>
                  <td className="px-3 py-3">{month.payDates.length} {month.isThreePaycheckMonth ? "(3-paycheck month)" : ""}</td>
                  <td className="px-3 py-3">{usd(month.paycheckIncome)}</td>
                  <td className="px-3 py-3">{usd(month.billsTotal)}</td>
                  <td className="px-3 py-3">{month.rentBeforePaycheck ? "Rent due before first paycheck" : "No major timing issue"}</td>
                  <td className="px-3 py-3 font-semibold">{usd(month.recommendedBuffer)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
