from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="Untitled scenario")
    annual_salary: Mapped[float] = mapped_column(Float)
    pay_frequency: Mapped[str] = mapped_column(String(32))
    tax_year: Mapped[int] = mapped_column(Integer, default=2026)
    filing_status: Mapped[str] = mapped_column(String(32), default="single")
    work_state: Mapped[str] = mapped_column(String(8))
    residence_location: Mapped[str] = mapped_column(String(64))
    fica_exempt: Mapped[bool] = mapped_column(Boolean, default=False)
    contribution_401k_percent: Mapped[float] = mapped_column(Float, default=0)
    health_insurance_monthly: Mapped[float] = mapped_column(Float, default=0)
    rent: Mapped[float] = mapped_column(Float, default=0)
    utilities: Mapped[float] = mapped_column(Float, default=0)
    internet: Mapped[float] = mapped_column(Float, default=0)
    phone: Mapped[float] = mapped_column(Float, default=0)
    groceries: Mapped[float] = mapped_column(Float, default=0)
    eating_out: Mapped[float] = mapped_column(Float, default=0)
    transportation_type: Mapped[str] = mapped_column(String(32), default="public_transit")
    transit_cost: Mapped[float] = mapped_column(Float, default=0)
    car_payment: Mapped[float] = mapped_column(Float, default=0)
    car_insurance: Mapped[float] = mapped_column(Float, default=0)
    gas: Mapped[float] = mapped_column(Float, default=0)
    parking: Mapped[float] = mapped_column(Float, default=0)
    tolls: Mapped[float] = mapped_column(Float, default=0)
    subscriptions: Mapped[float] = mapped_column(Float, default=0)
    gym: Mapped[float] = mapped_column(Float, default=0)
    personal_spending: Mapped[float] = mapped_column(Float, default=0)
    other_expenses: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    active_sections: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    section_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    custom_expenses: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    mapped_input: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    result_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    result = relationship("SimulationResult", back_populates="scenario", uselist=False, cascade="all, delete-orphan")
