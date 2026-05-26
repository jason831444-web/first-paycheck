import { ExpenseBreakdownChart } from "@/components/ExpenseBreakdownChart";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { StatusBadge } from "@/components/StatusBadge";
import { SummaryCard } from "@/components/SummaryCard";
import { percent, usd } from "@/lib/formatters";
import { SimulationResult } from "@/types/simulation";

const toneByRisk = {
  Comfortable: "good",
  Manageable: "default",
  Tight: "warn",
  Risky: "bad",
} as const;

export function ResultDashboard({ result }: { result: SimulationResult }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Results</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Monthly financial picture</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A planning estimate for income, spending pressure, and savings cushion.</p>
        </div>
        <StatusBadge status={result.risk_level} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Take-home pay" value={usd(result.net_monthly)} caption="Estimated net monthly income" tone="good" />
        <SummaryCard label="Monthly expenses" value={usd(result.total_expenses)} caption="Housing, food, transport, lifestyle" />
        <SummaryCard label="Monthly leftover" value={usd(result.monthly_leftover)} caption="Estimated monthly cushion" tone={result.monthly_leftover >= 0 ? "good" : "bad"} />
        <SummaryCard label="Affordability score" value={`${result.affordability_score}/100`} caption={<StatusBadge status={result.risk_level} />} tone={toneByRisk[result.risk_level]} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Housing ratio" value={percent(result.housing_ratio)} caption="Housing cost divided by take-home pay" />
        <SummaryCard label="Savings rate" value={percent(result.savings_rate)} caption="Leftover divided by take-home pay" />
        <SummaryCard label="FICA exemption value" value={usd(result.fica_exemption_monthly_value)} caption="Monthly change when FICA exempt" />
      </div>

      <div className="section-card border-teal-100 bg-teal-50/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow text-teal-800">Advisor insight</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{result.risk_level} plan</h3>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">{result.recommendation_text}</p>
          </div>
          <StatusBadge status={result.risk_level} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="section-card">
          <h2 className="section-title">Expense breakdown</h2>
          <p className="section-subtitle">Share of spending by category.</p>
          <ExpenseBreakdownChart data={result.expense_breakdown} />
        </div>
        <div className="section-card">
          <h2 className="section-title">Income vs expenses</h2>
          <p className="section-subtitle">Net income, spending, and leftover cash.</p>
          <IncomeExpenseChart result={result} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="section-card">
          <h2 className="section-title">Monthly paycheck estimate</h2>
          <p className="section-subtitle">Approximate deductions from gross monthly salary.</p>
          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            {[
              ["Gross monthly", result.gross_monthly],
              ["Federal tax", -result.federal_tax_monthly],
              ["State tax", -result.state_tax_monthly],
              ["Local/city tax", -result.local_tax_monthly],
              ["FICA", -result.fica_monthly],
              ["401k contribution", -result.contribution_401k_monthly],
              ["Health insurance", -result.health_insurance_monthly],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4 py-3">
                <dt className="text-slate-600">{label}</dt>
                <dd className="font-semibold tabular-nums text-slate-950">{usd(value as number)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">
            FICA exemption changes monthly take-home by about {usd(result.fica_exemption_monthly_value)}.
          </p>
        </div>

        <div className="section-card">
          <h2 className="section-title">Rent recommendation</h2>
          <p className="section-subtitle">Recommended rent ranges based on estimated take-home pay.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="soft-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Safe max</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{usd(result.rent_recommendation.safe_max_rent)}</p>
            </div>
            <div className="soft-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Stretch max</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{usd(result.rent_recommendation.stretch_max_rent)}</p>
            </div>
            <div className="soft-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Current rent</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{result.rent_recommendation.current_rent_status}</p>
            </div>
          </div>
          {result.notes.map((note) => (
            <p key={note} className="mt-3 text-sm leading-6 text-amber-700">{note}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
