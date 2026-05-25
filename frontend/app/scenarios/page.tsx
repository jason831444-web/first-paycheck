import { Disclaimer } from "@/components/Disclaimer";
import { ScenarioComparison } from "@/components/ScenarioComparison";

export default function ScenariosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">NYC vs NJ scenarios</h1>
        <p className="mt-2 text-slate-600">Compare common first-apartment choices using the same salary assumptions.</p>
      </div>
      <Disclaimer />
      <div className="mt-6">
        <ScenarioComparison />
      </div>
    </main>
  );
}
