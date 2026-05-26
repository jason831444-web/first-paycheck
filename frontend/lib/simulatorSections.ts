import { SimulationInput } from "@/types/simulation";

export const requiredSectionIds = ["income", "tax", "housing"] as const;

export const optionalSectionIds = [
  "utilities_home",
  "transportation",
  "car",
  "food",
  "subscriptions",
  "lifestyle",
  "healthcare",
  "insurance",
  "payroll",
  "debt",
  "savings",
  "emergency",
  "move_in",
  "relocation",
  "immigration",
  "tax_filing",
  "career",
  "family",
  "travel_visits",
  "pets",
  "custom",
] as const;

export type RequiredSectionId = (typeof requiredSectionIds)[number];
export type OptionalSectionId = (typeof optionalSectionIds)[number];
export type SimulatorSectionId = RequiredSectionId | OptionalSectionId;
export type SectionGroup = "Required basics" | "Monthly life" | "Planning and obligations";

export interface CustomExpenseRow {
  id: string;
  name: string;
  amount: number;
}

export interface SimulatorFormState extends SimulationInput {
  renter_insurance: number;
  laundry: number;
  electricity: number;
  gas_utility: number;
  water: number;
  home_supplies: number;
  cleaning_supplies: number;
  rideshare_budget: number;
  commute_pass: number;
  commute_parking: number;
  car_maintenance: number;
  car_parking: number;
  car_registration: number;
  delivery: number;
  coffee: number;
  protein_supplements: number;
  meal_prep: number;
  streaming: number;
  cloud_software: number;
  memberships: number;
  clothing: number;
  grooming: number;
  entertainment: number;
  dating_social: number;
  gifts: number;
  miscellaneous: number;
  doctor_visits_reserve: number;
  prescriptions: number;
  therapy_counseling: number;
  urgent_care_reserve: number;
  medical_buffer: number;
  dental_insurance: number;
  vision_insurance: number;
  insurance_renters: number;
  life_disability_insurance: number;
  umbrella_other_insurance: number;
  hsa_fsa_contribution: number;
  commuter_benefits: number;
  espp_contribution: number;
  union_workplace_fees: number;
  other_payroll_deduction: number;
  student_loan_payment: number;
  credit_card_payment: number;
  personal_loan_payment: number;
  other_debt_payment: number;
  target_monthly_savings: number;
  brokerage_contribution: number;
  roth_ira_contribution: number;
  car_down_payment_fund: number;
  home_down_payment_fund: number;
  large_purchase_fund: number;
  current_emergency_fund: number;
  target_emergency_fund_months: number;
  expected_essential_monthly_expenses: number;
  monthly_emergency_fund_contribution: number;
  move_in_security_deposit: number;
  move_in_first_month_rent: number;
  move_in_broker_fee: number;
  application_fee: number;
  move_in_fee: number;
  move_in_furniture_setup: number;
  kitchen_supplies: number;
  basic_home_setup: number;
  move_in_amortization_months: number;
  moving_company: number;
  relocation_travel: number;
  temporary_housing: number;
  shipping: number;
  storage: number;
  relocation_setup_cost: number;
  relocation_amortization_months: number;
  opt_filing_cost: number;
  premium_processing: number;
  legal_consultation: number;
  document_mailing: number;
  sevis_school_processing: number;
  visa_travel_reserve: number;
  immigration_amortization_months: number;
  tax_software: number;
  cpa_tax_service: number;
  sprintax_filing: number;
  state_filing_fees: number;
  tax_filing_amortization_months: number;
  linkedin_premium: number;
  portfolio_hosting: number;
  domain: number;
  career_cloud_services: number;
  certification_exam: number;
  interview_prep: number;
  professional_events: number;
  networking_budget: number;
  family_support: number;
  remittance: number;
  family_gifts: number;
  international_transfer_fees: number;
  domestic_travel_fund: number;
  international_flight_savings: number;
  hotel_lodging_fund: number;
  vacation_fund: number;
  visit_transportation: number;
  pet_food: number;
  pet_insurance: number;
  vet_visit_reserve: number;
  pet_rent: number;
  pet_supplies: number;
  custom_expenses: CustomExpenseRow[];
}

