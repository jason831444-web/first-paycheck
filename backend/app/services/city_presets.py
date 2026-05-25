import json
from pathlib import Path

from app.schemas.city_preset import CityPreset

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "city_presets.json"


def get_city_presets() -> list[CityPreset]:
    with DATA_FILE.open() as file:
        return [CityPreset(**item) for item in json.load(file)]
