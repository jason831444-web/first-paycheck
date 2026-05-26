import { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}

const tones = {
  default: "border-slate-200/80 bg-white text-slate-950",
  good: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950",
  warn: "border-amber-200/80 bg-amber-50/80 text-amber-950",
  bad: "border-rose-200/80 bg-rose-50/80 text-rose-950",
};

export function SummaryCard({ label, value, caption, tone = "default" }: Props) {
  return (
    <div className={`rounded-2xl border p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)] ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      {caption ? <p className="mt-2 text-sm leading-5 text-slate-500">{caption}</p> : null}
    </div>
  );
}
