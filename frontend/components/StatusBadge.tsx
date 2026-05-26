import { RiskLevel } from "@/types/simulation";

const riskStyles: Record<RiskLevel, string> = {
  Comfortable: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Manageable: "border-sky-200 bg-sky-50 text-sky-800",
  Tight: "border-amber-200 bg-amber-50 text-amber-800",
  Risky: "border-rose-200 bg-rose-50 text-rose-800",
};

export function StatusBadge({ status }: { status: RiskLevel | string }) {
  const tone = riskStyles[status as RiskLevel] ?? "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}
