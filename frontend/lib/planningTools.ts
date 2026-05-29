import { SimulationInput } from "@/types/simulation";

export interface SalaryAssumptions {
  annual_salary: number;
  pay_frequency: SimulationInput["pay_frequency"];
  tax_year: number;
  filing_status: "single";
  work_state: string;
  fica_exempt: boolean;
  contribution_401k_percent: number;
  health_insurance_monthly: number;
}

export const defaultSalaryAssumptions: SalaryAssumptions = {
  annual_salary: 105000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  fica_exempt: true,
  contribution_401k_percent: 0,
  health_insurance_monthly: 150,
};

export function buildSimulationInput(
  assumptions: SalaryAssumptions,
  patch: Partial<SimulationInput>,
): SimulationInput {
  return {
    ...assumptions,
    name: patch.name ?? "Planning tool estimate",
    residence_location: patch.residence_location ?? "New York, NY",
    residence_state: patch.residence_state,
    rent: patch.rent ?? 0,
    utilities: patch.utilities ?? 0,
    internet: patch.internet ?? 0,
    phone: patch.phone ?? 70,
    groceries: patch.groceries ?? 500,
    eating_out: patch.eating_out ?? 300,
    transportation_type: patch.transportation_type ?? "public_transit",
    transit_cost: patch.transit_cost ?? 0,
    car_payment: patch.car_payment ?? 0,
    car_insurance: patch.car_insurance ?? 0,
    gas: patch.gas ?? 0,
    parking: patch.parking ?? 0,
    tolls: patch.tolls ?? 0,
    subscriptions: patch.subscriptions ?? 80,
    gym: patch.gym ?? 60,
    personal_spending: patch.personal_spending ?? 350,
    other_expenses: patch.other_expenses ?? 100,
  };
}

export function numberValue(value: string | number, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function divideSafe(value: number, divisor: number) {
  return divisor > 0 ? value / divisor : 0;
}

export function rowsToCsv(rows: Record<string, string | number | null | undefined>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | null | undefined) => {
    const raw = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  };
  return [headers.map(escape).join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export function downloadCsv(filename: string, rows: Record<string, string | number | null | undefined>[]) {
  const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDisplayMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

export function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
