from app.schemas.insights import AdvisorInsight, InsightsRequest, InsightsResponse

MAX_INSIGHTS = 7
SEVERITY_RANK = {"critical": 0, "warning": 1, "info": 2, "positive": 3}


def _percent(value: float) -> str:
    return f"{round(value * 100)}%"


def _money(value: float) -> str:
    return f"${value:,.0f}"


def _transportation_cost(request: InsightsRequest) -> float:
    input_data = request.input
    breakdown = request.result.expense_breakdown or {}
    return breakdown.get(
        "transportation",
        input_data.transit_cost
        + input_data.car_payment
        + input_data.car_insurance
        + input_data.gas
        + input_data.parking
        + input_data.tolls,
    )


def _housing_insight(request: InsightsRequest) -> AdvisorInsight:
    result = request.result
    ratio = result.housing_ratio
    safe_rent = max(result.net_monthly * 0.3, 0)
    current_housing = request.input.rent + request.input.utilities + request.input.internet
    reduction_needed = max(current_housing - safe_rent, 0)

    if ratio <= 0.3:
        return AdvisorInsight(
            id="housing_safe",
            title="Housing is within a safer range.",
            severity="positive",
            category="Housing",
            message=f"Your housing ratio is {_percent(ratio)}, which is at or below the common 30% planning target.",
            suggested_action="Keep this rent discipline as you compare neighborhoods and apartment tradeoffs.",
            metric_label="Housing ratio",
            metric_value=_percent(ratio),
        )

    if ratio <= 0.35:
        severity = "info"
        title = "Rent is slightly above the safe target."
        message = f"Your housing ratio is {_percent(ratio)}, a bit above the safer 30% target."
    elif ratio <= 0.4:
        severity = "warning"
        title = "Rent is your biggest pressure point."
        message = f"Your housing ratio is {_percent(ratio)}, which makes this budget rent-heavy."
    else:
        severity = "critical"
        title = "Rent is too high relative to take-home pay."
        message = f"Your housing ratio is {_percent(ratio)}, well above the safer 30% target."

    return AdvisorInsight(
        id="housing_pressure",
        title=title,
        severity=severity,
        category="Housing",
        message=message,
        suggested_action=f"Lowering housing costs by about {_money(reduction_needed)} would move this plan closer to the safe range.",
        estimated_monthly_impact=round(reduction_needed, 2),
        metric_label="Housing ratio",
        metric_value=_percent(ratio),
    )


def _savings_insight(request: InsightsRequest) -> AdvisorInsight:
    result = request.result
    rate = result.savings_rate

    if result.monthly_leftover < 0:
        return AdvisorInsight(
            id="negative_leftover",
            title="This plan spends more than it brings in.",
            severity="critical",
            category="Savings",
            message=f"Your monthly leftover is {_money(result.monthly_leftover)}, so the budget is negative before surprises.",
            suggested_action="Reduce rent, transportation, or flexible spending before relying on this plan.",
            estimated_monthly_impact=round(abs(result.monthly_leftover), 2),
            metric_label="Monthly leftover",
            metric_value=_money(result.monthly_leftover),
        )

    if rate >= 0.2:
        return AdvisorInsight(
            id="healthy_savings_rate",
            title="Your budget has a healthy cushion.",
            severity="positive",
            category="Savings",
            message=f"Your estimated savings rate is {_percent(rate)}, which is above a strong 20% planning target.",
            suggested_action="Consider building a 3-6 month emergency fund or increasing long-term savings.",
            metric_label="Savings rate",
            metric_value=_percent(rate),
        )
    if rate >= 0.1:
        return AdvisorInsight(
            id="moderate_savings_rate",
            title="Your savings rate is workable.",
            severity="info",
            category="Savings",
            message=f"Your estimated savings rate is {_percent(rate)}, within a reasonable 10-20% starter range.",
            suggested_action="Protect this cushion by keeping fixed costs from creeping up.",
            metric_label="Savings rate",
            metric_value=_percent(rate),
        )
    if rate >= 0.05:
        return AdvisorInsight(
            id="thin_savings_cushion",
            title="Your savings cushion is thin.",
            severity="warning",
            category="Savings",
            message=f"Your estimated savings rate is {_percent(rate)}. A safer target is 10-20%.",
            suggested_action="Try reducing flexible spending or choosing a lower-rent option.",
            metric_label="Savings rate",
            metric_value=_percent(rate),
        )
    return AdvisorInsight(
        id="very_low_savings_cushion",
        title="Your savings cushion is very thin.",
        severity="critical",
        category="Savings",
        message=f"Your estimated savings rate is {_percent(rate)}, leaving little room for emergencies or moving costs.",
        suggested_action="Rework the plan around lower fixed costs before committing.",
        metric_label="Savings rate",
        metric_value=_percent(rate),
    )


