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
        "locations": ["Manhattan", "Brooklyn", "Jersey City"],
    }
    data.update(overrides)
    return data


def test_compare_locations_endpoint_returns_selected_results():
    response = client.post("/api/compare-locations", json=compare_payload(locations=["Manhattan", "Brooklyn"]))
    assert response.status_code == 200
    results = response.json()["results"]
    assert [item["location"] for item in results] == ["Manhattan", "Brooklyn"]
    assert all(item["net_monthly"] > 0 for item in results)


def test_compare_locations_rejects_unknown_location():
    response = client.post("/api/compare-locations", json=compare_payload(locations=["Manhattan", "Queens"]))
    assert response.status_code == 400
    assert "Unknown location preset" in response.json()["detail"]


def test_compare_locations_rejects_fewer_than_two_locations():
    response = client.post("/api/compare-locations", json=compare_payload(locations=["Manhattan"]))
    assert response.status_code == 422
    assert "Select at least two locations to compare" in response.text


def test_compare_locations_applies_nyc_local_tax_for_manhattan_and_brooklyn():
    response = client.post("/api/compare-locations", json=compare_payload(locations=["Manhattan", "Jersey City"]))
    assert response.status_code == 200
    payload = response.json()["results"]
    manhattan = next(item for item in payload if item["location"] == "Manhattan")
    jersey_city = next(item for item in payload if item["location"] == "Jersey City")
    assert manhattan["net_monthly"] < jersey_city["net_monthly"]
