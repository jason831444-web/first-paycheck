from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.result import ResultRead
from app.schemas.simulation import SimulationInput


class ScenarioCreate(SimulationInput):
    pass


class ScenarioRead(SimulationInput):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    result: ResultRead | None = None
