from pydantic import BaseModel, Field, model_validator

from app.schemas.simulation import FilingStatus, PayFrequency, WorkState


class CompareLocationsRequest(BaseModel):
    annual_salary: float = Field(default=105000, gt=0)
    pay_frequency: PayFrequency = "biweekly"
    tax_year: int = 2026
    filing_status: FilingStatus = "single"
    work_state: WorkState = "NY"
    fica_exempt: bool = True
    contribution_401k_percent: float = Field(default=0, ge=0, le=100)
    health_insurance_monthly: float = Field(default=150, ge=0)
    locations: list[str]

    @model_validator(mode="after")
    def require_multiple_locations(self):
        unique_locations = list(dict.fromkeys(self.locations))
        if len(unique_locations) < 2:
            raise ValueError("Select at least two locations to compare.")
        self.locations = unique_locations
        return self


class LocationComparisonResult(BaseModel):
    location: str
    preset_name: str
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


class CompareLocationsResponse(BaseModel):
    results: list[LocationComparisonResult]
