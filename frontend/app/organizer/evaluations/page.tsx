"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Evaluation } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckSquare, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evals = await api.listEvaluations();
        setEvaluations(evals);
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">All Evaluations</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Complete register of panel scores, justifications, and on-chain hash anchors.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-indigo">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Evaluations Submitted Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Once assigned judges score submissions with AI evidence guardrails and submit their decisions, finalized evaluations and on-chain hashes will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-graphite-600 transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-white text-base">
                    {ev.team?.name || "Team Evaluation"}
                  </span>
                  <span className="text-xs font-mono text-graphite-400">({ev.rubric_version})</span>
                  <Badge variant={ev.status === "SUBMITTED" ? "success" : "warning"}>
                    {ev.status === "SUBMITTED" ? "Anchored" : "Draft"}
                  </Badge>
                </div>

                <p className="text-xs text-graphite-300">
                  Judge: <strong>{ev.judge?.full_name || "Judge"}</strong> • {formatDate(ev.created_at)}
                </p>

                {ev.justification && (
                  <p className="text-xs text-graphite-400 italic line-clamp-1 pt-0.5">
                    &ldquo;{ev.justification}&rdquo;
                  </p>
                )}

                <p className="text-[11px] font-mono text-graphite-500 truncate pt-1">
                  Canonical Hash: {ev.canonical_hash || "Pending anchor"}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-graphite-800">
                <div className="text-right">
                  <span className="text-[10px] text-graphite-500 uppercase font-mono block">Final Score</span>
                  <span className="text-2xl font-black font-mono text-white">
                    {ev.final_score.toFixed(1)} / 100
                  </span>
                </div>

                <Link href={`/evaluation/${ev.id}/replay`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    <span>Replay</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
