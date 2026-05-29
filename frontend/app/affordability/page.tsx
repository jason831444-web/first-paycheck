import { AffordabilityChecker } from "@/components/AffordabilityChecker";

export default function AffordabilityPage() {
  return (
    <main className="page-shell">
      <div className="mb-6 max-w-3xl">
        <p className="eyebrow">Affordability check</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Can I afford this apartment?</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">
          Check whether a rent price fits your estimated take-home pay, transportation costs, and first-job budget.
        </p>
      </div>
      <AffordabilityChecker />
    </main>
  );
}
