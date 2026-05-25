from app.schemas.simulation import RentRecommendation


def classify_risk(housing_ratio: float, savings_rate: float) -> str:
    if housing_ratio <= 0.30 and savings_rate >= 0.20:
        return "Comfortable"
    if housing_ratio <= 0.35 and savings_rate >= 0.10:
        return "Manageable"
    if housing_ratio <= 0.40 and savings_rate >= 0.05:
        return "Tight"
    return "Risky"


def score_affordability(housing_ratio: float, savings_rate: float, transportation_ratio: float) -> int:
    score = 100
    score -= max(housing_ratio - 0.30, 0) * 180
    score -= max(0.20 - savings_rate, 0) * 160
    score -= max(transportation_ratio - 0.15, 0) * 100
    return round(max(min(score, 100), 0))


def rent_recommendation(net_monthly: float, rent: float) -> RentRecommendation:
    safe = net_monthly * 0.30
    stretch = net_monthly * 0.35
    if rent <= safe:
        status = "Safe"
    elif rent <= stretch:
        status = "Stretch"
    else:
        status = "Risky"
    return RentRecommendation(safe_max_rent=round(safe, 2), stretch_max_rent=round(stretch, 2), current_rent_status=status)


def recommendation_text(risk: str, housing_ratio: float, savings_rate: float) -> str:
    rent_pct = round(housing_ratio * 100)
    savings_pct = round(savings_rate * 100)
    if risk == "Comfortable":
        return f"This plan looks comfortable: rent takes about {rent_pct}% of estimated take-home pay and leaves a {savings_pct}% savings rate."
    if risk == "Manageable":
        return f"This apartment is manageable, but rent takes {rent_pct}% of estimated take-home pay. Keep transportation and food spending controlled."
    if risk == "Tight":
        return f"This plan is tight. Rent uses about {rent_pct}% of take-home pay and leaves only a {savings_pct}% savings rate."
    return f"This plan is risky. Rent and recurring expenses leave a limited cushion, with rent at about {rent_pct}% of take-home pay."
