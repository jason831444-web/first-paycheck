"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usd } from "@/lib/formatters";
import { SimulationResult } from "@/types/simulation";

export function IncomeExpenseChart({ result }: { result: SimulationResult }) {
  const data = [
    { name: "Net income", value: result.net_monthly },
    { name: "Expenses", value: result.total_expenses },
    { name: "Leftover", value: result.monthly_leftover },
  ];

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
          <Tooltip formatter={(value: number) => usd(value)} />
          <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
