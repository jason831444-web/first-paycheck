import ExcelJS from "exceljs";
import { LocationComparisonResult, SimulationInput, SimulationResult } from "@/types/simulation";

type CsvValue = string | number | boolean | null | undefined;
type Row = Record<string, CsvValue>;

const DISCLAIMER = "This tool provides estimates for planning purposes only and is not tax, legal, or financial advice.";

function asNumber(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(asNumber(value));
}

function percentString(value: number | null | undefined) {
  return `${(asNumber(value) * 100).toFixed(1)}%`;
}

function text(value: CsvValue) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function formatDateForFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function rowsToCsv(rows: Row[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: CsvValue) => {
    const raw = text(value);
    return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  };

  return [headers.map(escapeCell).join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
}

function appendSheet(workbook: ExcelJS.Workbook, sheetName: string, rows: Row[]) {
  const worksheet = workbook.addWorksheet(sheetName);
  const headers = rows.length ? Object.keys(rows[0]) : ["Notes"];
  worksheet.columns = headers.map((header) => ({ header, key: header, width: Math.min(Math.max(header.length + 10, 18), 44) }));
  rows.forEach((row) => worksheet.addRow(row));
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6F5" } };
  worksheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });
}

async function writeWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename,
  );
}

function simulationSummaryRows(input: SimulationInput, result: SimulationResult): Row[] {
  return [
    { Metric: "Annual Salary", Value: money(input.annual_salary) },
    { Metric: "Pay Frequency", Value: input.pay_frequency },
    { Metric: "Tax Year", Value: input.tax_year },
    { Metric: "Filing Status", Value: input.filing_status },
    { Metric: "Work State", Value: input.work_state },
    { Metric: "Residence Location", Value: input.residence_location },
    { Metric: "FICA Exempt", Value: input.fica_exempt ? "Yes" : "No" },
    { Metric: "Gross Monthly Income", Value: money(result.gross_monthly) },
    { Metric: "Federal Tax Monthly", Value: money(result.federal_tax_monthly) },
    { Metric: "State Tax Monthly", Value: money(result.state_tax_monthly) },
    { Metric: "Local Tax Monthly", Value: money(result.local_tax_monthly) },
    { Metric: "FICA Monthly", Value: money(result.fica_monthly) },
    { Metric: "401k Monthly", Value: money(result.contribution_401k_monthly) },
    { Metric: "Health Insurance Monthly", Value: money(result.health_insurance_monthly) },
    { Metric: "Net Monthly Income", Value: money(result.net_monthly) },
    { Metric: "Total Monthly Expenses", Value: money(result.total_expenses) },
    { Metric: "Monthly Leftover", Value: money(result.monthly_leftover) },
    { Metric: "Savings Rate", Value: percentString(result.savings_rate) },
    { Metric: "Housing Ratio", Value: percentString(result.housing_ratio) },
    { Metric: "Transportation Ratio", Value: percentString(result.transportation_ratio) },
    { Metric: "Affordability Score", Value: result.affordability_score },
    { Metric: "Risk Level", Value: result.risk_level },
  ];
}

function monthlyBudgetRows(input: SimulationInput, result: SimulationResult): Row[] {
  const breakdown = result.expense_breakdown ?? {};
  const notes = "Itemized optional sections are mapped into existing backend categories for the MVP.";

  return [
    { Category: "Housing", "Monthly Amount": money(breakdown.housing ?? input.rent + input.utilities + input.internet), Notes: "Rent plus backend housing fields." },
    { Category: "Utilities / Home", "Monthly Amount": money(input.utilities + input.internet), Notes: "Dedicated utilities may be included in Housing or Other Expenses." },
    { Category: "Transportation", "Monthly Amount": money(breakdown.transportation ?? input.transit_cost + input.car_payment + input.car_insurance + input.gas + input.parking + input.tolls), Notes: "Transit and vehicle fields mapped by backend." },
    { Category: "Car", "Monthly Amount": money(input.car_payment + input.car_insurance + input.gas + input.parking + input.tolls), Notes: "Maintenance or registration may be included in Other Expenses." },
    { Category: "Food", "Monthly Amount": money(breakdown.food ?? input.groceries + input.eating_out), Notes: "Groceries and eating out fields." },
    { Category: "Subscriptions", "Monthly Amount": money(input.phone + input.subscriptions + input.gym), Notes: "Backend groups phone separately and subscriptions/gym into lifestyle." },
    { Category: "Lifestyle", "Monthly Amount": money(breakdown.lifestyle ?? input.subscriptions + input.gym + input.personal_spending), Notes: "Backend lifestyle category." },
    { Category: "Insurance", "Monthly Amount": "", Notes: notes },
    { Category: "Debt", "Monthly Amount": "", Notes: notes },
    { Category: "Savings Goals", "Monthly Amount": "", Notes: "Planned allocations may be included in Other Expenses." },
    { Category: "Emergency Fund", "Monthly Amount": "", Notes: "Monthly contributions may be included in Other Expenses." },
    { Category: "Relocation / Move-in", "Monthly Amount": "", Notes: "Amortized one-time costs may be included in Other Expenses." },
    { Category: "Immigration / OPT / Visa", "Monthly Amount": "", Notes: "Amortized planning estimates may be included in Other Expenses." },
    { Category: "Taxes / Filing", "Monthly Amount": "", Notes: "Amortized filing costs may be included in Other Expenses." },
    { Category: "Career / Professional", "Monthly Amount": "", Notes: notes },
    { Category: "Family / Remittance", "Monthly Amount": "", Notes: notes },
    { Category: "Travel", "Monthly Amount": "", Notes: notes },
    { Category: "Pet", "Monthly Amount": "", Notes: notes },
    { Category: "Custom Expenses", "Monthly Amount": "", Notes: "Custom rows are summed into Other Expenses for this MVP." },
    { Category: "Other Expenses", "Monthly Amount": money(breakdown.other ?? input.other_expenses), Notes: "Mapped optional categories and custom expenses." },
    { Category: "Monthly Leftover", "Monthly Amount": money(result.monthly_leftover), Notes: "Net monthly income minus total monthly expenses." },
  ];
}

