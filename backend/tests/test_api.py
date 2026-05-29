import json
import os
from pathlib import Path

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.db.base import Base
from app.db.session import engine
from app.main import app
from tests.test_calculations import sample


Base.metadata.create_all(bind=engine)
client = TestClient(app)
DATA_DIR = Path(__file__).resolve().parents[1] / "app" / "data"


def load_data_file(name: str):
    with (DATA_DIR / name).open() as file:
        return json.load(file)


def test_simulate_endpoint():
    response = client.post("/api/simulate", json=sample(fica_exempt=True).model_dump())
    assert response.status_code == 200
    payload = response.json()
    assert payload["net_monthly"] > 0
    assert payload["fica_monthly"] == 0
    assert "risk_level" in payload


def compare_payload(**overrides):
    data = {
        "annual_salary": 105000,
        "pay_frequency": "biweekly",
        "tax_year": 2026,
        "filing_status": "single",
        "work_state": "NY",
        "fica_exempt": True,
        "contribution_401k_percent": 0,
        "health_insurance_monthly": 150,
        "location_ids": ["new-york-ny", "brooklyn-ny", "jersey-city-nj"],
    }
    data.update(overrides)
    return data


def test_city_presets_returns_major_us_locations():
    response = client.get("/api/city-presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) > 5
    assert {"id", "display_name", "city", "state", "metro_area", "region", "estimated_rent", "transportation_type", "notes"} <= set(presets[0])


def test_state_tax_data_includes_all_states_and_dc():
    expected_states = {
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
    }
    tax_states = {item["state"] for item in load_data_file("state_tax_2026.json")}
    assert tax_states == expected_states


def test_every_city_preset_state_has_state_tax_rule():
    tax_states = {item["state"] for item in load_data_file("state_tax_2026.json")}
    preset_states = {item["state"] for item in load_data_file("city_presets.json")}
    assert preset_states <= tax_states


def test_compare_locations_endpoint_returns_selected_results():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["new-york-ny", "austin-tx"]))
    assert response.status_code == 200
    results = response.json()["results"]
    assert [item["location_id"] for item in results] == ["new-york-ny", "austin-tx"]
    assert all(item["net_monthly"] > 0 for item in results)


def test_compare_locations_rejects_unknown_location():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["new-york-ny", "unknown-city"]))
    assert response.status_code == 400
    assert "Unknown location preset" in response.json()["detail"]


def test_compare_locations_rejects_fewer_than_two_locations():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["new-york-ny"]))
    assert response.status_code == 400
    assert "Select at least two locations to compare" in response.text


def test_compare_locations_applies_nyc_local_tax_for_manhattan_and_brooklyn():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["new-york-ny", "jersey-city-nj"]))
    assert response.status_code == 200
    payload = response.json()["results"]
    manhattan = next(item for item in payload if item["location_id"] == "new-york-ny")
    jersey_city = next(item for item in payload if item["location_id"] == "jersey-city-nj")
    assert manhattan["net_monthly"] < jersey_city["net_monthly"]
    assert any("NYC local tax" in note for note in manhattan["tax_assumption_notes"])


def test_compare_locations_uses_state_tax_data_for_progressive_states():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["san-francisco-ca", "seattle-wa"]))
    assert response.status_code == 200
    california = next(item for item in response.json()["results"] if item["state"] == "CA")
    assert any("progressive 2026 brackets" in note for note in california["tax_assumption_notes"])


def test_no_state_income_tax_locations_do_not_add_state_tax_estimate():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["austin-tx", "miami-fl", "seattle-wa"]))
    assert response.status_code == 200
    for item in response.json()["results"]:
        assert any("no broad-based wage income tax" in note for note in item["tax_assumption_notes"])


def test_simulate_endpoint_works_for_representative_states():
    for state, location, expected_state_tax in [
        ("CA", "San Francisco, CA", True),
        ("TX", "Austin, TX", False),
        ("WA", "Seattle, WA", False),
        ("NY", "New York, NY", True),
        ("NJ", "Jersey City, NJ", True),
        ("MA", "Boston, MA", True),
        ("DC", "Washington, DC", True),
    ]:
        payload = sample(
            work_state=state,
            residence_state=state,
            residence_location=location,
            fica_exempt=True,
        ).model_dump()
        response = client.post("/api/simulate", json=payload)
        assert response.status_code == 200
        body = response.json()
        assert body["state_tax_monthly"] > 0 if expected_state_tax else body["state_tax_monthly"] == 0
        assert body["tax_assumption_notes"]


def saved_plan_payload(**overrides):
    payload = sample(fica_exempt=True).model_dump()
    mapped_input = payload.copy()
    payload.update(
        {
            "name": "NYC budget with car",
            "active_sections": ["food", "car", "custom"],
            "section_values": {
                "annual_salary": 100000,
                "coffee": 45,
                "car_payment": 350,
                "custom_expenses": [{"id": "row-1", "name": "Therapy", "amount": 120}],
            },
            "custom_expenses": [{"id": "row-1", "name": "Therapy", "amount": 120}],
            "mapped_input": mapped_input,
            "result_data": {"net_monthly": 6000, "monthly_leftover": 1200, "risk_level": "Manageable"},
        }
    )
    payload.update(overrides)
    return payload


def test_create_scenario_preserves_full_budget_plan_state():
    response = client.post("/api/scenarios", json=saved_plan_payload())
    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "NYC budget with car"
    assert payload["active_sections"] == ["food", "car", "custom"]
    assert payload["section_values"]["coffee"] == 45
    assert payload["custom_expenses"][0]["name"] == "Therapy"
    assert payload["mapped_input"]["annual_salary"] == 100000
    assert payload["result_data"]["risk_level"] == "Manageable"
    assert payload["result"]["net_monthly"] > 0


