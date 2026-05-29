"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Save } from "lucide-react";
import { ResultDashboard } from "@/components/ResultDashboard";
import { SimulatorSectionManager } from "@/components/SimulatorSectionManager";
import { api } from "@/lib/api";
import {
  OptionalSectionId,
  buildSimulationInputFromSections,
  simulatorDefaults,
  SimulatorFormState,
} from "@/lib/simulatorSections";
import { SimulationInput, SimulationResult } from "@/types/simulation";

export default function SimulatorPage() {
  const [form, setForm] = useState<SimulatorFormState>(simulatorDefaults);
  const [activeOptionalSections, setActiveOptionalSections] = useState<OptionalSectionId[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState<SimulationInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<SimulatorFormState>) => setForm((current) => ({ ...current, ...patch }));
  const simulationInput = buildSimulationInputFromSections(form, activeOptionalSections);

  const addSection = (sectionId: OptionalSectionId) => {
    setActiveOptionalSections((current) => (current.includes(sectionId) ? current : [...current, sectionId]));
  };

  const removeSection = (sectionId: OptionalSectionId) => {
    setActiveOptionalSections((current) => current.filter((activeSectionId) => activeSectionId !== sectionId));
  };

  const resetOptionalSections = () => {
    setActiveOptionalSections([]);
    setResult(null);
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nextResult = await api.simulate(simulationInput);
      setResult(nextResult);
      setSubmittedInput(simulationInput);
    } catch {
      setError("Simulation failed. Confirm the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScenario() {
    setError("");
    try {
      await api.saveScenario(simulationInput);
    } catch {
      setError("Could not save this scenario. The simulator result is still usable.");
    }
  }

  return (
    <main className="page-shell max-w-[1480px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">Simulator</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Build your first-job budget</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Choose the sections that apply to your life. Only checked sections are included in your estimate.
          </p>
        </div>
        <p className="max-w-xs rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-500">
          Estimates are for planning only and are not tax, legal, or financial advice.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <SimulatorSectionManager
          form={form}
          activeOptionalSections={activeOptionalSections}
          update={update}
          addSection={addSection}
          removeSection={removeSection}
          resetOptionalSections={resetOptionalSections}
        />
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
        <div className="section-card mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Ready to model this plan?</h2>
            <p className="section-subtitle">Run the estimate first, then save the scenario if it is useful.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button disabled={loading} className="primary-button">
              {loading ? "Calculating..." : "Run simulation"}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={saveScenario} className="secondary-button">
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
              Save scenario
            </button>
          </div>
        </div>
      </form>
      {result ? (
        <div className="mt-8">
          <ResultDashboard input={submittedInput ?? simulationInput} result={result} />
        </div>
      ) : null}
    </main>
  );
}
