from fastapi import APIRouter

from app.schemas.insights import InsightsRequest, InsightsResponse
from app.services.insights import generate_advisor_insights

router = APIRouter(prefix="/api", tags=["insights"])


@router.post("/insights", response_model=InsightsResponse)
def advisor_insights(request: InsightsRequest):
    return generate_advisor_insights(request)
