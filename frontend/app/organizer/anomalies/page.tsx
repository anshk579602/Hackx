"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AnomalyDashboardData, TeamScoreStat } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import {
  AlertTriangle,
  Scale,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function OrganizerAnomaliesPage() {
  const [data, setData] = useState<AnomalyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnomalyDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const teamsWithAnomalies = data?.team_statistics?.filter((t) => t.has_anomaly) || [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cross-Judge Anomaly Detection
          </h1>
          <Badge variant={teamsWithAnomalies.length > 0 ? "warning" : "success"}>
            {teamsWithAnomalies.length} Flagged
          </Badge>
        </div>
        <p className="text-xs text-graphite-400 mt-1">
          Statistical deviation and outlier analysis across multiple independent human evaluators.
        </p>
      </div>

      {/* Summary Alert */}
      {data?.summary_recommendation && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{data.summary_recommendation}</p>
        </div>
      )}

      {/* Recharts Score Distribution */}
      <Card className="border-graphite-750">
        <CardHeader>
          <CardTitle className="text-base">Panel Score Variance &amp; Standard Deviation</CardTitle>
          <p className="text-xs text-graphite-400">
            Amber bars highlight teams where judge standard deviation exceeds normal tolerance thresholds.
          </p>
        </CardHeader>
        <CardContent>
          <ScoreDistributionChart
            data={(data?.team_statistics || []).map((t) => ({
              team_name: t.team_name,
              mean_score: t.mean_score,
              std_deviation: t.std_deviation,
              has_anomaly: t.has_anomaly,
            }))}
          />
        </CardContent>
      </Card>

      {/* Flagged Anomaly Details with Respectful Recommendations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Specific Category Outliers</h3>

        {teamsWithAnomalies.length === 0 ? (
          <div className="p-8 rounded-2xl border border-graphite-800 bg-graphite-850 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No scoring anomalies detected</p>
            <p className="text-xs text-graphite-400">All judge evaluations are aligned within normal standard deviations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamsWithAnomalies.map((team) => (
              <div
                key={team.team_id}
                className="p-5 rounded-2xl border border-amber-500/30 bg-graphite-850 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-graphite-800">
                  <div>
                    <h4 className="text-base font-bold text-white">{team.team_name}</h4>
                    <p className="text-xs text-graphite-400">{team.project_title}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-graphite-400">
                      Mean: <strong className="text-white">{team.mean_score.toFixed(1)}</strong>
                    </span>
                    <span className="text-graphite-400">
                      Std Dev: <strong className="text-amber-400">±{team.std_deviation.toFixed(1)}</strong>
                    </span>
                  </div>
                </div>

                {/* Outlier recommendations */}
                <div className="space-y-3">
                  {team.anomaly_details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>{detail.category} Score Divergence</span>
                        <span className="font-mono text-amber-400 font-bold">
                          Δ {detail.deviation.toFixed(1)} pts
                        </span>
                      </div>
                      <p className="text-amber-200/90 leading-relaxed font-sans">
                        {detail.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Scores by judge breakdown */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider block mb-2">
                    Individual Judge Scores
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {team.scores_by_judge.map((j) => (
                      <div
                        key={j.judge_id}
                        className="p-2.5 rounded-lg bg-graphite-900 border border-graphite-800 flex items-center justify-between font-mono"
                      >
                        <span className="text-graphite-300 font-sans truncate">{j.judge_name}</span>
                        <span className="font-bold text-white">{j.final_score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
