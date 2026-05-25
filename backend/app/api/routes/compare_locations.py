from fastapi import APIRouter

from app.schemas.comparison import CompareLocationsRequest, CompareLocationsResponse
from app.services.location_comparison import compare_locations

router = APIRouter(prefix="/api", tags=["location comparison"])


@router.post("/compare-locations", response_model=CompareLocationsResponse)
def compare_selected_locations(payload: CompareLocationsRequest):
    return compare_locations(payload)
