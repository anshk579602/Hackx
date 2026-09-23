"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Hackathon, TeamScoreStat } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Clock, ShieldCheck, Award } from "lucide-react";

export default function ParticipantResultsPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [stats, setStats] = useState<TeamScoreStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const hacks = await api.listHackathons();
        const active = hacks[0] || null;
        setHackathon(active);
        if (active?.is_published) {
          const anomalyData = await api.getAnomalyDashboard(active.id);
          setStats(anomalyData.team_statistics || []);
        }
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isPublished = Boolean(hackathon?.is_published);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hackathon Results</h1>
        <p className="text-xs text-graphite-400 mt-1">
          {hackathon?.title || "HackX Championship"} Official Standings &amp; Blockchain Proofs
        </p>
      </div>

      {isPublished ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Official results verified and locked on the Polygon Amoy blockchain. Every score matches on-chain cryptographic hashes.
            </span>
          </div>

          <div className="space-y-3">
            {stats
              .sort((a, b) => b.mean_score - a.mean_score)
              .map((t, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={t.team_id}
                    className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          rank === 1
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : rank === 2
                            ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                            : rank === 3
                            ? "bg-amber-800/20 text-amber-600 border border-amber-800/30"
                            : "bg-graphite-800 text-graphite-400"
                        }`}
                      >
                        {rank === 1 ? <Trophy className="w-5 h-5" /> : `#${rank}`}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white">{t.team_name}</h3>
                        <p className="text-xs text-graphite-400">{t.project_title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black font-mono text-white">
                        {t.mean_score.toFixed(1)}
                      </div>
                      <span className="text-[10px] uppercase font-mono text-graphite-500">
                        Average Score
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-graphite-750 bg-graphite-850 text-center space-y-4">
          <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Results Pending Publication</h3>
            <p className="text-xs text-graphite-400 max-w-md mx-auto">
              Evaluation is currently underway. Organizers publish results only after all judge scores pass cryptographic integrity checks and anomaly audits.
            </p>
          </div>
          <Badge variant="warning">Judging Period Active</Badge>
        </div>
      )}
    </div>
  );
}
