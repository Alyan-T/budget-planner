"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function TrendChart({
  data,
}: {
  data: { day: string; actual: number | null; projected: number | null }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.5} />
        <XAxis 
          dataKey="day" 
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
        <Line type="monotone" dataKey="actual" stroke="#378ADD" dot={false} strokeWidth={2} />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#D85A30"
          strokeDasharray="5 5"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