function taxAssumptionRows(result: SimulationResult): Row[] {
  return [
    { Assumption: "Federal tax is estimated.", Notes: "Uses simplified planning assumptions." },
    { Assumption: "FICA exemption is based on user selection.", Notes: "Eligibility depends on personal circumstances." },
    { Assumption: "State tax may use simplified estimates.", Notes: "Some state and local rules are approximated." },
    { Assumption: "Local tax may not be modeled for every city.", Notes: "Review local rules before making decisions." },
    { Assumption: "This is not tax, legal, or financial advice.", Notes: DISCLAIMER },
    ...(result.tax_assumption_notes ?? []).map((note) => ({ Assumption: "Backend note", Notes: note })),
  ];
}

export async function exportSimulationToExcel(input: SimulationInput, result: SimulationResult) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FirstPaycheck";
  workbook.created = new Date();
  appendSheet(workbook, "Summary", simulationSummaryRows(input, result));
  appendSheet(workbook, "Monthly Budget", monthlyBudgetRows(input, result));
  appendSheet(workbook, "Tax Assumptions", taxAssumptionRows(result));
  appendSheet(workbook, "Disclaimer", [{ Disclaimer: DISCLAIMER }]);
  await writeWorkbook(workbook, `firstpaycheck-simulation-${formatDateForFilename()}.xlsx`);
}

export function exportSimulationToCSV(input: SimulationInput, result: SimulationResult) {
  const csv = rowsToCsv(simulationSummaryRows(input, result));
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `firstpaycheck-simulation-${formatDateForFilename()}.csv`);
}

function comparisonRows(results: LocationComparisonResult[]): Row[] {
  return results.map((row) => ({
    Location: row.display_name,
    City: row.city,
    State: row.state,
    "Metro Area": row.metro_area,
    "Net Monthly Income": money(row.net_monthly),
    Rent: money(row.rent),
    "Transportation Cost": money(row.transportation_cost),
    "Total Monthly Expenses": money(row.total_expenses),
    "Monthly Leftover": money(row.monthly_leftover),
    "Housing Ratio": percentString(row.housing_ratio),
    "Savings Rate": percentString(row.savings_rate),
    "Affordability Score": row.affordability_score,
    "Risk Level": row.risk_level,
    Recommendation: row.recommendation_text,
  }));
}

function comparisonTaxRows(results: LocationComparisonResult[]): Row[] {
  return results.flatMap((row) => {
    const notes = row.tax_assumption_notes?.length ? row.tax_assumption_notes : ["No additional tax assumption notes returned."];
    return notes.map((note) => ({ Location: row.display_name, "Tax Assumption Notes": note }));
  });
}

export async function exportComparisonToExcel(results: LocationComparisonResult[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FirstPaycheck";
  workbook.created = new Date();
  appendSheet(workbook, "Location Comparison", comparisonRows(results));
  appendSheet(workbook, "Tax Assumptions", comparisonTaxRows(results));
  appendSheet(workbook, "Disclaimer", [{ Disclaimer: DISCLAIMER }]);
  await writeWorkbook(workbook, `firstpaycheck-location-comparison-${formatDateForFilename()}.xlsx`);
}

export function exportComparisonToCSV(results: LocationComparisonResult[]) {
  const csv = rowsToCsv(comparisonRows(results));
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `firstpaycheck-location-comparison-${formatDateForFilename()}.csv`);
}
