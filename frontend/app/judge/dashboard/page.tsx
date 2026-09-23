"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Team, Evaluation } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  ExternalLink,
  Gavel
} from "lucide-react";

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const completedCount = evaluations.filter((e) => e.status === "SUBMITTED").length;
  const pendingCount = Math.max(0, teams.length - completedCount);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Judge Workspace: {user?.full_name || "Evaluator"}
            </h1>
            <Badge variant="warning">Accredited Judge</Badge>
          </div>
          <p className="text-xs text-graphite-400 mt-1">
            {user?.organization ? `${user.organization} • ` : ""}HackJudge Evaluation Panel
          </p>
        </div>

        {teams.length > 0 && (
          <Link href="/judge/assigned-teams">
            <Button variant="primary" className="gap-1.5 shadow-lg shadow-amber-600/20">
              <span>View Assigned Teams</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Assigned Teams</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-white">{teams.length}</div>
            <p className="text-xs text-graphite-400 mt-1">Total project submissions assigned</p>
          </CardContent>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Finalized &amp; Anchored</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{completedCount}</div>
            <p className="text-xs text-graphite-400 mt-1">Anchored on Polygon Amoy testnet</p>
          </CardContent>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Pending Evaluations</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-amber-400">{pendingCount}</div>
            <p className="text-xs text-graphite-400 mt-1">Awaiting your evaluation</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Teams List or Empty State */}
      {teams.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-glow-amber">
            <Gavel className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Assigned Teams Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Once participants register their teams and submit project repositories, the hackathon organizer will assign submissions to your panel for evidence-based evaluation.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Assigned Teams Queue</h3>
            <Link href="/judge/assigned-teams" className="text-xs text-indigo-400 hover:underline">
              View all ({teams.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map((t) => {
              const hasEval = evaluations.find((e) => e.team_id === t.id && e.status === "SUBMITTED");
              return (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border border-graphite-800 bg-graphite-900 flex flex-col justify-between space-y-4 hover:border-graphite-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{t.name}</h4>
                      {hasEval ? (
                        <Badge variant="success">Anchored</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-graphite-400 mt-1 line-clamp-1">
                      {t.submission?.project_title || "No submission title"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-graphite-800 flex items-center justify-between">
                    {hasEval ? (
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Score: {hasEval.final_score.toFixed(1)} / 100
                      </span>
                    ) : (
                      <span className="text-xs text-graphite-500 font-mono">Unscored</span>
                    )}

                    <Link href={`/judge/evaluation/${t.id}`}>
                      <Button size="sm" variant={hasEval ? "outline" : "primary"} className="text-xs">
                        {hasEval ? "Inspect" : "Evaluate"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
