from pydantic import BaseModel, Field

from app.schemas.simulation import FilingStatus, PayFrequency


class CompareLocationsRequest(BaseModel):
    annual_salary: float = Field(default=105000, gt=0)
    pay_frequency: PayFrequency = "biweekly"
    tax_year: int = 2026
    filing_status: FilingStatus = "single"
    work_state: str = "NY"
    fica_exempt: bool = True
    contribution_401k_percent: float = Field(default=0, ge=0, le=100)
    health_insurance_monthly: float = Field(default=150, ge=0)
    location_ids: list[str]


class LocationComparisonResult(BaseModel):
    location_id: str
    display_name: str
    city: str
    state: str
    metro_area: str
    gross_monthly: float
    net_monthly: float
    rent: float
    transportation_cost: float
    total_expenses: float
    monthly_leftover: float
    housing_ratio: float
    savings_rate: float
    risk_level: str
    affordability_score: int
    recommendation_text: str
    tax_assumption_notes: list[str]


class CompareLocationsResponse(BaseModel):
    results: list[LocationComparisonResult]