export interface SectionDefinition {
  id: SimulatorSectionId;
  title: string;
  group: SectionGroup;
  description: string;
  required: boolean;
  badge?: string;
}

const requiredSections: SectionDefinition[] = [
  { id: "income", title: "Income", group: "Required basics", description: "Your salary and pay schedule.", required: true, badge: "Locked" },
  { id: "tax", title: "Tax and OPT", group: "Required basics", description: "Estimate take-home pay with FICA and filing assumptions.", required: true, badge: "Locked" },
  { id: "housing", title: "Housing", group: "Required basics", description: "Rent and core housing costs.", required: true, badge: "Locked" },
];

const monthlyLifeSections: SectionDefinition[] = [
  { id: "utilities_home", title: "Utilities and home", group: "Monthly life", description: "Power, internet, laundry, insurance, and home supplies.", required: false },
  { id: "transportation", title: "Transportation", group: "Monthly life", description: "Transit, rideshare, and commute costs.", required: false },
  { id: "car", title: "Car ownership / lease", group: "Monthly life", description: "Lease, insurance, gas, tolls, and maintenance.", required: false },
  { id: "food", title: "Food", group: "Monthly life", description: "Groceries, eating out, delivery, and daily food habits.", required: false },
  { id: "subscriptions", title: "Subscriptions and recurring bills", group: "Monthly life", description: "Phone, streaming, software tools, gym, and memberships.", required: false },
  { id: "lifestyle", title: "Lifestyle and personal spending", group: "Monthly life", description: "Clothing, grooming, social plans, gifts, and miscellaneous spending.", required: false },
  { id: "healthcare", title: "Healthcare out-of-pocket", group: "Monthly life", description: "Medical reserves separate from payroll health insurance.", required: false },
  { id: "insurance", title: "Insurance", group: "Monthly life", description: "Dental, vision, renter, life, disability, or other coverage.", required: false },
];

const planningSections: SectionDefinition[] = [
  { id: "payroll", title: "Payroll deductions", group: "Planning and obligations", description: "HSA, commuter benefits, ESPP, workplace fees, and other deductions.", required: false },
  { id: "debt", title: "Debt and student loans", group: "Planning and obligations", description: "Student loans, credit card payments, or other debt.", required: false },
  { id: "savings", title: "Savings and investing goals", group: "Planning and obligations", description: "Planned monthly allocations for savings and investing.", required: false },
  { id: "emergency", title: "Emergency fund planning", group: "Planning and obligations", description: "Track emergency savings targets and monthly contributions.", required: false },
  { id: "move_in", title: "Apartment move-in costs", group: "Planning and obligations", description: "One-time apartment setup costs converted into a monthly amount.", required: false },
  { id: "relocation", title: "Relocation and moving costs", group: "Planning and obligations", description: "Moving costs converted into a monthly planning amount.", required: false },
  { id: "immigration", title: "Immigration / OPT / visa-related costs", group: "Planning and obligations", description: "OPT, visa, and document-related planning estimates.", required: false },
  { id: "tax_filing", title: "Taxes and filing costs", group: "Planning and obligations", description: "Tax software, CPA, Sprintax, and state filing costs.", required: false },
  { id: "career", title: "Career and professional costs", group: "Planning and obligations", description: "Professional tools, events, certifications, and networking.", required: false },
  { id: "family", title: "Family / remittance", group: "Planning and obligations", description: "Family support, gifts, remittance, and transfer fees.", required: false },
  { id: "travel_visits", title: "Travel and visits", group: "Planning and obligations", description: "Domestic trips, flights, lodging, vacation, and visit transportation.", required: false },
  { id: "pets", title: "Pet expenses", group: "Planning and obligations", description: "Pet food, insurance, vet reserves, rent, and supplies.", required: false },
  { id: "custom", title: "Custom expenses", group: "Planning and obligations", description: "Add any recurring expense that does not fit elsewhere.", required: false },
];

