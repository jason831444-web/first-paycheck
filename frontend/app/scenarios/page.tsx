import { Disclaimer } from "@/components/Disclaimer";
import { ScenarioComparison } from "@/components/ScenarioComparison";

export default function ScenariosPage() {
  return (
    <main className="page-shell">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="page-heading">
          <p className="eyebrow">Location comparison</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Compare locations</h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">See where your first paycheck goes further across major U.S. cities.</p>
        </div>
      </div>
      <Disclaimer />
      <div className="mt-6">
        <ScenarioComparison />
      </div>
    </main>
  );
}
