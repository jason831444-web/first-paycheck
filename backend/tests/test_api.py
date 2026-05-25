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
