"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { usd } from "@/lib/formatters";

const COLORS = ["#0f766e", "#2563eb", "#7c3aed", "#dc2626", "#ca8a04", "#475569"];

export function ExpenseBreakdownChart({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" outerRadius={95} label>
            {rows.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => usd(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
