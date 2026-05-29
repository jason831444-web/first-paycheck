"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AdvisorInsights } from "@/components/AdvisorInsights";
import { ResultDashboard } from "@/components/ResultDashboard";
import { SimulatorSectionManager } from "@/components/SimulatorSectionManager";
import { WhatIfAnalysis } from "@/components/WhatIfAnalysis";
import { api } from "@/lib/api";
import {
  OptionalSectionId,
  buildSimulationInputFromSections,
  optionalSectionIds,
  simulatorDefaults,
  SimulatorFormState,
} from "@/lib/simulatorSections";
import { SavedScenario, SimulationInput, SimulationResult } from "@/types/simulation";

const optionalSectionIdSet = new Set<string>(optionalSectionIds);

function resultFromSavedScenario(plan: SavedScenario, input: SimulationInput): SimulationResult | null {
  if (plan.result_data?.net_monthly !== undefined && plan.result_data.risk_level) {
    return plan.result_data as SimulationResult;
  }

  if (!plan.result) return null;

  return {
    gross_monthly: plan.result.gross_monthly,
    federal_tax_monthly: plan.result.federal_tax_monthly,
    state_tax_monthly: plan.result.state_tax_monthly,
    local_tax_monthly: plan.result.local_tax_monthly,
    fica_monthly: plan.result.fica_monthly,
    fica_exemption_monthly_value: 0,
    contribution_401k_monthly: plan.result.contribution_401k_monthly,
    health_insurance_monthly: plan.result.health_insurance_monthly,
    net_monthly: plan.result.net_monthly,
    total_expenses: plan.result.total_expenses,
    monthly_leftover: plan.result.monthly_leftover,
    savings_rate: plan.result.savings_rate,
    housing_ratio: plan.result.housing_ratio,
    transportation_ratio: plan.result.transportation_ratio,
    affordability_score: plan.result.affordability_score,
    risk_level: plan.result.risk_level,
    recommendation_text: plan.result.recommendation_text,
    rent_recommendation: {
      safe_max_rent: Math.round(plan.result.net_monthly * 0.3 * 100) / 100,
      stretch_max_rent: Math.round(plan.result.net_monthly * 0.35 * 100) / 100,
      current_rent_status: "Saved",
    },
    expense_breakdown: {
      housing: input.rent + input.utilities + input.internet,
      food: input.groceries + input.eating_out,
      transportation: input.transit_cost + input.car_payment + input.car_insurance + input.gas + input.parking + input.tolls,
      lifestyle: input.subscriptions + input.gym + input.personal_spending,
      other: input.other_expenses,
    },
    notes: [],
    tax_assumption_notes: [],
  };
}

function formStateFromSavedScenario(plan: SavedScenario): SimulatorFormState {
  return {
    ...simulatorDefaults,
    ...plan,
    ...(plan.section_values ?? {}),
    custom_expenses: Array.isArray(plan.custom_expenses)
      ? plan.custom_expenses.map((row, index) => ({
          id: String(row.id ?? `custom-${index}`),
          name: String(row.name ?? ""),
          amount: Number(row.amount ?? 0),
        }))
      : simulatorDefaults.custom_expenses,
  } as SimulatorFormState;
}

