from app.schemas.simulation import SimulationInput, SimulationResultOut
from app.services.affordability import classify_risk, recommendation_text, rent_recommendation, score_affordability
from app.services.tax_calculator import calculate_taxes


def calculate_expenses(input_data: SimulationInput) -> dict[str, float]:
    return {
        "housing": input_data.rent + input_data.utilities + input_data.internet,
        "phone": input_data.phone,
        "food": input_data.groceries + input_data.eating_out,
        "transportation": input_data.transit_cost
        + input_data.car_payment
        + input_data.car_insurance
        + input_data.gas
        + input_data.parking
        + input_data.tolls,
        "lifestyle": input_data.subscriptions + input_data.gym + input_data.personal_spending,
        "other": input_data.other_expenses,
    }


def run_simulation(input_data: SimulationInput) -> SimulationResultOut:
    taxes = calculate_taxes(input_data)
    gross_monthly = input_data.annual_salary / 12
    contribution_401k_monthly = gross_monthly * (input_data.contribution_401k_percent / 100)
    total_tax_monthly = (
        taxes["federal_annual"] + taxes["state_annual"] + taxes["local_annual"] + taxes["fica_annual"]
    ) / 12
    net_monthly = gross_monthly - total_tax_monthly - contribution_401k_monthly - input_data.health_insurance_monthly
    expense_breakdown = calculate_expenses(input_data)
    total_expenses = sum(expense_breakdown.values())
    monthly_leftover = net_monthly - total_expenses
    housing_ratio = (input_data.rent + input_data.utilities + input_data.internet) / net_monthly if net_monthly > 0 else 1
    transportation_ratio = expense_breakdown["transportation"] / net_monthly if net_monthly > 0 else 1
    savings_rate = monthly_leftover / net_monthly if net_monthly > 0 else -1
    risk = classify_risk(housing_ratio, savings_rate)

    return SimulationResultOut(
        gross_monthly=round(gross_monthly, 2),
        federal_tax_monthly=round(taxes["federal_annual"] / 12, 2),
        state_tax_monthly=round(taxes["state_annual"] / 12, 2),
        local_tax_monthly=round(taxes["local_annual"] / 12, 2),
        fica_monthly=round(taxes["fica_annual"] / 12, 2),
        fica_exemption_monthly_value=round(taxes["fica_exemption_annual_value"] / 12, 2),
        contribution_401k_monthly=round(contribution_401k_monthly, 2),
        health_insurance_monthly=round(input_data.health_insurance_monthly, 2),
        net_monthly=round(net_monthly, 2),
        total_expenses=round(total_expenses, 2),
        monthly_leftover=round(monthly_leftover, 2),
        savings_rate=round(savings_rate, 4),
        housing_ratio=round(housing_ratio, 4),
        transportation_ratio=round(transportation_ratio, 4),
        affordability_score=score_affordability(housing_ratio, savings_rate, transportation_ratio),
        risk_level=risk,
        recommendation_text=recommendation_text(risk, housing_ratio, savings_rate),
        rent_recommendation=rent_recommendation(net_monthly, input_data.rent),
        expense_breakdown={key: round(value, 2) for key, value in expense_breakdown.items()},
        notes=taxes["notes"],
    )
