import json
from pathlib import Path
from functools import lru_cache
from typing import Any

from app.schemas.simulation import SimulationInput

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _load_json(name: str):
    with (DATA_DIR / name).open() as file:
        return json.load(file)


@lru_cache
def load_state_tax_rules(tax_year: int) -> dict[str, dict[str, Any]]:
    return {item["state"]: item for item in _load_json(f"state_tax_{tax_year}.json")}


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


def calculate_progressive_tax(taxable_income: float, brackets: list[dict]) -> float:
    tax = 0.0
    for bracket in brackets:
        lower = bracket["min"]
        upper = bracket["max"]
        rate = bracket["rate"]
        if taxable_income <= lower:
            continue
        taxable_slice = taxable_income - lower if upper is None else min(taxable_income, upper) - lower
        tax += max(taxable_slice, 0) * rate
        if upper is not None and taxable_income <= upper:
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


def _residence_state(input_data: SimulationInput) -> str:
    if input_data.residence_state:
        return input_data.residence_state.upper()
    legacy_map = {
        "Manhattan": "NY",
        "Brooklyn": "NY",
        "Queens": "NY",
        "Jersey City": "NJ",
        "Hoboken": "NJ",
        "NJ Suburb": "NJ",
    }
    return legacy_map.get(input_data.residence_location, input_data.work_state).upper()


def _state_taxable_income(input_data: SimulationInput, rule: dict[str, Any]) -> float:
    annual_401k = input_data.annual_salary * (input_data.contribution_401k_percent / 100)
    deduction = rule.get("standard_deduction_single") or 0
    exemption = rule.get("personal_exemption_single") or 0
    return max(input_data.annual_salary - annual_401k - deduction - exemption, 0)


def _is_nyc_location(residence_location: str) -> bool:
    return residence_location in {"Manhattan", "Brooklyn", "Queens", "New York, NY", "Brooklyn, NY", "Queens, NY"}


def calculate_state_income_tax(input_data: SimulationInput) -> tuple[float, list[str]]:
    residence_state = _residence_state(input_data)
    rules = load_state_tax_rules(input_data.tax_year)
    rule = rules.get(residence_state)
    if not rule:
        return 0.0, [
            f"State tax for {residence_state} is not configured for {input_data.tax_year}; using $0 state tax estimate.",
            "Local city/county income taxes are not modeled except where explicitly supported.",
        ]

    tax_type = rule["tax_type"]
    taxable_income = _state_taxable_income(input_data, rule)
    notes: list[str] = []

    if tax_type == "none":
        state_tax = 0.0
        notes.append(
            f"State income tax for {residence_state} is modeled as $0 because {rule['state_name']} has no broad-based wage income tax."
        )
    elif tax_type == "flat":
        state_tax = taxable_income * (rule.get("flat_rate") or 0)
        notes.append(f"State tax for {residence_state} uses a flat-rate estimate from the 2026 state tax data file.")
    elif tax_type == "progressive":
        state_tax = calculate_progressive_tax(taxable_income, rule.get("brackets_single", []))
        notes.append(f"State tax for {residence_state} uses progressive 2026 brackets from the state tax data file.")
    else:
        state_tax = taxable_income * (rule.get("estimated_effective_rate") or 0)
        notes.append(f"State tax for {residence_state} uses an effective-rate estimate for MVP planning.")

    if input_data.work_state.upper() != residence_state:
        notes.append("Multi-state resident/nonresident credits are simplified and not fully modeled.")

    local_tax_note = rule.get("local_tax_note")
    if local_tax_note:
        notes.append(local_tax_note)
    notes.append(rule["notes"])

    return state_tax, notes


def calculate_state_and_local_tax(input_data: SimulationInput) -> tuple[float, float, list[str]]:
    taxable_income = max(
        input_data.annual_salary - input_data.annual_salary * (input_data.contribution_401k_percent / 100),
        0,
    )
    local_tax = 0.0

    residence_state = _residence_state(input_data)
    residence_location = input_data.residence_location
    state_tax, notes = calculate_state_income_tax(input_data)

    if residence_state == "NY":
        if _is_nyc_location(residence_location):
            local_tax = taxable_income * 0.038
            notes.append("NYC local tax is estimated for this location.")
        else:
            notes.append("Local city tax is not modeled for this location.")
    elif not any("Local" in note or "local" in note for note in notes):
        notes.append("Local city/county income taxes are not modeled except where explicitly supported.")

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
        "notes": [*notes, "Results are estimates for planning only."],
    }
