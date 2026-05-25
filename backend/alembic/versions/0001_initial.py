"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "simulation_scenarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("annual_salary", sa.Float(), nullable=False),
        sa.Column("pay_frequency", sa.String(length=32), nullable=False),
        sa.Column("tax_year", sa.Integer(), nullable=False),
        sa.Column("filing_status", sa.String(length=32), nullable=False),
        sa.Column("work_state", sa.String(length=8), nullable=False),
        sa.Column("residence_location", sa.String(length=64), nullable=False),
        sa.Column("fica_exempt", sa.Boolean(), nullable=False),
        sa.Column("contribution_401k_percent", sa.Float(), nullable=False),
        sa.Column("health_insurance_monthly", sa.Float(), nullable=False),
        sa.Column("rent", sa.Float(), nullable=False),
        sa.Column("utilities", sa.Float(), nullable=False),
        sa.Column("internet", sa.Float(), nullable=False),
        sa.Column("phone", sa.Float(), nullable=False),
        sa.Column("groceries", sa.Float(), nullable=False),
        sa.Column("eating_out", sa.Float(), nullable=False),
        sa.Column("transportation_type", sa.String(length=32), nullable=False),
        sa.Column("transit_cost", sa.Float(), nullable=False),
        sa.Column("car_payment", sa.Float(), nullable=False),
        sa.Column("car_insurance", sa.Float(), nullable=False),
        sa.Column("gas", sa.Float(), nullable=False),
        sa.Column("parking", sa.Float(), nullable=False),
        sa.Column("tolls", sa.Float(), nullable=False),
        sa.Column("subscriptions", sa.Float(), nullable=False),
        sa.Column("gym", sa.Float(), nullable=False),
        sa.Column("personal_spending", sa.Float(), nullable=False),
        sa.Column("other_expenses", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_simulation_scenarios_id", "simulation_scenarios", ["id"])
    op.create_table(
        "simulation_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scenario_id", sa.Integer(), sa.ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("gross_monthly", sa.Float(), nullable=False),
        sa.Column("federal_tax_monthly", sa.Float(), nullable=False),
        sa.Column("state_tax_monthly", sa.Float(), nullable=False),
        sa.Column("local_tax_monthly", sa.Float(), nullable=False),
        sa.Column("fica_monthly", sa.Float(), nullable=False),
        sa.Column("contribution_401k_monthly", sa.Float(), nullable=False),
        sa.Column("health_insurance_monthly", sa.Float(), nullable=False),
        sa.Column("net_monthly", sa.Float(), nullable=False),
        sa.Column("total_expenses", sa.Float(), nullable=False),
        sa.Column("monthly_leftover", sa.Float(), nullable=False),
        sa.Column("savings_rate", sa.Float(), nullable=False),
        sa.Column("housing_ratio", sa.Float(), nullable=False),
        sa.Column("transportation_ratio", sa.Float(), nullable=False),
        sa.Column("affordability_score", sa.Integer(), nullable=False),
        sa.Column("risk_level", sa.String(length=32), nullable=False),
        sa.Column("recommendation_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_simulation_results_id", "simulation_results", ["id"])


def downgrade():
    op.drop_table("simulation_results")
    op.drop_table("simulation_scenarios")
