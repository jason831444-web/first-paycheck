from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_id: Mapped[int] = mapped_column(ForeignKey("simulation_scenarios.id", ondelete="CASCADE"))
    gross_monthly: Mapped[float] = mapped_column(Float)
    federal_tax_monthly: Mapped[float] = mapped_column(Float)
    state_tax_monthly: Mapped[float] = mapped_column(Float)
    local_tax_monthly: Mapped[float] = mapped_column(Float)
    fica_monthly: Mapped[float] = mapped_column(Float)
    contribution_401k_monthly: Mapped[float] = mapped_column(Float)
    health_insurance_monthly: Mapped[float] = mapped_column(Float)
    net_monthly: Mapped[float] = mapped_column(Float)
    total_expenses: Mapped[float] = mapped_column(Float)
    monthly_leftover: Mapped[float] = mapped_column(Float)
    savings_rate: Mapped[float] = mapped_column(Float)
    housing_ratio: Mapped[float] = mapped_column(Float)
    transportation_ratio: Mapped[float] = mapped_column(Float)
    affordability_score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(32))
    recommendation_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    scenario = relationship("SimulationScenario", back_populates="result")
