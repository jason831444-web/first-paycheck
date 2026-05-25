from fastapi import APIRouter

from app.schemas.city_preset import CityPreset
from app.services.city_presets import get_city_presets

router = APIRouter(prefix="/api", tags=["city presets"])


@router.get("/city-presets", response_model=list[CityPreset])
def city_presets():
    return get_city_presets()
