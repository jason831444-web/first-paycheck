from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.result import SimulationResult
from app.models.scenario import SimulationScenario
from app.schemas.scenario import ScenarioCreate, ScenarioRead, ScenarioUpdate
from app.services.budget_calculator import run_simulation

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])

SIMULATION_INPUT_EXCLUDES = {
    "residence_state",
    "active_sections",
    "section_values",
    "custom_expenses",
    "mapped_input",
    "result_data",
}


def result_from_calculation(scenario_id: int, calculated):
    return SimulationResult(
        scenario_id=scenario_id,
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


def scenario_column_data(payload: ScenarioCreate):
    return payload.model_dump(exclude=SIMULATION_INPUT_EXCLUDES)


@router.post("", response_model=ScenarioRead, status_code=status.HTTP_201_CREATED)
def save_scenario(payload: ScenarioCreate, db: Session = Depends(get_db)):
    calculated = run_simulation(payload)
    scenario = SimulationScenario(
        **scenario_column_data(payload),
        active_sections=payload.active_sections,
        section_values=payload.section_values,
        custom_expenses=payload.custom_expenses,
        mapped_input=payload.mapped_input or payload.model_dump(exclude={"residence_state", "active_sections", "section_values", "custom_expenses", "mapped_input", "result_data"}),
        result_data=payload.result_data or calculated.model_dump(),
    )
    db.add(scenario)
    db.flush()
    db.add(result_from_calculation(scenario.id, calculated))
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


@router.put("/{scenario_id}", response_model=ScenarioRead)
def update_scenario(scenario_id: int, payload: ScenarioUpdate, db: Session = Depends(get_db)):
    scenario = db.get(SimulationScenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(scenario, key, value)
    db.commit()
    db.refresh(scenario)
    return scenario


@router.post("/{scenario_id}/duplicate", response_model=ScenarioRead, status_code=status.HTTP_201_CREATED)
def duplicate_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.get(SimulationScenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    copied = SimulationScenario(
        name=f"Copy of {scenario.name}",
        annual_salary=scenario.annual_salary,
        pay_frequency=scenario.pay_frequency,
        tax_year=scenario.tax_year,
        filing_status=scenario.filing_status,
        work_state=scenario.work_state,
        residence_location=scenario.residence_location,
        fica_exempt=scenario.fica_exempt,
        contribution_401k_percent=scenario.contribution_401k_percent,
        health_insurance_monthly=scenario.health_insurance_monthly,
        rent=scenario.rent,
        utilities=scenario.utilities,
        internet=scenario.internet,
        phone=scenario.phone,
        groceries=scenario.groceries,
        eating_out=scenario.eating_out,
        transportation_type=scenario.transportation_type,
        transit_cost=scenario.transit_cost,
        car_payment=scenario.car_payment,
        car_insurance=scenario.car_insurance,
        gas=scenario.gas,
        parking=scenario.parking,
        tolls=scenario.tolls,
        subscriptions=scenario.subscriptions,
        gym=scenario.gym,
        personal_spending=scenario.personal_spending,
        other_expenses=scenario.other_expenses,
        active_sections=scenario.active_sections,
        section_values=scenario.section_values,
        custom_expenses=scenario.custom_expenses,
        mapped_input=scenario.mapped_input,
        result_data=scenario.result_data,
    )
    db.add(copied)
    db.flush()
    if scenario.result:
        db.add(
            SimulationResult(
                scenario_id=copied.id,
                gross_monthly=scenario.result.gross_monthly,
                federal_tax_monthly=scenario.result.federal_tax_monthly,
                state_tax_monthly=scenario.result.state_tax_monthly,
                local_tax_monthly=scenario.result.local_tax_monthly,
                fica_monthly=scenario.result.fica_monthly,
                contribution_401k_monthly=scenario.result.contribution_401k_monthly,
                health_insurance_monthly=scenario.result.health_insurance_monthly,
                net_monthly=scenario.result.net_monthly,
                total_expenses=scenario.result.total_expenses,
                monthly_leftover=scenario.result.monthly_leftover,
                savings_rate=scenario.result.savings_rate,
                housing_ratio=scenario.result.housing_ratio,
                transportation_ratio=scenario.result.transportation_ratio,
                affordability_score=scenario.result.affordability_score,
                risk_level=scenario.result.risk_level,
                recommendation_text=scenario.result.recommendation_text,
            )
        )
    db.commit()
    db.refresh(copied)
    return copied


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.get(SimulationScenario, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    db.delete(scenario)
    db.commit()
