import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Building2, Calculator, CheckCircle2, CircleDollarSign, MapPinned, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { planningToolCards } from "@/lib/toolCards";

const features = [
  {
    title: "Tax-aware take-home pay",
    body: "Estimate federal, FICA, state, and local assumptions in one monthly view.",
    icon: Calculator,
  },
  {
    title: "Rent affordability",
    body: "See housing ratio, savings rate, risk level, and recommended rent ranges.",
    icon: Building2,
  },
  {
    title: "OPT/FICA support",
    body: "Model how F-1/OPT FICA exemption can change monthly take-home pay.",
    icon: ShieldCheck,
  },
  {
    title: "City comparison",
    body: "Compare how your paycheck stretches across major U.S. city presets.",
    icon: MapPinned,
  },
];

const previewRows = [
  ["Brooklyn, NY", "$6,280", "$2,750", "$1,240", "Manageable"],
  ["Austin, TX", "$6,980", "$1,900", "$1,860", "Comfortable"],
  ["Seattle, WA", "$6,980", "$2,550", "$1,420", "Manageable"],
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="grid min-h-[calc(100vh-11rem)] gap-10 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="page-heading">
          <p className="eyebrow">FirstPaycheck</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Plan your first paycheck before you sign the lease.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Estimate take-home pay, compare rent pressure, and see how salary stretches across major U.S. cities.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulator" className="primary-button">
              Start simulation
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/scenarios" className="secondary-button">
              Compare cities
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            {["No account required", "Editable presets", "Built for first job planning"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-700" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="section-card p-4 sm:p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">First job plan</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Monthly snapshot</h2>
              </div>
              <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-100">Estimate</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Take-home</p>
                <p className="mt-2 text-2xl font-semibold">$6,980</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Expenses</p>
                <p className="mt-2 text-2xl font-semibold">$5,120</p>
              </div>
              <div className="rounded-2xl bg-teal-400/15 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-teal-100">Leftover</p>
                <p className="mt-2 text-2xl font-semibold">$1,860</p>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    {["City", "Net", "Rent", "Left", "Risk"].map((heading) => (
                      <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {previewRows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={cell} className={`px-3 py-3 ${index === 0 ? "font-medium text-white" : "text-slate-300"}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="section-card">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-base font-semibold text-slate-950">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="py-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Planning tools</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Decision support for the messy real-life parts</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Move beyond a single calculator result with tools for apartments, job offers, move-in cash, paycheck timing, and savings goals.
            </p>
          </div>
          <Link href="/tools" className="secondary-button shrink-0">
            Explore planning tools
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {planningToolCards.slice(0, 6).map((tool) => (
            <Link key={tool.title} href={tool.href} className="section-card block transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_20px_60px_rgba(15,118,110,0.10)]">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <tool.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-950">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-card">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="section-title">Made for first decisions</h2>
          </div>
          <p className="section-subtitle">
            The goal is clarity before commitment: offer letter, apartment, commute, savings cushion, and whether the plan feels comfortable or tight.
          </p>
        </div>
        <div className="section-card">
          <div className="flex items-center gap-3">
            <BadgeDollarSign className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="section-title">Built as an estimate tool</h2>
          </div>
          <div className="mt-4">
            <Disclaimer />
          </div>
        </div>
      </section>
    </main>
  );
}