def _transportation_insight(request: InsightsRequest) -> AdvisorInsight:
    input_data = request.input
    result = request.result
    ratio = result.transportation_ratio
    car_costs = input_data.car_payment + input_data.car_insurance + input_data.gas + input_data.parking + input_data.tolls
    transit_friendly = any(
        token in input_data.residence_location.lower()
        for token in ["new york", "brooklyn", "queens", "jersey city", "hoboken", "boston", "cambridge", "washington", "seattle", "san francisco"]
    )

    if ratio <= 0.08:
        return AdvisorInsight(
            id="low_transportation_burden",
            title="Transportation is not weighing down the budget.",
            severity="positive",
            category="Transportation",
            message=f"Transportation is about {_percent(ratio)} of take-home pay, which is a manageable burden.",
            suggested_action="Keep commute choices predictable as you compare apartments.",
            metric_label="Transportation ratio",
            metric_value=_percent(ratio),
        )

    if ratio <= 0.15:
        severity = "info"
        title = "Transportation costs deserve attention."
        message = f"Transportation is about {_percent(ratio)} of take-home pay."
    else:
        severity = "critical" if ratio > 0.2 else "warning"
        title = "Car costs create major budget risk."
        message = f"Transportation takes {_percent(ratio)} of your estimated take-home pay."

    action = "Look for commute choices that reduce fixed monthly transportation costs."
    if car_costs > 0 and transit_friendly:
        action = "Because this location may be transit-friendly, compare a no-car version before signing a lease."

    return AdvisorInsight(
        id="transportation_pressure",
        title=title,
        severity=severity,
        category="Transportation",
        message=message,
        suggested_action=action,
        estimated_monthly_impact=round(car_costs, 2) if car_costs > 0 and transit_friendly else None,
        metric_label="Transportation ratio",
        metric_value=_percent(ratio),
    )


def _flexible_spending_insight(request: InsightsRequest) -> AdvisorInsight | None:
    input_data = request.input
    result = request.result
    if result.net_monthly <= 0:
        return None

    flexible_spending = input_data.eating_out + input_data.personal_spending + input_data.subscriptions
    ratio = flexible_spending / result.net_monthly
    if ratio <= 0.2:
        return None

    severity = "critical" if ratio > 0.3 else "warning"
    return AdvisorInsight(
        id="flexible_spending_pressure",
        title="Flexible spending is taking a large share.",
        severity=severity,
        category="Food and lifestyle",
        message=f"Eating out, subscriptions, and personal spending are about {_percent(ratio)} of take-home pay.",
        suggested_action="Trim one or two recurring habits before cutting essentials.",
        estimated_monthly_impact=round(max(flexible_spending - result.net_monthly * 0.2, 0), 2),
        metric_label="Flexible spending",
        metric_value=_percent(ratio),
    )


def _tax_insight(request: InsightsRequest) -> AdvisorInsight | None:
    input_data = request.input
    result = request.result
    notes = " ".join(result.tax_assumption_notes).lower()

    if input_data.fica_exempt:
        return AdvisorInsight(
            id="fica_status_matters",
            title="FICA status matters.",
            severity="info",
            category="Taxes and FICA",
            message="Your current estimate excludes FICA because OPT/F-1 exemption is enabled.",
            suggested_action="Recheck your budget if your status changes or your employer withholds FICA.",
            estimated_monthly_impact=round(result.fica_exemption_monthly_value, 2),
            metric_label="FICA exemption value",
            metric_value=_money(result.fica_exemption_monthly_value),
        )

    if "no broad-based wage income tax" in notes:
        return AdvisorInsight(
            id="no_state_wage_tax",
            title="State wage income tax is not part of this estimate.",
            severity="positive",
            category="Taxes and FICA",
            message="Your tax assumptions indicate this state has no broad-based wage income tax.",
            suggested_action="Still compare total cost of living, rent, transportation, and insurance before choosing a city.",
            metric_label="State tax",
            metric_value=_money(result.state_tax_monthly),
        )

    if "estimate" in notes or "effective-rate" in notes:
        return AdvisorInsight(
            id="state_tax_estimate",
            title="State tax is a planning estimate.",
            severity="info",
            category="Taxes and FICA",
            message="One or more tax notes indicate simplified or effective-rate state tax assumptions.",
            suggested_action="Use this result for planning, then verify details before making tax or relocation decisions.",
            metric_label="State tax",
            metric_value=_money(result.state_tax_monthly),
        )

    return None


