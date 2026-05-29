from fastapi import APIRouter

from app.schemas.what_if import WhatIfRequest, WhatIfResponse
from app.services.what_if import run_what_if_analysis

router = APIRouter(prefix="/api", tags=["what-if"])


@router.post("/what-if", response_model=WhatIfResponse)
def what_if_analysis(request: WhatIfRequest):
    return run_what_if_analysis(request)
