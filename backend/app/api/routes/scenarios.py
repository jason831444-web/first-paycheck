from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.result import SimulationResult
from app.models.scenario import SimulationScenario
from app.schemas.scenario import ScenarioCreate, ScenarioRead
from app.services.budget_calculator import run_simulation

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.post("", response_model=ScenarioRead, status_code=status.HTTP_201_CREATED)
def save_scenario(payload: ScenarioCreate, db: Session = Depends(get_db)):
    scenario = SimulationScenario(**payload.model_dump(exclude={"residence_state"}))
    db.add(scenario)
    db.flush()
    calculated = run_simulation(payload)
    result = SimulationResult(
        scenario_id=scenario.id,
        gross_monthly=calculated.gross_monthly,
        federal_tax_monthly=calculated.federal_tax_monthly,
        state_tax_monthly=calculated.state_tax_monthly,
        local_tax_monthly=calculated.local_tax_monthly,
        fica_monthly=calculated.fica_monthly,
        contribution_401k_monthly=calculated.contribution_401k_monthly,
        health_insurance_monthly=calculated.health_insurance_monthly,
        net_monthly=calculated.net_monthly,
        total_expenses=calculated.total_expenses,
        monthly_leftover=calculated.monthly_leftover,
        savings_rate=calculated.savings_rate,
        housing_ratio=calculated.housing_ratio,
        transportation_ratio=calculated.transportation_ratio,
        affordability_score=calculated.affordability_score,
        risk_level=calculated.risk_level,
        recommendation_text=calculated.recommendation_text,
    )
    db.add(result)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.get("", response_model=list[ScenarioRead])
def list_scenarios(db: Session = Depends(get_db)):
    return db.query(SimulationScenario).order_by(SimulationScenario.created_at.desc()).all()


@router.get("/{scenario_id}", response_model=ScenarioRead)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.get(SimulationScenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.get(SimulationScenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    db.delete(scenario)
    db.commit()
