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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
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
