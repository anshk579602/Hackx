"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

interface ScoreDistributionChartProps {
  data: Array<{
    team_name: string;
    mean_score: number;
    std_deviation: number;
    has_anomaly: boolean;
  }>;
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-graphite-500 text-sm">
        No evaluation score data available.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.team_name,
    "Average Score": d.mean_score,
    "Std Dev (±)": d.std_deviation,
    has_anomaly: d.has_anomaly,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2235" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#A0A8C4", fontSize: 12 }}
            axisLine={{ stroke: "#2E3550" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#A0A8C4", fontSize: 12 }}
            axisLine={{ stroke: "#2E3550" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#131620",
              borderColor: "#2E3550",
              borderRadius: "8px",
              color: "#EDEDED",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "10px", fontSize: "12px", color: "#A0A8C4" }}
          />
          <Bar dataKey="Average Score" fill="#6366F1" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.has_anomaly ? "#F59E0B" : "#6366F1"}
              />
            ))}
          </Bar>
          <Bar dataKey="Std Dev (±)" fill="#8B5CF6" radius={[4, 4, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
