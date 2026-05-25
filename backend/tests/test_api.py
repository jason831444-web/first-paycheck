import os

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"

from app.main import app
from tests.test_calculations import sample


client = TestClient(app)


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


def test_compare_locations_uses_state_tax_fallback_for_non_detailed_states():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["san-francisco-ca", "seattle-wa"]))
    assert response.status_code == 200
    california = next(item for item in response.json()["results"] if item["state"] == "CA")
    assert any("effective rate preset" in note for note in california["tax_assumption_notes"])


def test_no_state_income_tax_locations_do_not_add_state_tax_estimate():
    response = client.post("/api/compare-locations", json=compare_payload(location_ids=["austin-tx", "miami-fl", "seattle-wa"]))
    assert response.status_code == 200
    for item in response.json()["results"]:
        assert any("no state income tax" in note for note in item["tax_assumption_notes"])
