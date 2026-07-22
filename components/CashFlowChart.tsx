"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export function CashFlowChart({
  data,
}: {
  data: { date: string; income: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#a1a1aa', fontSize: 12 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#a1a1aa', fontSize: 12 }} 
          tickFormatter={(value) => `Rs. ${value}`}
        />
        <Tooltip 
          formatter={(v: number) => `Rs. ${v.toLocaleString()}`} 
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="income" name="Income" fill="var(--success)" radius={[6, 6, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expenses" name="Expenses" fill="var(--error)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