export const simulatorSections = [...requiredSections, ...monthlyLifeSections, ...planningSections];
export const optionalSectionGroups = [
  { title: "Monthly life", sections: monthlyLifeSections },
  { title: "Planning and obligations", sections: planningSections },
] as const;

export const sectionById = Object.fromEntries(simulatorSections.map((section) => [section.id, section])) as Record<
  SimulatorSectionId,
  SectionDefinition
>;

export const simulatorDefaults: SimulatorFormState = {
  name: "First job plan",
  annual_salary: 95000,
  pay_frequency: "biweekly",
  tax_year: 2026,
  filing_status: "single",
  work_state: "NY",
  residence_location: "Brooklyn",
  fica_exempt: true,
  contribution_401k_percent: 5,
  health_insurance_monthly: 180,
  rent: 2600,
  utilities: 145,
  internet: 65,
  renter_insurance: 18,
  laundry: 35,
  electricity: 80,
  gas_utility: 35,
  water: 25,
  home_supplies: 45,
  cleaning_supplies: 25,
  phone: 55,
  groceries: 500,
  eating_out: 350,
  transportation_type: "public_transit",
  transit_cost: 132,
  rideshare_budget: 60,
  commute_pass: 0,
  commute_parking: 0,
  car_payment: 0,
  car_insurance: 0,
  gas: 0,
  parking: 0,
  tolls: 0,
  car_maintenance: 0,
  car_parking: 0,
  car_registration: 0,
  subscriptions: 45,
  gym: 75,
  personal_spending: 300,
  other_expenses: 0,
  delivery: 60,
  coffee: 45,
  protein_supplements: 0,
  meal_prep: 0,
  streaming: 35,
  cloud_software: 0,
  memberships: 0,
  clothing: 100,
  grooming: 45,
  entertainment: 125,
  dating_social: 75,
  gifts: 40,
  miscellaneous: 75,
  doctor_visits_reserve: 0,
  prescriptions: 0,
  therapy_counseling: 0,
  urgent_care_reserve: 0,
  medical_buffer: 0,
  dental_insurance: 0,
  vision_insurance: 0,
  insurance_renters: 0,
  life_disability_insurance: 0,
  umbrella_other_insurance: 0,
  hsa_fsa_contribution: 0,
  commuter_benefits: 0,
  espp_contribution: 0,
  union_workplace_fees: 0,
  other_payroll_deduction: 0,
  student_loan_payment: 0,
  credit_card_payment: 0,
  personal_loan_payment: 0,
  other_debt_payment: 0,
  target_monthly_savings: 500,
  brokerage_contribution: 0,
  roth_ira_contribution: 0,
  car_down_payment_fund: 0,
  home_down_payment_fund: 0,
  large_purchase_fund: 0,
  current_emergency_fund: 0,
  target_emergency_fund_months: 3,
  expected_essential_monthly_expenses: 3500,
  monthly_emergency_fund_contribution: 200,
  move_in_security_deposit: 0,
  move_in_first_month_rent: 0,
  move_in_broker_fee: 0,
  application_fee: 0,
  move_in_fee: 0,
  move_in_furniture_setup: 0,
  kitchen_supplies: 0,
  basic_home_setup: 0,
  move_in_amortization_months: 12,
  moving_company: 0,
  relocation_travel: 0,
  temporary_housing: 0,
  shipping: 0,
  storage: 0,
  relocation_setup_cost: 0,
  relocation_amortization_months: 12,
  opt_filing_cost: 0,
  premium_processing: 0,
  legal_consultation: 0,
  document_mailing: 0,
  sevis_school_processing: 0,
  visa_travel_reserve: 0,
  immigration_amortization_months: 12,
  tax_software: 0,
  cpa_tax_service: 0,
  sprintax_filing: 0,
  state_filing_fees: 0,
  tax_filing_amortization_months: 12,
  linkedin_premium: 0,
  portfolio_hosting: 0,
  domain: 0,
  career_cloud_services: 0,
  certification_exam: 0,
  interview_prep: 0,
  professional_events: 0,
  networking_budget: 0,
  family_support: 0,
  remittance: 0,
  family_gifts: 0,
  international_transfer_fees: 0,
  domestic_travel_fund: 0,
  international_flight_savings: 0,
  hotel_lodging_fund: 0,
  vacation_fund: 0,
  visit_transportation: 0,
  pet_food: 0,
  pet_insurance: 0,
  vet_visit_reserve: 0,
  pet_rent: 0,
  pet_supplies: 0,
  custom_expenses: [],
};

