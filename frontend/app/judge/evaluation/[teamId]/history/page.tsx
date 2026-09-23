"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Evaluation } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, History, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JudgeEvaluationHistoryPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evals = await api.listEvaluations({ team_id: teamId });
        setEvaluations(evals);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/judge/evaluation/${teamId}`}
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Evaluation History</h1>
          <p className="text-xs text-graphite-400">
            Recorded scores, justifications, and blockchain transaction proofs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {evaluations.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-graphite-400 font-mono">
                  Recorded: {formatDate(ev.created_at)}
                </span>
                <h3 className="text-base font-bold text-white">Score: {ev.final_score.toFixed(1)} / 100</h3>
              </div>
              <Badge variant={ev.status === "SUBMITTED" ? "success" : "warning"}>
                {ev.status}
              </Badge>
            </div>

            {ev.justification && (
              <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 text-xs text-graphite-300">
                <span className="font-semibold text-white block mb-0.5">Judge Justification:</span>
                <p className="italic">&ldquo;{ev.justification}&rdquo;</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs border-t border-graphite-800">
              <span className="font-mono text-graphite-500 text-[11px] truncate max-w-[280px]">
                Hash: {ev.canonical_hash || "Unanchored"}
              </span>

              <Link
                href={`/evaluation/${ev.id}/replay`}
                className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full Decision Replay</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
