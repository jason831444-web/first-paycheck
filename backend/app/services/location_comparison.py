from fastapi import HTTPException

from app.schemas.comparison import CompareLocationsRequest, CompareLocationsResponse, LocationComparisonResult
from app.schemas.simulation import SimulationInput
from app.services.budget_calculator import run_simulation
from app.services.city_presets import get_city_presets


def compare_locations(payload: CompareLocationsRequest) -> CompareLocationsResponse:
    presets_by_location = {preset.residence_location: preset for preset in get_city_presets()}
    missing = [location for location in payload.locations if location not in presets_by_location]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown location preset: {', '.join(missing)}")

    results: list[LocationComparisonResult] = []
    for location in payload.locations:
        preset = presets_by_location[location]
        simulation_input = SimulationInput(
            annual_salary=payload.annual_salary,
            pay_frequency=payload.pay_frequency,
            tax_year=payload.tax_year,
            filing_status=payload.filing_status,
            work_state=payload.work_state,
            residence_location=preset.residence_location,
            fica_exempt=payload.fica_exempt,
            contribution_401k_percent=payload.contribution_401k_percent,
            health_insurance_monthly=payload.health_insurance_monthly,
            rent=preset.estimated_rent,
            utilities=preset.utilities,
            internet=preset.internet,
            phone=preset.phone,
            groceries=preset.groceries,
            eating_out=preset.eating_out,
            transportation_type=preset.transportation_type,
            transit_cost=preset.transit_cost,
            car_payment=preset.car_payment,
            car_insurance=preset.car_insurance,
            gas=preset.gas,
            parking=preset.parking,
            tolls=preset.tolls,
            subscriptions=preset.subscriptions,
            gym=preset.gym,
            personal_spending=preset.personal_spending,
            other_expenses=preset.other_expenses,
        )
        result = run_simulation(simulation_input)
        results.append(
            LocationComparisonResult(
                location=preset.residence_location,
                preset_name=preset.name,
                gross_monthly=result.gross_monthly,
                net_monthly=result.net_monthly,
                rent=preset.estimated_rent,
                transportation_cost=result.expense_breakdown["transportation"],
                total_expenses=result.total_expenses,
                monthly_leftover=result.monthly_leftover,
                housing_ratio=result.housing_ratio,
                savings_rate=result.savings_rate,
                risk_level=result.risk_level,
                affordability_score=result.affordability_score,
                recommendation_text=result.recommendation_text,
            )
        )

    return CompareLocationsResponse(results=results)