export const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
const safeMonths = (value: number) => Math.max(1, Math.round(safe(value) || 12));
const roundMonthly = (value: number) => Math.round(value * 100) / 100;

export function moveInMonthlyAmount(form: SimulatorFormState) {
  return (
    safe(form.move_in_security_deposit) +
    safe(form.move_in_first_month_rent) +
    safe(form.move_in_broker_fee) +
    safe(form.application_fee) +
    safe(form.move_in_fee) +
    safe(form.move_in_furniture_setup) +
    safe(form.kitchen_supplies) +
    safe(form.basic_home_setup)
  ) / safeMonths(form.move_in_amortization_months);
}

export function relocationMonthlyAmount(form: SimulatorFormState) {
  return (
    safe(form.moving_company) +
    safe(form.relocation_travel) +
    safe(form.temporary_housing) +
    safe(form.shipping) +
    safe(form.storage) +
    safe(form.relocation_setup_cost)
  ) / safeMonths(form.relocation_amortization_months);
}

export function immigrationMonthlyAmount(form: SimulatorFormState) {
  return (
    safe(form.opt_filing_cost) +
    safe(form.premium_processing) +
    safe(form.legal_consultation) +
    safe(form.document_mailing) +
    safe(form.sevis_school_processing) +
    safe(form.visa_travel_reserve)
  ) / safeMonths(form.immigration_amortization_months);
}

export function taxFilingMonthlyAmount(form: SimulatorFormState) {
  return (
    safe(form.tax_software) +
    safe(form.cpa_tax_service) +
    safe(form.sprintax_filing) +
    safe(form.state_filing_fees)
  ) / safeMonths(form.tax_filing_amortization_months);
}

export function customMonthlyAmount(form: SimulatorFormState) {
  return form.custom_expenses.reduce((total, row) => total + safe(row.amount), 0);
}

