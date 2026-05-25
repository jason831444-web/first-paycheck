import json
from pathlib import Path

from app.schemas.city_preset import CityPreset, CityPresetSummary

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "city_presets.json"


def get_city_presets() -> list[CityPreset]:
    with DATA_FILE.open() as file:
        return [CityPreset(**item) for item in json.load(file)]


def get_city_preset_summaries() -> list[CityPresetSummary]:
    return [
        CityPresetSummary(
            id=preset.id,
            display_name=preset.display_name,
            city=preset.city,
            state=preset.state,
            metro_area=preset.metro_area,
            region=preset.region,
            estimated_rent=preset.rent,
            transportation_type=preset.transportation_type,
            notes=preset.notes,
        )
        for preset in get_city_presets()
    ]
