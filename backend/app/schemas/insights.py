from typing import Literal

from pydantic import BaseModel

from app.schemas.simulation import SimulationInput, SimulationResultOut

InsightSeverity = Literal["positive", "info", "warning", "critical"]
InsightCategory = Literal[
    "Housing",
    "Savings",
    "Transportation",
    "Food and lifestyle",
    "Taxes and FICA",
    "Emergency fund",
    "Debt and obligations",
    "Overall budget health",
]


class AdvisorInsight(BaseModel):
    id: str
    title: str
    severity: InsightSeverity
    category: InsightCategory
    message: str
    suggested_action: str
    estimated_monthly_impact: float | None = None
    metric_label: str | None = None
    metric_value: str | None = None


class InsightsRequest(BaseModel):
    input: SimulationInput
    result: SimulationResultOut


class InsightsResponse(BaseModel):
    insights: list[AdvisorInsight]
