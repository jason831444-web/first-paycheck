import { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}

const tones = {
  default: "border-slate-200 bg-white text-slate-950",
  good: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warn: "border-amber-200 bg-amber-50 text-amber-950",
  bad: "border-rose-200 bg-rose-50 text-rose-950",
};

export function SummaryCard({ label, value, tone = "default" }: Props) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