export function sectionMonthlyAmount(sectionId: SimulatorSectionId, form: SimulatorFormState, activeOptionalSections: OptionalSectionId[] = []) {
  const active = new Set(activeOptionalSections);

  switch (sectionId) {
    case "housing":
      return safe(form.rent) + (active.has("utilities_home") ? 0 : safe(form.utilities) + safe(form.internet) + safe(form.renter_insurance) + safe(form.laundry));
    case "utilities_home":
      return safe(form.electricity) + safe(form.gas_utility) + safe(form.water) + safe(form.internet) + safe(form.laundry) + safe(form.renter_insurance) + safe(form.home_supplies) + safe(form.cleaning_supplies);
    case "transportation":
      return safe(form.transit_cost) + safe(form.commute_pass) + safe(form.rideshare_budget) + safe(form.commute_parking);
    case "car":
      return safe(form.car_payment) + safe(form.car_insurance) + safe(form.gas) + safe(form.car_maintenance) + safe(form.tolls) + safe(form.car_parking) + safe(form.car_registration);
    case "food":
      return safe(form.groceries) + safe(form.eating_out) + safe(form.delivery) + safe(form.coffee) + safe(form.protein_supplements) + safe(form.meal_prep);
    case "subscriptions":
      return safe(form.phone) + safe(form.subscriptions) + safe(form.streaming) + safe(form.cloud_software) + safe(form.gym) + safe(form.memberships);
    case "lifestyle":
      return safe(form.personal_spending) + safe(form.clothing) + safe(form.grooming) + safe(form.entertainment) + safe(form.dating_social) + safe(form.gifts) + safe(form.miscellaneous);
    case "healthcare":
      return safe(form.doctor_visits_reserve) + safe(form.prescriptions) + safe(form.therapy_counseling) + safe(form.urgent_care_reserve) + safe(form.medical_buffer);
    case "insurance":
      return safe(form.dental_insurance) + safe(form.vision_insurance) + (active.has("utilities_home") ? 0 : safe(form.insurance_renters)) + safe(form.life_disability_insurance) + safe(form.umbrella_other_insurance);
    case "payroll":
      return safe(form.hsa_fsa_contribution) + safe(form.commuter_benefits) + safe(form.espp_contribution) + safe(form.union_workplace_fees) + safe(form.other_payroll_deduction);
    case "debt":
      return safe(form.student_loan_payment) + safe(form.credit_card_payment) + safe(form.personal_loan_payment) + safe(form.other_debt_payment);
    case "savings":
      return safe(form.target_monthly_savings) + safe(form.brokerage_contribution) + safe(form.roth_ira_contribution) + safe(form.car_down_payment_fund) + safe(form.home_down_payment_fund) + safe(form.large_purchase_fund);
    case "emergency":
      return safe(form.monthly_emergency_fund_contribution);
    case "move_in":
      return moveInMonthlyAmount(form);
    case "relocation":
      return relocationMonthlyAmount(form);
    case "immigration":
      return immigrationMonthlyAmount(form);
    case "tax_filing":
      return taxFilingMonthlyAmount(form);
    case "career":
      return safe(form.linkedin_premium) + safe(form.portfolio_hosting) + safe(form.domain) + safe(form.career_cloud_services) + safe(form.certification_exam) + safe(form.interview_prep) + safe(form.professional_events) + safe(form.networking_budget);
    case "family":
      return safe(form.family_support) + safe(form.remittance) + safe(form.family_gifts) + safe(form.international_transfer_fees);
    case "travel_visits":
      return safe(form.domestic_travel_fund) + safe(form.international_flight_savings) + safe(form.hotel_lodging_fund) + safe(form.vacation_fund) + safe(form.visit_transportation);
    case "pets":
      return safe(form.pet_food) + safe(form.pet_insurance) + safe(form.vet_visit_reserve) + safe(form.pet_rent) + safe(form.pet_supplies);
    case "custom":
      return customMonthlyAmount(form);
    default:
      return 0;
  }
}

export function amortizedMonthlyTotal(form: SimulatorFormState, activeOptionalSections: OptionalSectionId[]) {
  return roundMonthly(
    (activeOptionalSections.includes("move_in") ? moveInMonthlyAmount(form) : 0) +
      (activeOptionalSections.includes("relocation") ? relocationMonthlyAmount(form) : 0) +
      (activeOptionalSections.includes("immigration") ? immigrationMonthlyAmount(form) : 0) +
      (activeOptionalSections.includes("tax_filing") ? taxFilingMonthlyAmount(form) : 0),
  );
}

export function backendMappedMonthlyExpenses(input: SimulationInput) {
  return roundMonthly(
    input.rent +
      input.utilities +
      input.internet +
      input.phone +
      input.groceries +
      input.eating_out +
      input.transit_cost +
      input.car_payment +
      input.car_insurance +
      input.gas +
      input.parking +
      input.tolls +
      input.subscriptions +
      input.gym +
      input.personal_spending +
      input.other_expenses,
  );
}