def _emergency_fund_insight(request: InsightsRequest) -> AdvisorInsight:
    input_data = request.input
    result = request.result
    transportation = _transportation_cost(request)
    essential_monthly = (
        input_data.rent
        + input_data.utilities
        + input_data.internet
        + input_data.groceries
        + transportation
        + input_data.health_insurance_monthly
    )
    target_three_months = essential_monthly * 3

    if result.monthly_leftover <= 0:
        return AdvisorInsight(
            id="emergency_fund_blocked",
            title="Emergency fund progress may stall.",
            severity="warning",
            category="Emergency fund",
            message=f"Estimated essentials are about {_money(essential_monthly)} per month, but the plan has little leftover.",
            suggested_action="Create monthly breathing room before setting a large emergency fund target.",
            metric_label="3-month essentials",
            metric_value=_money(target_three_months),
        )

    months_to_three = target_three_months / result.monthly_leftover if result.monthly_leftover > 0 else 0
    severity = "info" if months_to_three <= 18 else "warning"
    return AdvisorInsight(
        id="emergency_fund_timeline",
        title="Plan your emergency fund timeline.",
        severity=severity,
        category="Emergency fund",
        message=f"A 3-month essential-expense fund is roughly {_money(target_three_months)} based on this plan.",
        suggested_action="OPT workers may want to plan toward 6 months once the 3-month baseline is funded.",
        metric_label="Months to 3-month fund",
        metric_value=f"{months_to_three:.1f}",
    )


def _debt_obligations_insight(request: InsightsRequest) -> AdvisorInsight | None:
    input_data = request.input
    result = request.result
    if result.net_monthly <= 0:
        return None
    ratio = input_data.other_expenses / result.net_monthly
    if ratio < 0.12:
        return None
    return AdvisorInsight(
        id="other_obligations_pressure",
        title="Other obligations are meaningful.",
        severity="warning" if ratio < 0.2 else "critical",
        category="Debt and obligations",
        message=f"Other expenses are about {_percent(ratio)} of take-home pay.",
        suggested_action="If these include debt, family support, or planned savings, separate required bills from flexible allocations.",
        metric_label="Other expenses",
        metric_value=_percent(ratio),
    )


def _overall_insight(request: InsightsRequest) -> AdvisorInsight:
    result = request.result
    if result.risk_level == "Comfortable":
        return AdvisorInsight(
            id="overall_comfortable",
            title="This budget looks comfortable.",
            severity="positive",
            category="Overall budget health",
            message="Your overall score and ratios suggest a healthy first-job budget.",
            suggested_action="Use the extra cushion to build emergency savings and avoid lifestyle creep.",
            metric_label="Affordability score",
            metric_value=f"{result.affordability_score}/100",
        )
    if result.risk_level == "Manageable":
        return AdvisorInsight(
            id="overall_manageable",
            title="This plan is manageable with discipline.",
            severity="info",
            category="Overall budget health",
            message="Your budget can work, but fixed costs and discretionary spending still need attention.",
            suggested_action="Stress-test rent, transportation, and food before committing.",
            metric_label="Affordability score",
            metric_value=f"{result.affordability_score}/100",
        )
    if result.risk_level == "Tight":
        return AdvisorInsight(
            id="overall_tight",
            title="This budget is tight.",
            severity="warning",
            category="Overall budget health",
            message="The plan leaves a limited cushion after regular expenses.",
            suggested_action="Look for one large fixed-cost improvement before optimizing small expenses.",
            metric_label="Affordability score",
            metric_value=f"{result.affordability_score}/100",
        )
    return AdvisorInsight(
        id="overall_risky",
        title="This budget is risky.",
        severity="critical",
        category="Overall budget health",
        message="The plan leaves little margin for emergencies, moving costs, or tax surprises.",
        suggested_action="Rework rent, transportation, or major obligations before relying on this plan.",
        metric_label="Affordability score",
        metric_value=f"{result.affordability_score}/100",
    )


def generate_advisor_insights(request: InsightsRequest) -> InsightsResponse:
    insights: list[AdvisorInsight] = [
        _housing_insight(request),
        _savings_insight(request),
        _transportation_insight(request),
        _emergency_fund_insight(request),
    ]

    for optional_insight in [
        _flexible_spending_insight(request),
        _tax_insight(request),
        _debt_obligations_insight(request),
    ]:
        if optional_insight is not None:
            insights.append(optional_insight)

    overall = _overall_insight(request)
    insights = [insight for insight in insights if insight.category != "Overall budget health"]
    insights.sort(key=lambda insight: SEVERITY_RANK[insight.severity])
    selected = [overall, *insights]
    selected.sort(key=lambda insight: SEVERITY_RANK[insight.severity])

    if overall not in selected[:MAX_INSIGHTS]:
        selected = selected[: MAX_INSIGHTS - 1] + [overall]
        selected.sort(key=lambda insight: SEVERITY_RANK[insight.severity])
    else:
        selected = selected[:MAX_INSIGHTS]

    return InsightsResponse(insights=selected)
