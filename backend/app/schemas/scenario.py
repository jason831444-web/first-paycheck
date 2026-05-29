from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.schemas.result import ResultRead
from app.schemas.simulation import SimulationInput


class ScenarioCreate(SimulationInput):
    active_sections: list[str] | None = None
    section_values: dict[str, Any] | None = None
    custom_expenses: list[dict[str, Any]] | None = None
    mapped_input: dict[str, Any] | None = None
    result_data: dict[str, Any] | None = None


class ScenarioUpdate(BaseModel):
    name: str | None = None
    active_sections: list[str] | None = None
    section_values: dict[str, Any] | None = None
    custom_expenses: list[dict[str, Any]] | None = None
    mapped_input: dict[str, Any] | None = None
    result_data: dict[str, Any] | None = None


class ScenarioRead(SimulationInput):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime | None = None
    active_sections: list[str] | None = None
    section_values: dict[str, Any] | None = None
    custom_expenses: list[dict[str, Any]] | None = None
    mapped_input: dict[str, Any] | None = None
    result_data: dict[str, Any] | None = None
    result: ResultRead | None = None
