from pydantic import BaseModel


class CityPreset(BaseModel):
    id: str
    display_name: str
    city: str
    state: str
    metro_area: str
    region: str
    rent: float
    utilities: float
    internet: float
    phone: float
    groceries: float
    eating_out: float
    transportation_type: str
    transit_cost: float
    car_payment: float
    car_insurance: float
    gas: float
    parking: float
    tolls: float
    subscriptions: float
    gym: float
    personal_spending: float
    other_expenses: float
    notes: str


class CityPresetSummary(BaseModel):
    id: str
    display_name: str
    city: str
    state: str
    metro_area: str
    region: str
    estimated_rent: float
    transportation_type: str
    notes: str
