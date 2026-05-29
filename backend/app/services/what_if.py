from typing import Any

from pydantic import ValidationError

from app.schemas.simulation import SimulationInput, SimulationResultOut
from app.schemas.what_if import WhatIfRequest, WhatIfResponse, WhatIfResult, WhatIfScenario
from app.services.budget_calculator import run_simulation

MAX_SCENARIOS = 8


def _money(value: float) -> str:
    return f"${value:,.0f}"


def _scenario(
    scenario_id: str,
    label: str,
    description: str,
    patch: dict[str, Any],
) -> WhatIfScenario:
    return WhatIfScenario(id=scenario_id, label=label, description=description, patch=patch)


def generate_default_scenarios(base_input: SimulationInput) -> list[WhatIfScenario]:
    scenarios = [
        _scenario(
            "rent_plus_300",
            "Rent +$300",
            "Your rent increases by $300 per month.",
            {"rent": base_input.rent + 300},
        )
    ]

    if base_input.annual_salary > 10000:
        scenarios.append(
            _scenario(
                "salary_minus_10000",
                "Salary -$10k",
                "Your annual salary is $10,000 lower.",
                {"annual_salary": max(base_input.annual_salary - 10000, 1)},
            )
        )

    if base_input.fica_exempt:
        scenarios.append(
            _scenario(
                "fica_removed",
                "FICA exemption removed",
                "You become responsible for Social Security and Medicare taxes.",
                {"fica_exempt": False},
            )
        )
    else:
        scenarios.append(
            _scenario(
                "salary_plus_10000",
                "Salary +$10k",
                "Your annual salary is $10,000 higher.",
                {"annual_salary": base_input.annual_salary + 10000},
            )
        )

    current_car_costs = (
        base_input.car_payment
        + base_input.car_insurance
        + base_input.gas
        + base_input.parking
        + base_input.tolls
    )
    if current_car_costs == 0:
        scenarios.append(
            _scenario(
                "add_car",
                "Add a car",
                "You add estimated car payment, insurance, gas, and parking costs.",
                {
                    "transportation_type": "car",
                    "car_payment": 450,
                    "car_insurance": 200,
                    "gas": 120,
                    "parking": 150,
                },
            )
        )
    else:
        scenarios.append(
            _scenario(
                "car_costs_plus_500",
                "Car costs +$500",
                "Your monthly car-related costs increase by $500.",
                {"parking": base_input.parking + 500},
            )
        )

    scenarios.extend(
        [
            _scenario(
                "food_plus_200",
                "Food +$200",
                "Groceries and eating out increase by $200 per month.",
                {"groceries": base_input.groceries + 100, "eating_out": base_input.eating_out + 100},
            ),
            _scenario(
                "personal_plus_200",
                "Personal spending +$200",
                "Lifestyle and personal spending increase by $200 per month.",
                {"personal_spending": base_input.personal_spending + 200},
            ),
            _scenario(
                "rent_minus_300",
                "Rent -$300",
                "You find a place that costs $300 less per month.",
                {"rent": max(base_input.rent - 300, 0)},
            ),
            _scenario(
                "contribution_401k_plus_5",
                "401k +5%",
                "You increase your 401k contribution by 5 percentage points.",
                {"contribution_401k_percent": min(base_input.contribution_401k_percent + 5, 50)},
            ),
        ]
    )

    return scenarios[:MAX_SCENARIOS]


def _patched_input(base_input: SimulationInput, patch: dict[str, Any]) -> SimulationInput | None:
    allowed_fields = set(SimulationInput.model_fields)
    data = base_input.model_dump()
    data.update({key: value for key, value in patch.items() if key in allowed_fields})
    try:
        return SimulationInput(**data)
    except ValidationError:
        return None


def _build_insight(label: str, base_result: SimulationResultOut, result: SimulationResultOut) -> str:
    delta = result.monthly_leftover - base_result.monthly_leftover
    absolute_delta = abs(delta)

    if delta < 0:
        direction = f"reduce your monthly cushion by {_money(absolute_delta)}"
    elif delta > 0:
        direction = f"improve your monthly cushion by {_money(absolute_delta)}"
    else:
        direction = "leave your monthly cushion about the same"

    risk_note = ""
    if result.risk_level != base_result.risk_level:
        risk_note = f" and move the plan from {base_result.risk_level} to {result.risk_level}"

    return f"{label} would {direction}{risk_note}."


def run_what_if_analysis(request: WhatIfRequest) -> WhatIfResponse:
    base_result = run_simulation(request.base_input)
    scenarios = request.scenarios or generate_default_scenarios(request.base_input)
    results: list[WhatIfResult] = []

    for scenario in scenarios[:MAX_SCENARIOS]:
        input_data = _patched_input(request.base_input, scenario.patch)
        if input_data is None:
            continue

        scenario_result = run_simulation(input_data)
        delta = round(scenario_result.monthly_leftover - base_result.monthly_leftover, 2)
        results.append(
            WhatIfResult(
                id=scenario.id,
                label=scenario.label,
                description=scenario.description,
                result=scenario_result,
                monthly_leftover_delta=delta,
                risk_changed=scenario_result.risk_level != base_result.risk_level,
                insight=_build_insight(scenario.label, base_result, scenario_result),
            )
        )

    return WhatIfResponse(base_result=base_result, results=results)
