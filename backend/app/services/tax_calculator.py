import json
from pathlib import Path

from app.schemas.simulation import SimulationInput

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _load_json(name: str):
    with (DATA_DIR / name).open() as file:
        return json.load(file)


def _progressive_tax(taxable_income: float, brackets: list[dict]) -> float:
    tax = 0.0
    lower = 0.0
    for bracket in brackets:
        upper = bracket["up_to"]
        rate = bracket["rate"]
        if upper is None:
            tax += max(taxable_income - lower, 0) * rate
            break
        if taxable_income > lower:
            tax += (min(taxable_income, upper) - lower) * rate
        lower = upper
        if taxable_income <= upper:
            break
    return max(tax, 0)


def calculate_federal_tax(input_data: SimulationInput) -> float:
    data = _load_json(f"federal_tax_{input_data.tax_year}.json")
    annual_401k = input_data.annual_salary * (input_data.contribution_401k_percent / 100)
    taxable_income = max(input_data.annual_salary - annual_401k - data["standard_deduction"], 0)
    return _progressive_tax(taxable_income, data["brackets"])


def calculate_fica(input_data: SimulationInput, force_non_exempt: bool = False) -> float:
    if input_data.fica_exempt and not force_non_exempt:
        return 0.0
    data = _load_json(f"fica_{input_data.tax_year}.json")
    social_security = min(input_data.annual_salary, data["social_security_wage_base"]) * data["social_security_rate"]
    medicare = input_data.annual_salary * data["medicare_rate"]
    return social_security + medicare


def calculate_state_and_local_tax(input_data: SimulationInput) -> tuple[float, float, list[str]]:
    taxable_income = max(
        input_data.annual_salary - input_data.annual_salary * (input_data.contribution_401k_percent / 100),
        0,
    )
    state_tax = 0.0
    local_tax = 0.0
    notes: list[str] = []

    if input_data.work_state == "NY":
        # Simplified effective NY estimate for MVP; replace with brackets later.
        state_tax = taxable_income * 0.055
        if input_data.residence_location in {"Manhattan", "Brooklyn"}:
            local_tax = taxable_income * 0.038
        if input_data.residence_location in {"Jersey City", "Hoboken", "NJ Suburb"}:
            state_tax = taxable_income * 0.052
            notes.append("NJ resident working in NY uses a simplified cross-state tax estimate.")
    else:
        state_tax = taxable_income * 0.045

    return state_tax, local_tax, notes


def calculate_taxes(input_data: SimulationInput) -> dict:
    federal = calculate_federal_tax(input_data)
    state, local, notes = calculate_state_and_local_tax(input_data)
    fica = calculate_fica(input_data)
    fica_non_exempt = calculate_fica(input_data, force_non_exempt=True)
    return {
        "federal_annual": federal,
        "state_annual": state,
        "local_annual": local,
        "fica_annual": fica,
        "fica_exemption_annual_value": max(fica_non_exempt - fica, 0),
        "notes": notes,
    }
