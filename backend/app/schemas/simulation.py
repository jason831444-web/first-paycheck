from typing import Literal

from pydantic import BaseModel, Field

PayFrequency = Literal["monthly", "semi_monthly", "biweekly"]
FilingStatus = Literal["single"]
WorkState = Literal["NY", "NJ"]
ResidenceLocation = Literal["Manhattan", "Brooklyn", "Jersey City", "Hoboken", "NJ Suburb"]
TransportationType = Literal["public_transit", "car", "hybrid"]


class SimulationInput(BaseModel):
    name: str | None = "Untitled scenario"
    annual_salary: float = Field(gt=0)
    pay_frequency: PayFrequency = "biweekly"
    tax_year: int = 2026
    filing_status: FilingStatus = "single"
    work_state: WorkState
    residence_location: ResidenceLocation
    fica_exempt: bool = False
    contribution_401k_percent: float = Field(default=0, ge=0, le=100)
    health_insurance_monthly: float = Field(default=0, ge=0)
    rent: float = Field(default=0, ge=0)
    utilities: float = Field(default=0, ge=0)
    internet: float = Field(default=0, ge=0)
    phone: float = Field(default=0, ge=0)
    groceries: float = Field(default=0, ge=0)
    eating_out: float = Field(default=0, ge=0)
    transportation_type: TransportationType = "public_transit"
    transit_cost: float = Field(default=0, ge=0)
    car_payment: float = Field(default=0, ge=0)
    car_insurance: float = Field(default=0, ge=0)
    gas: float = Field(default=0, ge=0)
    parking: float = Field(default=0, ge=0)
    tolls: float = Field(default=0, ge=0)
    subscriptions: float = Field(default=0, ge=0)
    gym: float = Field(default=0, ge=0)
    personal_spending: float = Field(default=0, ge=0)
    other_expenses: float = Field(default=0, ge=0)


class RentRecommendation(BaseModel):
    safe_max_rent: float
    stretch_max_rent: float
    current_rent_status: str


class SimulationResultOut(BaseModel):
    gross_monthly: float
    federal_tax_monthly: float
    state_tax_monthly: float
    local_tax_monthly: float
    fica_monthly: float
    fica_exemption_monthly_value: float
    contribution_401k_monthly: float
    health_insurance_monthly: float
    net_monthly: float
    total_expenses: float
    monthly_leftover: float
    savings_rate: float
    housing_ratio: float
    transportation_ratio: float
    affordability_score: int
    risk_level: str
    recommendation_text: str
    rent_recommendation: RentRecommendation
    expense_breakdown: dict[str, float]
    notes: list[str] = []