def test_list_and_get_saved_scenarios_return_json_state():
    created = client.post("/api/scenarios", json=saved_plan_payload(name="Plan to retrieve")).json()
    list_response = client.get("/api/scenarios")
    assert list_response.status_code == 200
    assert any(item["id"] == created["id"] for item in list_response.json())

    get_response = client.get(f"/api/scenarios/{created['id']}")
    assert get_response.status_code == 200
    payload = get_response.json()
    assert payload["active_sections"] == ["food", "car", "custom"]
    assert payload["section_values"]["custom_expenses"][0]["amount"] == 120


def test_delete_saved_scenario():
    created = client.post("/api/scenarios", json=saved_plan_payload(name="Delete me")).json()
    delete_response = client.delete(f"/api/scenarios/{created['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/scenarios/{created['id']}").status_code == 404


def test_create_scenario_without_json_fields_is_backward_compatible():
    response = client.post("/api/scenarios", json=sample().model_dump())
    assert response.status_code == 201
    payload = response.json()
    assert payload["active_sections"] is None
    assert payload["section_values"] is None
    assert payload["custom_expenses"] is None
    assert payload["mapped_input"]["annual_salary"] == 100000


def test_duplicate_saved_scenario_copies_budget_plan_state():
    created = client.post("/api/scenarios", json=saved_plan_payload(name="Original plan")).json()
    duplicate_response = client.post(f"/api/scenarios/{created['id']}/duplicate")
    assert duplicate_response.status_code == 201
    duplicate = duplicate_response.json()
    assert duplicate["name"] == "Copy of Original plan"
    assert duplicate["id"] != created["id"]
    assert duplicate["active_sections"] == created["active_sections"]
    assert duplicate["custom_expenses"] == created["custom_expenses"]


def what_if_payload(**overrides):
    payload = {"base_input": sample(fica_exempt=True).model_dump()}
    payload.update(overrides)
    return payload


def test_what_if_endpoint_returns_base_and_default_scenarios():
    response = client.post("/api/what-if", json=what_if_payload())
    assert response.status_code == 200
    payload = response.json()
    assert payload["base_result"]["monthly_leftover"] > 0
    assert len(payload["results"]) > 0
    assert {"id", "label", "result", "monthly_leftover_delta", "insight"} <= set(payload["results"][0])


def test_what_if_rent_increase_reduces_monthly_leftover():
    base_input = sample(fica_exempt=True).model_dump()
    response = client.post(
        "/api/what-if",
        json=what_if_payload(
            base_input=base_input,
            scenarios=[
                {
                    "id": "rent_plus_300",
                    "label": "Rent +$300",
                    "description": "Your rent increases by $300 per month.",
                    "patch": {"rent": base_input["rent"] + 300},
                }
            ],
        ),
    )
    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["monthly_leftover_delta"] == -300
    assert result["result"]["monthly_leftover"] < response.json()["base_result"]["monthly_leftover"]


def test_what_if_salary_decrease_reduces_net_monthly_income():
    base_input = sample(fica_exempt=True).model_dump()
    response = client.post(
        "/api/what-if",
        json=what_if_payload(
            base_input=base_input,
            scenarios=[
                {
                    "id": "salary_minus_10000",
                    "label": "Salary -$10k",
                    "description": "Your annual salary is $10,000 lower.",
                    "patch": {"annual_salary": base_input["annual_salary"] - 10000},
                }
            ],
        ),
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["results"][0]["result"]["net_monthly"] < payload["base_result"]["net_monthly"]
    assert payload["results"][0]["monthly_leftover_delta"] < 0


def test_what_if_fica_removed_increases_tax_burden_when_exempt():
    response = client.post("/api/what-if", json=what_if_payload())
    assert response.status_code == 200
    payload = response.json()
    fica_removed = next(item for item in payload["results"] if item["id"] == "fica_removed")
    assert payload["base_result"]["fica_monthly"] == 0
    assert fica_removed["result"]["fica_monthly"] > payload["base_result"]["fica_monthly"]
    assert fica_removed["result"]["net_monthly"] < payload["base_result"]["net_monthly"]


def test_what_if_ignores_unknown_patch_fields_safely():
    base_input = sample(fica_exempt=True).model_dump()
    response = client.post(
        "/api/what-if",
        json=what_if_payload(
            base_input=base_input,
            scenarios=[
                {
                    "id": "unknown_patch",
                    "label": "Unknown patch",
                    "description": "Unknown fields should be ignored.",
                    "patch": {"not_a_field": 999, "rent": base_input["rent"] + 100},
                }
            ],
        ),
    )
    assert response.status_code == 200
    assert response.json()["results"][0]["monthly_leftover_delta"] == -100


def test_what_if_generated_scenarios_do_not_create_negative_salary_or_rent():
    low_input = sample(fica_exempt=False, annual_salary=9000, rent=100).model_dump()
    response = client.post("/api/what-if", json=what_if_payload(base_input=low_input))
    assert response.status_code == 200
    scenario_ids = {item["id"] for item in response.json()["results"]}
    assert "salary_minus_10000" not in scenario_ids
    rent_minus = next(item for item in response.json()["results"] if item["id"] == "rent_minus_300")
    assert rent_minus["result"]["expense_breakdown"]["housing"] >= 0


def test_what_if_endpoint_validates_request_body():
    response = client.post("/api/what-if", json={})
    assert response.status_code == 422
