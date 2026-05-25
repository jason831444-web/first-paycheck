import { ExpenseBreakdownChart } from "@/components/ExpenseBreakdownChart";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
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
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Monthly take-home" value={usd(result.net_monthly)} tone="good" />
        <SummaryCard label="Monthly expenses" value={usd(result.total_expenses)} />
        <SummaryCard label="Monthly leftover" value={usd(result.monthly_leftover)} tone={result.monthly_leftover >= 0 ? "good" : "bad"} />
        <SummaryCard label="Risk level" value={result.risk_level} tone={toneByRisk[result.risk_level]} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Affordability score" value={`${result.affordability_score}/100`} />
        <SummaryCard label="Housing ratio" value={percent(result.housing_ratio)} />
        <SummaryCard label="Savings rate" value={percent(result.savings_rate)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Expense breakdown</h2>
          <ExpenseBreakdownChart data={result.expense_breakdown} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Income vs expenses</h2>
          <IncomeExpenseChart result={result} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Monthly paycheck estimate</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Gross monthly", result.gross_monthly],
              ["Federal tax", -result.federal_tax_monthly],
              ["State tax", -result.state_tax_monthly],
              ["Local/city tax", -result.local_tax_monthly],
              ["FICA", -result.fica_monthly],
              ["401k contribution", -result.contribution_401k_monthly],
              ["Health insurance", -result.health_insurance_monthly],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between border-b border-slate-100 py-2">
                <dt>{label}</dt>
                <dd className="font-medium">{usd(value as number)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-teal-800">
            FICA exemption changes monthly take-home by about {usd(result.fica_exemption_monthly_value)}.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Rent recommendation</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Safe max" value={usd(result.rent_recommendation.safe_max_rent)} tone="good" />
            <SummaryCard label="Stretch max" value={usd(result.rent_recommendation.stretch_max_rent)} tone="warn" />
            <SummaryCard label="Current rent" value={result.rent_recommendation.current_rent_status} />
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-700">{result.recommendation_text}</p>
          {result.notes.map((note) => (
            <p key={note} className="mt-2 text-sm text-amber-700">{note}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
