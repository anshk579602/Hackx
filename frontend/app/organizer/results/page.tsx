"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Hackathon, TeamScoreStat, IntegrityOverview } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Send,
  Lock,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

export default function OrganizerResultsPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [stats, setStats] = useState<TeamScoreStat[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityOverview | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const hacks = await api.listHackathons();
      const active = hacks[0] || null;
      setHackathon(active);

      const anomalyData = await api.getAnomalyDashboard(active?.id);
      setStats(anomalyData.team_statistics || []);

      const integrityData = await api.getIntegrityOverview();
      setIntegrity(integrityData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasIntegrityViolation = integrity?.system_status === "INTEGRITY_VIOLATION";

  const handlePublish = async () => {
    if (!hackathon) return;
    if (hasIntegrityViolation) {
      setPublishError("Cannot publish results while unresolved cryptographic integrity violations exist!");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishMessage(null);
    try {
      const res = await api.publishResults(hackathon.id);
      setPublishMessage(res.message);
      await loadData();
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish results.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const sortedStats = [...stats].sort((a, b) => b.mean_score - a.mean_score);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Final Results &amp; Rankings
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Aggregated rankings calculated exclusively from authoritative human judge evaluations.
          </p>
        </div>

        {/* Publish Action Button */}
        <div>
          {hackathon?.is_published ? (
            <Badge variant="success" className="px-3 py-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Results Live &amp; Published</span>
            </Badge>
          ) : (
            <Button
              variant="emerald"
              disabled={hasIntegrityViolation || isPublishing}
              isLoading={isPublishing}
              onClick={handlePublish}
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Publish Official Results</span>
            </Button>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {publishMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{publishMessage}</span>
        </div>
      )}

      {publishError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Integrity Guard Status Callout */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          hasIntegrityViolation
            ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
            : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {hasIntegrityViolation ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-white">
              {hasIntegrityViolation
                ? "Integrity Check: Violations Detected"
                : "All Evaluations Cryptographically Verified"}
            </h4>
            <p className="text-[11px] text-graphite-400">
              {hasIntegrityViolation
                ? "One or more database scores mismatch their blockchain anchor. Publication is blocked."
                : "Every evaluation matches its Polygon Amoy smart contract anchor. Results are safe to publish."}
            </p>
          </div>
        </div>

        <Link href="/organizer/integrity">
          <Button size="sm" variant={hasIntegrityViolation ? "danger" : "outline"} className="text-xs">
            Integrity Center &rarr;
          </Button>
        </Link>
      </div>

      {/* Leaderboard Table */}
      <Card className="border-graphite-750">
        <CardHeader>
          <CardTitle className="text-base">Official Leaderboard (Rubric v1.2)</CardTitle>
          <p className="text-xs text-graphite-400">
            Transparent scoring aggregation. AI never selects winners.
          </p>
        </CardHeader>
        <CardContent>
          {sortedStats.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Trophy className="w-8 h-8 text-graphite-600 mx-auto" />
              <p className="text-sm font-semibold text-graphite-300">No scores recorded yet</p>
              <p className="text-xs text-graphite-500 max-w-sm mx-auto">
                Rankings will automatically calculate and update as judges evaluate assigned project submissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-graphite-800 text-graphite-400 font-mono text-[11px]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team &amp; Project</th>
                    <th className="py-3 px-4">Evaluations</th>
                    <th className="py-3 px-4">Integrity Status</th>
                    <th className="py-3 px-4">Anomaly Status</th>
                    <th className="py-3 px-4 text-right">Average Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-800/60 font-sans">
                  {sortedStats.map((team, idx) => {
                    const rank = idx + 1;
                    const isTampered = team.integrity_status === "TAMPERED";

                    return (
                      <tr key={team.team_id} className="hover:bg-graphite-800/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            {rank === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
                            <span>#{rank}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-white text-sm">{team.team_name}</p>
                          <p className="text-graphite-400 text-[11px]">{team.project_title}</p>
                        </td>
                        <td className="py-4 px-4 font-mono text-graphite-300">
                          {team.evaluation_count} Completed
                        </td>
                        <td className="py-4 px-4">
                          {isTampered ? (
                            <Badge variant="danger">Tamper Mismatch</Badge>
                          ) : (
                            <Badge variant="success">Verified On-Chain</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {team.has_anomaly ? (
                            <Badge variant="warning">Review Recommended</Badge>
                          ) : (
                            <span className="text-graphite-500 font-mono text-[11px]">Normal</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-black text-white text-base">
                          {team.mean_score.toFixed(1)} / 100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
