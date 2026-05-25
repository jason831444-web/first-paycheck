import { Disclaimer } from "@/components/Disclaimer";
import { ScenarioComparison } from "@/components/ScenarioComparison";

export default function ScenariosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Compare locations</h1>
        <p className="mt-2 text-slate-600">See how your monthly leftover changes depending on where you live.</p>
      </div>
      <Disclaimer />
      <div className="mt-6">
        <ScenarioComparison />
      </div>
    </main>
  );
}
