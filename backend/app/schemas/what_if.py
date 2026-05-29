from typing import Any

from pydantic import BaseModel, Field

from app.schemas.simulation import SimulationInput, SimulationResultOut


class WhatIfScenario(BaseModel):
    id: str
    label: str
    description: str
    patch: dict[str, Any] = Field(default_factory=dict)


class WhatIfRequest(BaseModel):
    base_input: SimulationInput
    scenarios: list[WhatIfScenario] | None = None


class WhatIfResult(BaseModel):
    id: str
    label: str
    description: str
    result: SimulationResultOut
    monthly_leftover_delta: float
    risk_changed: bool
    insight: str


class WhatIfResponse(BaseModel):
    base_result: SimulationResultOut
    results: list[WhatIfResult]