export function buildSimulationInputFromSections(form: SimulatorFormState, activeOptionalSections: OptionalSectionId[]): SimulationInput {
  const active = new Set<OptionalSectionId>(activeOptionalSections);
  const utilitiesHomeActive = active.has("utilities_home");
  const transportationActive = active.has("transportation");
  const carActive = active.has("car");
  const foodActive = active.has("food");
  const subscriptionsActive = active.has("subscriptions");
  const lifestyleActive = active.has("lifestyle");
  const insuranceActive = active.has("insurance");

  const otherExpenses =
    (utilitiesHomeActive
      ? safe(form.electricity) + safe(form.gas_utility) + safe(form.water) + safe(form.renter_insurance) + safe(form.laundry) + safe(form.home_supplies) + safe(form.cleaning_supplies)
      : safe(form.renter_insurance) + safe(form.laundry)) +
    (transportationActive ? safe(form.rideshare_budget) + safe(form.commute_parking) : 0) +
    (carActive ? safe(form.car_maintenance) + safe(form.car_registration) : 0) +
    (foodActive ? safe(form.protein_supplements) : 0) +
    (subscriptionsActive ? safe(form.cloud_software) + safe(form.memberships) : 0) +
    (lifestyleActive ? safe(form.clothing) + safe(form.grooming) + safe(form.entertainment) + safe(form.dating_social) + safe(form.gifts) + safe(form.miscellaneous) : 0) +
    (active.has("healthcare") ? sectionMonthlyAmount("healthcare", form, activeOptionalSections) : 0) +
    (insuranceActive ? safe(form.dental_insurance) + safe(form.vision_insurance) + (utilitiesHomeActive ? 0 : safe(form.insurance_renters)) + safe(form.life_disability_insurance) + safe(form.umbrella_other_insurance) : 0) +
    (active.has("payroll") ? sectionMonthlyAmount("payroll", form, activeOptionalSections) : 0) +
    (active.has("debt") ? sectionMonthlyAmount("debt", form, activeOptionalSections) : 0) +
    (active.has("savings") ? sectionMonthlyAmount("savings", form, activeOptionalSections) : 0) +
    (active.has("emergency") ? safe(form.monthly_emergency_fund_contribution) : 0) +
    (active.has("move_in") ? moveInMonthlyAmount(form) : 0) +
    (active.has("relocation") ? relocationMonthlyAmount(form) : 0) +
    (active.has("immigration") ? immigrationMonthlyAmount(form) : 0) +
    (active.has("tax_filing") ? taxFilingMonthlyAmount(form) : 0) +
    (active.has("career") ? sectionMonthlyAmount("career", form, activeOptionalSections) : 0) +
    (active.has("family") ? sectionMonthlyAmount("family", form, activeOptionalSections) : 0) +
    (active.has("travel_visits") ? sectionMonthlyAmount("travel_visits", form, activeOptionalSections) : 0) +
    (active.has("pets") ? sectionMonthlyAmount("pets", form, activeOptionalSections) : 0) +
    (active.has("custom") ? customMonthlyAmount(form) : 0);

  return {
    name: form.name,
    annual_salary: safe(form.annual_salary) || 1,
    pay_frequency: form.pay_frequency,
    tax_year: form.tax_year,
    filing_status: form.filing_status,
    work_state: form.work_state,
    residence_location: form.residence_location,
    residence_state: form.residence_state,
    fica_exempt: form.fica_exempt,
    contribution_401k_percent: form.contribution_401k_percent,
    health_insurance_monthly: safe(form.health_insurance_monthly),
    rent: safe(form.rent),
    utilities: utilitiesHomeActive ? 0 : safe(form.utilities),
    internet: utilitiesHomeActive ? safe(form.internet) : safe(form.internet),
    phone: subscriptionsActive ? safe(form.phone) : 0,
    groceries: foodActive ? safe(form.groceries) + safe(form.meal_prep) : 0,
    eating_out: foodActive ? safe(form.eating_out) + safe(form.delivery) + safe(form.coffee) : 0,
    transportation_type: transportationActive || carActive ? form.transportation_type : "public_transit",
    transit_cost: transportationActive ? safe(form.transit_cost) + safe(form.commute_pass) : 0,
    car_payment: carActive ? safe(form.car_payment) : 0,
    car_insurance: carActive ? safe(form.car_insurance) : 0,
    gas: carActive ? safe(form.gas) : 0,
    parking: carActive ? safe(form.car_parking) : 0,
    tolls: carActive ? safe(form.tolls) : 0,
    subscriptions: subscriptionsActive ? safe(form.subscriptions) + safe(form.streaming) : 0,
    gym: subscriptionsActive ? safe(form.gym) : 0,
    personal_spending: lifestyleActive ? safe(form.personal_spending) : 0,
    other_expenses: roundMonthly(otherExpenses),
  };
}
