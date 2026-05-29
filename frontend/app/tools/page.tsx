import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { planningToolCards } from "@/lib/toolCards";

export default function ToolsPage() {
  return (
    <main className="page-shell">
      <section className="grid gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="eyebrow">Tools</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Planning tools</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Use focused tools to compare apartments, job offers, paycheck timing, move-in costs, and budget goals.
          </p>
        </div>
        <div className="section-card bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-400/15 text-teal-100">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Start with the decision in front of you.</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Each tool is built for one practical question: rent, timing, cash, goals, cities, or offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {planningToolCards.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="section-card group flex min-h-[260px] flex-col transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_20px_60px_rgba(15,118,110,0.10)]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <tool.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {tool.category}
              </span>
            </div>
            <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{tool.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{tool.description}</p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-teal-700">
              {tool.cta}
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-teal-100 bg-teal-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-teal-700" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-slate-950">Need the full budget view?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Run the simulator first, then use these tools to pressure-test real decisions.
              </p>
            </div>
          </div>
          <Link href="/simulator" className="primary-button shrink-0">
            Start simulation
          </Link>
        </div>
      </section>
    </main>
  );
}
