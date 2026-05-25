from pydantic import BaseModel


class CityPreset(BaseModel):
    key: str
    name: str
    residence_location: str
    transportation_type: str
    estimated_rent: float
    utilities: float
    internet: float
    phone: float
    groceries: float
    eating_out: float
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
