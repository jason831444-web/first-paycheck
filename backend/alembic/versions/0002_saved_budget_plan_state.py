"""add saved budget plan state

Revision ID: 0002_saved_budget_plan_state
Revises: 0001_initial
Create Date: 2026-05-28
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_saved_budget_plan_state"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("simulation_scenarios", sa.Column("updated_at", sa.DateTime(), nullable=True))
    op.add_column("simulation_scenarios", sa.Column("active_sections", sa.JSON(), nullable=True))
    op.add_column("simulation_scenarios", sa.Column("section_values", sa.JSON(), nullable=True))
    op.add_column("simulation_scenarios", sa.Column("custom_expenses", sa.JSON(), nullable=True))
    op.add_column("simulation_scenarios", sa.Column("mapped_input", sa.JSON(), nullable=True))
    op.add_column("simulation_scenarios", sa.Column("result_data", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("simulation_scenarios", "result_data")
    op.drop_column("simulation_scenarios", "mapped_input")
    op.drop_column("simulation_scenarios", "custom_expenses")
    op.drop_column("simulation_scenarios", "section_values")
    op.drop_column("simulation_scenarios", "active_sections")
    op.drop_column("simulation_scenarios", "updated_at")
