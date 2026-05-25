from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scenario_id: int
    gross_monthly: float
    federal_tax_monthly: float
    state_tax_monthly: float
    local_tax_monthly: float
    fica_monthly: float
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
    created_at: datetime
