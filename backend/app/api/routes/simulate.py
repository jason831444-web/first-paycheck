from fastapi import APIRouter

from app.schemas.simulation import SimulationInput, SimulationResultOut
from app.services.budget_calculator import run_simulation

router = APIRouter(prefix="/api", tags=["simulation"])


@router.post("/simulate", response_model=SimulationResultOut)
def simulate(input_data: SimulationInput):
    return run_simulation(input_data)