export default function SimulatorPage() {
  const [form, setForm] = useState<SimulatorFormState>(simulatorDefaults);
  const [activeOptionalSections, setActiveOptionalSections] = useState<OptionalSectionId[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [submittedInput, setSubmittedInput] = useState<SimulationInput | null>(null);
  const [submittedForm, setSubmittedForm] = useState<SimulatorFormState | null>(null);
  const [submittedSections, setSubmittedSections] = useState<OptionalSectionId[]>([]);
  const [saveName, setSaveName] = useState("My first-job budget");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<SimulatorFormState>) => setForm((current) => ({ ...current, ...patch }));
  const simulationInput = buildSimulationInputFromSections(form, activeOptionalSections);
  const currentSubmittedInput = submittedInput ?? simulationInput;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const scenarioId = searchParams.get("savedScenarioId");
    if (!scenarioId) return;

    async function loadSavedScenario() {
      setError("");
      try {
        const plan = await api.getScenario(Number(scenarioId));
        const restoredForm = formStateFromSavedScenario(plan);
        const restoredSections = (plan.active_sections ?? []).filter((sectionId): sectionId is OptionalSectionId => optionalSectionIdSet.has(sectionId));
        const restoredInput = (plan.mapped_input ? { ...plan.mapped_input, name: plan.name } : buildSimulationInputFromSections(restoredForm, restoredSections)) as SimulationInput;
        setForm(restoredForm);
        setActiveOptionalSections(restoredSections);
        setSubmittedInput(restoredInput);
        setSubmittedForm(restoredForm);
        setSubmittedSections(restoredSections);
        setResult(resultFromSavedScenario(plan, restoredInput));
        setSaveName(plan.name ?? "My first-job budget");
      } catch {
        setError("Could not load this saved budget plan.");
      }
    }

    void loadSavedScenario();
  }, []);

  const addSection = (sectionId: OptionalSectionId) => {
    setActiveOptionalSections((current) => (current.includes(sectionId) ? current : [...current, sectionId]));
  };

  const removeSection = (sectionId: OptionalSectionId) => {
    setActiveOptionalSections((current) => current.filter((activeSectionId) => activeSectionId !== sectionId));
  };

  const resetOptionalSections = () => {
    setActiveOptionalSections([]);
    setResult(null);
    setSubmittedInput(null);
    setSubmittedForm(null);
    setSubmittedSections([]);
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nextResult = await api.simulate(simulationInput);
      setResult(nextResult);
      setSubmittedInput(simulationInput);
      setSubmittedForm(form);
      setSubmittedSections(activeOptionalSections);
      setSaveName(`${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 }).format(simulationInput.annual_salary)} in ${simulationInput.residence_location}`);
      setShowSaveForm(false);
      setSaveMessage("");
    } catch {
      setError("Simulation failed. Confirm the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveBudgetPlan(event?: FormEvent) {
    event?.preventDefault();
    if (!result || !submittedInput) return;
    setError("");
    setSaveMessage("");
    setSaving(true);
    try {
      const stateToSave = submittedForm ?? form;
      const sectionsToSave = submittedSections.length ? submittedSections : activeOptionalSections;
      await api.createScenario({
        ...submittedInput,
        name: saveName.trim() || "My first-job budget",
        active_sections: sectionsToSave,
        section_values: stateToSave as unknown as Record<string, unknown>,
        custom_expenses: stateToSave.custom_expenses as unknown as Record<string, unknown>[],
        mapped_input: submittedInput,
        result_data: result,
      });
      setSaveMessage("Budget plan saved.");
      setShowSaveForm(false);
    } catch {
      setError("Could not save this budget plan. The simulator result is still usable.");
    } finally {
      setSaving(false);
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
          </div>
        </div>
        {showSaveForm && result ? (
          <div className="section-card mx-auto max-w-[1380px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="field-label">Budget plan name</span>
                <input className="field-input" value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="My first-job budget" />
              </label>
              <button type="button" onClick={() => void saveBudgetPlan()} disabled={saving} className="primary-button">
                {saving ? "Saving..." : "Save budget plan"}
              </button>
            </div>
          </div>
        ) : null}
        {saveMessage ? <p className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{saveMessage}</p> : null}
      </form>
      {result ? (
        <div className="mt-8 space-y-6">
          <ResultDashboard input={currentSubmittedInput} result={result} saving={saving} onSaveBudgetPlan={() => setShowSaveForm((current) => !current)} />
          <AdvisorInsights input={currentSubmittedInput} result={result} />
          <WhatIfAnalysis input={currentSubmittedInput} baseResult={result} />
        </div>
      ) : null}
    </main>
  );
}
