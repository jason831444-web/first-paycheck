"use client";

import { NumberField } from "@/components/SalaryForm";
import { SimulationInput } from "@/types/simulation";

interface Props {
  form: SimulationInput;
  update: (patch: Partial<SimulationInput>) => void;
}

export function ExpenseForm({ form, update }: Props) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Housing expenses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <NumberField label="Rent" value={form.rent} onChange={(rent) => update({ rent })} />
          <NumberField label="Utilities" value={form.utilities} onChange={(utilities) => update({ utilities })} />
          <NumberField label="Internet" value={form.internet} onChange={(internet) => update({ internet })} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Transportation expenses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="text-sm font-medium text-slate-700">Transportation type</span>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.transportation_type} onChange={(e) => update({ transportation_type: e.target.value as SimulationInput["transportation_type"] })}>
              <option value="public_transit">Public transit</option>
              <option value="car">Car</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
          <NumberField label="Public transit" value={form.transit_cost} onChange={(transit_cost) => update({ transit_cost })} />
          <NumberField label="Car payment or lease" value={form.car_payment} onChange={(car_payment) => update({ car_payment })} />
          <NumberField label="Car insurance" value={form.car_insurance} onChange={(car_insurance) => update({ car_insurance })} />
          <NumberField label="Gas" value={form.gas} onChange={(gas) => update({ gas })} />
          <NumberField label="Parking" value={form.parking} onChange={(parking) => update({ parking })} />
          <NumberField label="Tolls" value={form.tolls} onChange={(tolls) => update({ tolls })} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Lifestyle expenses</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <NumberField label="Phone" value={form.phone} onChange={(phone) => update({ phone })} />
          <NumberField label="Groceries" value={form.groceries} onChange={(groceries) => update({ groceries })} />
          <NumberField label="Eating out" value={form.eating_out} onChange={(eating_out) => update({ eating_out })} />
          <NumberField label="Subscriptions" value={form.subscriptions} onChange={(subscriptions) => update({ subscriptions })} />
          <NumberField label="Gym" value={form.gym} onChange={(gym) => update({ gym })} />
          <NumberField label="Personal spending" value={form.personal_spending} onChange={(personal_spending) => update({ personal_spending })} />
          <NumberField label="Other fixed expenses" value={form.other_expenses} onChange={(other_expenses) => update({ other_expenses })} />
        </div>
      </div>
    </div>
  );
}
