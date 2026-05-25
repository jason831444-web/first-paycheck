from fastapi import APIRouter

from app.schemas.city_preset import CityPresetSummary
from app.services.city_presets import get_city_preset_summaries

router = APIRouter(prefix="/api", tags=["city presets"])


@router.get("/city-presets", response_model=list[CityPresetSummary])
def city_presets():
    return get_city_preset_summaries()
