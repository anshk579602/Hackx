"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Team, Evaluation } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Users, Search, CheckCircle2, Clock, ArrowRight, ExternalLink } from "lucide-react";

export default function JudgeAssignedTeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SUBMITTED">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const teamList = await api.listTeams();
        setTeams(teamList);
        const evalList = await api.listEvaluations({ judge_id: user?.id });
        setEvaluations(evalList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.submission?.project_title.toLowerCase().includes(search.toLowerCase());
    const hasEval = evaluations.find((e) => e.team_id === t.id && e.status === "SUBMITTED");

    if (statusFilter === "PENDING") return matchesSearch && !hasEval;
    if (statusFilter === "SUBMITTED") return matchesSearch && Boolean(hasEval);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Assigned Teams</h1>
          <p className="text-xs text-graphite-400 mt-1">
            Review submissions, inspect evidence, and submit rubric evaluations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search teams or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 h-9 text-xs"
          />

          <div className="flex rounded-lg border border-graphite-700 bg-graphite-850 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "ALL" ? "bg-graphite-700 text-white font-medium" : "text-graphite-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "PENDING" ? "bg-graphite-700 text-white font-medium" : "text-graphite-400 hover:text-white"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("SUBMITTED")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "SUBMITTED" ? "bg-graphite-700 text-white font-medium" : "text-graphite-400 hover:text-white"
              }`}
            >
              Anchored
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTeams.map((team) => {
          const evalRecord = evaluations.find(
            (e) => e.team_id === team.id && e.status === "SUBMITTED"
          );
          const isAnchored = Boolean(evalRecord);

          return (
            <div
              key={team.id}
              className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-graphite-600 transition-colors"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">{team.name}</h3>
                  {isAnchored ? (
                    <Badge variant="success">Anchored on-chain</Badge>
                  ) : (
                    <Badge variant="warning">Pending Evaluation</Badge>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-indigo-300">
                  {team.submission?.project_title || "No submission title recorded"}
                </h4>

                <p className="text-xs text-graphite-400 line-clamp-2">
                  {team.submission?.project_description || "Team has not added full description."}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px] text-graphite-500 font-mono">
                  <span>Stack: {team.submission?.tech_stack?.slice(0, 3).join(", ") || "Full-stack"}</span>
                  <span>•</span>
                  <span>{team.submission?.raw_claims?.length || 12} claims extracted</span>
                </div>
              </div>

              {/* Actions & Score */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-graphite-800">
                {isAnchored && evalRecord && (
                  <div className="text-right">
                    <span className="text-[10px] text-graphite-500 uppercase font-mono block">Your Score</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {evalRecord.final_score.toFixed(1)} / 100
                    </span>
                  </div>
                )}

                <Link href={`/judge/evaluation/${team.id}`}>
                  <Button variant={isAnchored ? "secondary" : "primary"} size="sm">
                    <span>{isAnchored ? "Inspect Evaluation" : "Start Evaluation"}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
