export type PayFrequency = "monthly" | "semi_monthly" | "biweekly";
export type WorkState = string;
export type ResidenceLocation = string;
export type TransportationType = "public_transit" | "car" | "hybrid";
export type RiskLevel = "Comfortable" | "Manageable" | "Tight" | "Risky";

export interface SimulationInput {
  name?: string;
  annual_salary: number;
  pay_frequency: PayFrequency;
  tax_year: number;
  filing_status: "single";
  work_state: WorkState;
  residence_location: ResidenceLocation;
  residence_state?: string;
  fica_exempt: boolean;
  contribution_401k_percent: number;
  health_insurance_monthly: number;
  rent: number;
  utilities: number;
  internet: number;
  phone: number;
  groceries: number;
  eating_out: number;
  transportation_type: TransportationType;
  transit_cost: number;
  car_payment: number;
  car_insurance: number;
  gas: number;
  parking: number;
  tolls: number;
  subscriptions: number;
  gym: number;
  personal_spending: number;
  other_expenses: number;
}

export interface RentRecommendation {
  safe_max_rent: number;
  stretch_max_rent: number;
  current_rent_status: string;
}

export interface SimulationResult {
  gross_monthly: number;
  federal_tax_monthly: number;
  state_tax_monthly: number;
  local_tax_monthly: number;
  fica_monthly: number;
  fica_exemption_monthly_value: number;
  contribution_401k_monthly: number;
  health_insurance_monthly: number;
  net_monthly: number;
  total_expenses: number;
  monthly_leftover: number;
  savings_rate: number;
  housing_ratio: number;
  transportation_ratio: number;
  affordability_score: number;
  risk_level: RiskLevel;
  recommendation_text: string;
  rent_recommendation: RentRecommendation;
  expense_breakdown: Record<string, number>;
  notes: string[];
  tax_assumption_notes: string[];
}

export interface CityPreset {
  id: string;
  display_name: string;
  city: string;
  state: string;
  metro_area: string;
  region: string;
  estimated_rent: number;
  transportation_type: TransportationType;
  notes: string;
}

export interface SavedScenario extends SimulationInput {
  id: number;
  created_at: string;
  result?: SimulationResult;
}

export interface CompareLocationsRequest {
  annual_salary: number;
  pay_frequency: PayFrequency;
  tax_year: number;
  filing_status: "single";
  work_state: WorkState;
  fica_exempt: boolean;
  contribution_401k_percent: number;
  health_insurance_monthly: number;
  location_ids: string[];
}

export interface LocationComparisonResult {
  location_id: string;
  display_name: string;
  city: string;
  state: string;
  metro_area: string;
  gross_monthly: number;
  net_monthly: number;
  rent: number;
  transportation_cost: number;
  total_expenses: number;
  monthly_leftover: number;
  housing_ratio: number;
  savings_rate: number;
  risk_level: RiskLevel;
  affordability_score: number;
  recommendation_text: string;
  tax_assumption_notes: string[];
}

export interface CompareLocationsResponse {
  results: LocationComparisonResult[];
}
