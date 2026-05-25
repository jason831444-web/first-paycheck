from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import city_presets, compare_locations, health, scenarios, simulate
from app.core.config import settings

app = FastAPI(title="FirstPaycheck API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(simulate.router)
app.include_router(city_presets.router)
app.include_router(compare_locations.router)
app.include_router(scenarios.router)
