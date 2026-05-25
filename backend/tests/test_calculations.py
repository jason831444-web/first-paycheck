from app.schemas.simulation import SimulationInput
from app.services.affordability import classify_risk, rent_recommendation
from app.services.budget_calculator import run_simulation
from app.services.tax_calculator import calculate_federal_tax, calculate_fica


def sample(**overrides):
    data = {
        "annual_salary": 100000,
        "pay_frequency": "biweekly",
        "tax_year": 2026,
        "filing_status": "single",
        "work_state": "NY",
        "residence_location": "Brooklyn",
        "fica_exempt": False,
        "contribution_401k_percent": 0,
        "health_insurance_monthly": 200,
        "rent": 2500,
        "utilities": 150,
        "internet": 60,
        "phone": 60,
        "groceries": 500,
        "eating_out": 300,
        "transportation_type": "public_transit",
        "transit_cost": 132,
        "car_payment": 0,
        "car_insurance": 0,
        "gas": 0,
        "parking": 0,
        "tolls": 0,
        "subscriptions": 80,
        "gym": 70,
        "personal_spending": 350,
        "other_expenses": 100,
    }
    data.update(overrides)
    return SimulationInput(**data)


def test_federal_tax_calculation_uses_progressive_brackets():
    tax = calculate_federal_tax(sample(annual_salary=100000))
    assert 13000 < tax < 15000


def test_fica_exempt_vs_non_exempt():
    non_exempt = calculate_fica(sample(fica_exempt=False))
    exempt = calculate_fica(sample(fica_exempt=True))
    assert non_exempt == 7650
    assert exempt == 0


def test_affordability_classification():
    assert classify_risk(0.28, 0.22) == "Comfortable"
    assert classify_risk(0.34, 0.12) == "Manageable"
    assert classify_risk(0.39, 0.06) == "Tight"
    assert classify_risk(0.45, 0.03) == "Risky"


def test_rent_recommendation():
    recommendation = rent_recommendation(6000, 2100)
    assert recommendation.safe_max_rent == 1800
    assert recommendation.stretch_max_rent == 2100
    assert recommendation.current_rent_status == "Stretch"


def test_run_simulation_returns_result():
    result = run_simulation(sample(fica_exempt=True))
    assert result.net_monthly > 0
    assert result.total_expenses > 0
    assert result.rent_recommendation.current_rent_status in {"Safe", "Stretch", "Risky"}
