"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { DecisionReplayData, AuditTimelineEvent } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  History,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Gavel,
  Scale,
  Lock,
  ExternalLink,
  User,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DecisionReplayPage() {
  const params = useParams();
  const evaluationId = params.id as string;
  const [replayData, setReplayData] = useState<DecisionReplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getDecisionReplay(evaluationId);
        setReplayData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [evaluationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const getActorIcon = (role: string) => {
    switch (role) {
      case "AI_AGENT":
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case "JUDGE":
        return <Gavel className="w-4 h-4 text-amber-400" />;
      case "BLOCKCHAIN_SERVICE":
        return <Lock className="w-4 h-4 text-emerald-400" />;
      default:
        return <User className="w-4 h-4 text-graphite-300" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/organizer/evaluations"
              className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Decision Replay: {replayData?.team_name}
                </h1>
                <Badge variant="indigo">Tamper-Evident Trail</Badge>
              </div>
              <p className="text-xs text-graphite-400 mt-0.5">
                Evaluator: <strong className="text-white">{replayData?.judge_name}</strong> • Project: {replayData?.project_title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[10px] uppercase font-mono text-graphite-500 block">Final Anchored Score</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {replayData?.final_score.toFixed(1)} / 100
            </span>
          </div>

          <Link href={`/evaluation/${evaluationId}/verify`}>
            <Button size="sm" variant="outline">
              <span>Public Proof</span>
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Cryptographic Footprint Banner */}
      <div className="p-4 rounded-xl bg-graphite-850/80 border border-graphite-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span className="text-graphite-400">Canonical Hash (Keccak-256):</span>
        <span className="text-indigo-400 truncate max-w-sm">{replayData?.canonical_hash}</span>
      </div>

      {/* Polished Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-graphite-800 space-y-8">
        {(replayData?.timeline || []).map((ev: AuditTimelineEvent, idx: number) => {
          return (
            <div key={idx} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-8 h-8 rounded-full border-2 border-graphite-750 bg-graphite-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                {getActorIcon(ev.role)}
              </div>

              {/* Event card */}
              <div className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 shadow-sm space-y-2 hover:border-graphite-600 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{ev.time}</span>
                    <span className="text-graphite-600">•</span>
                    <h3 className="text-sm font-bold text-white">{ev.title}</h3>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-graphite-800 text-graphite-300 font-semibold w-fit">
                    {ev.badge}
                  </span>
                </div>

                <p className="text-xs text-graphite-300 leading-relaxed font-sans">{ev.description}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-graphite-500 font-mono border-t border-graphite-800/80">
                  <span>Actor: {ev.actor}</span>
                  <span className="uppercase text-emerald-400 font-semibold">{ev.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
