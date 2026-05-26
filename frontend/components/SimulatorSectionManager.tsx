"use client";

import type { ReactNode } from "react";
import { Check, Lock, Plus, Trash2 } from "lucide-react";
import { NumberField } from "@/components/SalaryForm";
import {
  OptionalSectionId,
  SimulatorFormState,
  SimulatorSectionId,
  amortizedMonthlyTotal,
  backendMappedMonthlyExpenses,
  buildSimulationInputFromSections,
  customMonthlyAmount,
  immigrationMonthlyAmount,
  moveInMonthlyAmount,
  optionalSectionGroups,
  relocationMonthlyAmount,
  requiredSectionIds,
  sectionById,
  sectionMonthlyAmount,
  taxFilingMonthlyAmount,
} from "@/lib/simulatorSections";
import { SimulationInput } from "@/types/simulation";

interface Props {
  form: SimulatorFormState;
  activeOptionalSections: OptionalSectionId[];
  update: (patch: Partial<SimulatorFormState>) => void;
  addSection: (sectionId: OptionalSectionId) => void;
  removeSection: (sectionId: OptionalSectionId) => void;
  resetOptionalSections: () => void;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type NumericKey = {
  [Key in keyof SimulatorFormState]-?: SimulatorFormState[Key] extends number ? Key : never;
}[keyof SimulatorFormState];

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <select className="field-input" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormSectionCard({ sectionId, children, note }: { sectionId: SimulatorSectionId; children: ReactNode; note?: ReactNode }) {
  const section = sectionById[sectionId];

  return (
    <section className="section-card scroll-mt-24" aria-labelledby={`${sectionId}-title`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{section.required ? "Required" : section.group}</p>
          <h2 id={`${sectionId}-title`} className="section-title">
            {section.title}
          </h2>
          <p className="section-subtitle">{section.description}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          {section.required ? "Locked" : "Checked"}
        </span>
      </div>
      {note ? <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950">{note}</div> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function FieldGrid({
  fields,
  form,
  update,
}: {
  fields: { key: NumericKey; label: string; helper?: string }[];
  form: SimulatorFormState;
  update: (patch: Partial<SimulatorFormState>) => void;
}) {
  return (
    <>
      {fields.map((field) => (
        <NumberField
          key={field.key}
          label={field.label}
          value={form[field.key] as number}
          onChange={(value) => update({ [field.key]: value } as Partial<SimulatorFormState>)}
          helper={field.helper}
        />
      ))}
    </>
  );
}

function SectionChecklist({
  activeOptionalSections,
  addSection,
  removeSection,
}: {
  activeOptionalSections: OptionalSectionId[];
  addSection: (sectionId: OptionalSectionId) => void;
  removeSection: (sectionId: OptionalSectionId) => void;
}) {
  const active = new Set(activeOptionalSections);

  return (
    <aside className="section-card h-fit lg:sticky lg:top-24">
      <p className="eyebrow">Control panel</p>
      <h2 className="section-title">Budget sections</h2>
      <p className="section-subtitle">Check the categories you want to include.</p>

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Required basics</p>
          <div className="space-y-2">
            {requiredSectionIds.map((sectionId) => (
              <label key={sectionId} className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/80 px-3 py-2.5 text-sm font-medium text-slate-800">
                <input className="h-4 w-4 rounded border-teal-300 text-teal-700" type="checkbox" checked disabled readOnly />
                <span className="min-w-0 flex-1">{sectionById[sectionId].title}</span>
                <Lock className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              </label>
            ))}
          </div>
        </div>

        {optionalSectionGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{group.title}</p>
            <div className="space-y-2">
              {group.sections.map((section) => {
                const checked = active.has(section.id as OptionalSectionId);
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => {
                      checked ? removeSection(section.id as OptionalSectionId) : addSection(section.id as OptionalSectionId);
                    }}
                    className={[
                      "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                      checked ? "border-teal-200 bg-teal-50/80 text-slate-950 shadow-sm" : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <input
                      className="pointer-events-none mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700"
                      type="checkbox"
                      checked={checked}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 leading-5">{section.title}</span>
                    {checked ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function BudgetSummary({
  form,
  activeOptionalSections,
  resetOptionalSections,
}: {
  form: SimulatorFormState;
  activeOptionalSections: OptionalSectionId[];
  resetOptionalSections: () => void;
}) {
  const simulationInput = buildSimulationInputFromSections(form, activeOptionalSections);
  const optionalTotal = activeOptionalSections.reduce((total, sectionId) => total + sectionMonthlyAmount(sectionId, form, activeOptionalSections), 0);
  const amortizedTotal = amortizedMonthlyTotal(form, activeOptionalSections);

  return (
    <aside className="section-card h-fit lg:sticky lg:top-24">
      <p className="eyebrow">Live snapshot</p>
      <h2 className="section-title">Simulation summary</h2>
      <p className="section-subtitle">Only checked sections are included.</p>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Required basics</span>
          <span className="font-semibold text-slate-950">3/3 locked</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Optional selected</span>
          <span className="font-semibold text-slate-950">{activeOptionalSections.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Optional monthly</span>
          <span className="font-semibold text-slate-950">{usd.format(optionalTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Amortized one-time</span>
          <span className="font-semibold text-slate-950">{usd.format(amortizedTotal)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-slate-600">Mapped monthly expenses</span>
          <span className="font-semibold text-slate-950">{usd.format(backendMappedMonthlyExpenses(simulationInput))}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[...requiredSectionIds, ...activeOptionalSections].map((sectionId) => (
          <span key={sectionId} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {sectionById[sectionId].title}
          </span>
        ))}
      </div>

      <button type="button" onClick={resetOptionalSections} className="secondary-button mt-5 w-full">
        Reset optional sections
      </button>
    </aside>
  );
}

function CustomExpenseRows({ form, update }: { form: SimulatorFormState; update: (patch: Partial<SimulatorFormState>) => void }) {
  const rows = form.custom_expenses;

  const updateRow = (id: string, patch: Partial<(typeof rows)[number]>) => {
    update({ custom_expenses: rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  };

  const removeRow = (id: string) => {
    update({ custom_expenses: rows.filter((row) => row.id !== id) });
  };

  const addRow = () => {
    update({ custom_expenses: [...rows, { id: crypto.randomUUID(), name: "", amount: 0 }] });
  };

  return (
    <div className="col-span-full space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-[1fr_180px_auto]">
          <label>
            <span className="field-label">Expense name</span>
            <input className="field-input" value={row.name} onChange={(event) => updateRow(row.id, { name: event.target.value })} placeholder="Pet rent, therapy, software..." />
          </label>
          <NumberField label="Monthly amount" value={row.amount} onChange={(amount) => updateRow(row.id, { amount })} />
          <button type="button" onClick={() => removeRow(row.id)} className="secondary-button self-end px-3 py-2" aria-label="Remove custom expense">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={addRow} className="secondary-button">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add custom expense
        </button>
        <span className="text-sm font-medium text-slate-600">Custom total: {usd.format(customMonthlyAmount(form))}/mo</span>
      </div>
    </div>
  );
}

export function SimulatorSectionManager({
  form,
  activeOptionalSections,
  update,
  addSection,
  removeSection,
  resetOptionalSections,
}: Props) {
  const active = new Set(activeOptionalSections);
  const updateSimulation = (patch: Partial<SimulationInput>) => update(patch as Partial<SimulatorFormState>);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,820px)_280px] lg:items-start">
      <SectionChecklist activeOptionalSections={activeOptionalSections} addSection={addSection} removeSection={removeSection} />

      <div className="min-w-0 space-y-5">
        <FormSectionCard sectionId="income">
          <NumberField label="Annual salary" value={form.annual_salary} onChange={(annual_salary) => update({ annual_salary })} helper="Use gross base salary before taxes." />
          <SelectField
            label="Pay frequency"
            value={form.pay_frequency}
            onChange={(pay_frequency) => updateSimulation({ pay_frequency })}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "semi_monthly", label: "Semi-monthly" },
              { value: "biweekly", label: "Biweekly" },
            ]}
          />
          <NumberField label="Tax year" value={form.tax_year} onChange={(tax_year) => update({ tax_year })} />
          <SelectField label="Filing status" value={form.filing_status} onChange={() => update({ filing_status: "single" })} options={[{ value: "single", label: "Single" }]} />
        </FormSectionCard>

        <FormSectionCard sectionId="tax">
          <SelectField
            label="Work state"
            value={form.work_state}
            onChange={(work_state) => update({ work_state })}
            options={[
              { value: "NY", label: "NY" },
              { value: "NJ", label: "NJ" },
            ]}
          />
          <SelectField
            label="Residence location"
            value={form.residence_location}
            onChange={(residence_location) => update({ residence_location })}
            options={["Manhattan", "Brooklyn", "Jersey City", "Hoboken", "NJ Suburb"].map((location) => ({ value: location, label: location }))}
          />
          <label className="flex min-h-[4.75rem] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <input
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-100"
              type="checkbox"
              checked={form.fica_exempt}
              onChange={(event) => update({ fica_exempt: event.target.checked })}
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">OPT/F-1 FICA exemption</span>
              <span className="block text-xs text-slate-500">Set FICA to $0 when eligible.</span>
            </span>
          </label>
          <NumberField label="401k contribution percentage" value={form.contribution_401k_percent} onChange={(contribution_401k_percent) => update({ contribution_401k_percent })} />
          <NumberField label="Health insurance monthly premium" value={form.health_insurance_monthly} onChange={(health_insurance_monthly) => update({ health_insurance_monthly })} />
        </FormSectionCard>

        <FormSectionCard
          sectionId="housing"
          note={active.has("utilities_home") ? "Utilities and home is checked, so this Housing section includes rent only to avoid double-counting." : null}
        >
          <NumberField label="Rent" value={form.rent} onChange={(rent) => update({ rent })} />
          {!active.has("utilities_home") ? (
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "utilities", label: "Utilities" },
                { key: "internet", label: "Internet" },
                { key: "renter_insurance", label: "Renter's insurance" },
                { key: "laundry", label: "Laundry" },
              ]}
            />
          ) : null}
        </FormSectionCard>

        {!activeOptionalSections.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-600">
            Add optional sections from the left to make your estimate more realistic.
          </div>
        ) : null}

        {active.has("utilities_home") ? (
          <FormSectionCard sectionId="utilities_home">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "electricity", label: "Electricity" },
                { key: "gas_utility", label: "Gas utility" },
                { key: "water", label: "Water" },
                { key: "internet", label: "Internet" },
                { key: "laundry", label: "Laundry" },
                { key: "renter_insurance", label: "Renter's insurance" },
                { key: "home_supplies", label: "Home supplies" },
                { key: "cleaning_supplies", label: "Cleaning supplies" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("transportation") ? (
          <FormSectionCard sectionId="transportation">
            <SelectField
              label="Transportation type"
              value={form.transportation_type}
              onChange={(transportation_type) => updateSimulation({ transportation_type })}
              options={[
                { value: "public_transit", label: "Public transit" },
                { value: "car", label: "Car" },
                { value: "hybrid", label: "Hybrid" },
              ]}
            />
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "transit_cost", label: "Public transit cost" },
                { key: "rideshare_budget", label: "Rideshare / Uber budget" },
                { key: "commute_pass", label: "Commute pass" },
                { key: "commute_parking", label: "Parking if applicable" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("car") ? (
          <FormSectionCard sectionId="car">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "car_payment", label: "Car payment / lease" },
                { key: "car_insurance", label: "Car insurance" },
                { key: "gas", label: "Gas" },
                { key: "car_maintenance", label: "Maintenance" },
                { key: "tolls", label: "Tolls" },
                { key: "car_parking", label: "Parking" },
                { key: "car_registration", label: "Registration / inspection monthly estimate" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("food") ? (
          <FormSectionCard sectionId="food">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "groceries", label: "Groceries" },
                { key: "eating_out", label: "Eating out" },
                { key: "delivery", label: "Delivery" },
                { key: "coffee", label: "Coffee" },
                { key: "protein_supplements", label: "Protein / supplements" },
                { key: "meal_prep", label: "Meal prep / bulk grocery estimate" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("subscriptions") ? (
          <FormSectionCard sectionId="subscriptions">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "phone", label: "Phone" },
                { key: "subscriptions", label: "Subscriptions" },
                { key: "streaming", label: "Streaming" },
                { key: "cloud_software", label: "Cloud/software tools" },
                { key: "gym", label: "Gym" },
                { key: "memberships", label: "Memberships" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("lifestyle") ? (
          <FormSectionCard sectionId="lifestyle">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "personal_spending", label: "Personal spending" },
                { key: "clothing", label: "Clothing" },
                { key: "grooming", label: "Haircut / grooming" },
                { key: "entertainment", label: "Entertainment" },
                { key: "dating_social", label: "Dating / social budget" },
                { key: "gifts", label: "Gifts" },
                { key: "miscellaneous", label: "Miscellaneous" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("healthcare") ? (
          <FormSectionCard sectionId="healthcare" note="This is separate from your payroll health insurance premium.">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "doctor_visits_reserve", label: "Doctor visits monthly reserve" },
                { key: "prescriptions", label: "Prescriptions" },
                { key: "therapy_counseling", label: "Therapy / counseling" },
                { key: "urgent_care_reserve", label: "Urgent care reserve" },
                { key: "medical_buffer", label: "Medical out-of-pocket buffer" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("insurance") ? (
          <FormSectionCard sectionId="insurance" note={active.has("utilities_home") ? "Renter's insurance is already handled in Utilities and home, so it is not counted again here." : null}>
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "dental_insurance", label: "Dental insurance" },
                { key: "vision_insurance", label: "Vision insurance" },
                ...(active.has("utilities_home") ? [] : [{ key: "insurance_renters" as NumericKey, label: "Renter's insurance" }]),
                { key: "life_disability_insurance", label: "Life / disability insurance" },
                { key: "umbrella_other_insurance", label: "Umbrella or other insurance" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("payroll") ? (
          <FormSectionCard sectionId="payroll" note="These are simplified as monthly planning deductions in this MVP.">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "hsa_fsa_contribution", label: "HSA / FSA contribution" },
                { key: "commuter_benefits", label: "Commuter benefits" },
                { key: "espp_contribution", label: "ESPP / employee stock purchase plan" },
                { key: "union_workplace_fees", label: "Union or workplace fees" },
                { key: "other_payroll_deduction", label: "Other payroll deduction" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("debt") ? (
          <FormSectionCard sectionId="debt">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "student_loan_payment", label: "Student loan payment" },
                { key: "credit_card_payment", label: "Credit card payment" },
                { key: "personal_loan_payment", label: "Personal loan payment" },
                { key: "other_debt_payment", label: "Other debt payment" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("savings") ? (
          <FormSectionCard sectionId="savings" note="These planned allocations reduce leftover cash in the MVP, even though they are not bills.">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "target_monthly_savings", label: "Target monthly savings" },
                { key: "brokerage_contribution", label: "After-tax brokerage contribution" },
                { key: "roth_ira_contribution", label: "Roth IRA / IRA contribution" },
                { key: "car_down_payment_fund", label: "Car down payment fund" },
                { key: "home_down_payment_fund", label: "Home down payment fund" },
                { key: "large_purchase_fund", label: "Large purchase fund" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("emergency") ? (
          <FormSectionCard sectionId="emergency" note="Only monthly emergency fund contribution reduces monthly leftover. Current balance and target months are informational for now.">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "current_emergency_fund", label: "Current emergency fund" },
                { key: "target_emergency_fund_months", label: "Target emergency fund months" },
                { key: "expected_essential_monthly_expenses", label: "Expected essential monthly expenses" },
                { key: "monthly_emergency_fund_contribution", label: "Monthly emergency fund contribution" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("move_in") ? (
          <FormSectionCard sectionId="move_in" note={`One-time move-in costs are converted into ${usd.format(moveInMonthlyAmount(form))}/mo for planning.`}>
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "move_in_security_deposit", label: "Security deposit" },
                { key: "move_in_first_month_rent", label: "First month rent" },
                { key: "move_in_broker_fee", label: "Broker fee" },
                { key: "application_fee", label: "Application fee" },
                { key: "move_in_fee", label: "Move-in fee" },
                { key: "move_in_furniture_setup", label: "Furniture setup" },
                { key: "kitchen_supplies", label: "Kitchen supplies" },
                { key: "basic_home_setup", label: "Basic home setup" },
                { key: "move_in_amortization_months", label: "Amortization months" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("relocation") ? (
          <FormSectionCard sectionId="relocation" note={`One-time relocation costs are converted into ${usd.format(relocationMonthlyAmount(form))}/mo for planning.`}>
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "moving_company", label: "Moving company / truck" },
                { key: "relocation_travel", label: "Travel to new city" },
                { key: "temporary_housing", label: "Temporary housing" },
                { key: "shipping", label: "Shipping" },
                { key: "storage", label: "Storage" },
                { key: "relocation_setup_cost", label: "One-time setup cost" },
                { key: "relocation_amortization_months", label: "Amortization months" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("immigration") ? (
          <FormSectionCard sectionId="immigration" note={`These are planning estimates only, not legal advice. Current inputs equal ${usd.format(immigrationMonthlyAmount(form))}/mo when amortized.`}>
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "opt_filing_cost", label: "OPT / STEM OPT filing cost" },
                { key: "premium_processing", label: "Premium processing" },
                { key: "legal_consultation", label: "Legal consultation" },
                { key: "document_mailing", label: "Document mailing" },
                { key: "sevis_school_processing", label: "SEVIS / school processing estimate" },
                { key: "visa_travel_reserve", label: "Visa travel reserve" },
                { key: "immigration_amortization_months", label: "Amortization months" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("tax_filing") ? (
          <FormSectionCard sectionId="tax_filing" note={`Annual or one-time filing costs are converted into ${usd.format(taxFilingMonthlyAmount(form))}/mo for planning.`}>
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "tax_software", label: "Tax software" },
                { key: "cpa_tax_service", label: "CPA / tax filing service" },
                { key: "sprintax_filing", label: "Sprintax or nonresident tax filing" },
                { key: "state_filing_fees", label: "State filing fees" },
                { key: "tax_filing_amortization_months", label: "Amortization months" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("career") ? (
          <FormSectionCard sectionId="career">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "linkedin_premium", label: "LinkedIn Premium" },
                { key: "portfolio_hosting", label: "Portfolio hosting" },
                { key: "domain", label: "Domain" },
                { key: "career_cloud_services", label: "Cloud services" },
                { key: "certification_exam", label: "Certification exam" },
                { key: "interview_prep", label: "Interview prep" },
                { key: "professional_events", label: "Professional events" },
                { key: "networking_budget", label: "Networking budget" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("family") ? (
          <FormSectionCard sectionId="family">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "family_support", label: "Family support" },
                { key: "remittance", label: "Remittance" },
                { key: "family_gifts", label: "Gifts to family" },
                { key: "international_transfer_fees", label: "International transfer fees" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("travel_visits") ? (
          <FormSectionCard sectionId="travel_visits">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "domestic_travel_fund", label: "Domestic travel fund" },
                { key: "international_flight_savings", label: "International flight savings" },
                { key: "hotel_lodging_fund", label: "Hotel / lodging fund" },
                { key: "vacation_fund", label: "Vacation fund" },
                { key: "visit_transportation", label: "Transportation for visits" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("pets") ? (
          <FormSectionCard sectionId="pets">
            <FieldGrid
              form={form}
              update={update}
              fields={[
                { key: "pet_food", label: "Pet food" },
                { key: "pet_insurance", label: "Pet insurance" },
                { key: "vet_visit_reserve", label: "Vet visit reserve" },
                { key: "pet_rent", label: "Pet rent" },
                { key: "pet_supplies", label: "Pet supplies" },
              ]}
            />
          </FormSectionCard>
        ) : null}

        {active.has("custom") ? (
          <FormSectionCard sectionId="custom">
            <CustomExpenseRows form={form} update={update} />
          </FormSectionCard>
        ) : null}
      </div>

      <BudgetSummary form={form} activeOptionalSections={activeOptionalSections} resetOptionalSections={resetOptionalSections} />
    </div>
  );
}
