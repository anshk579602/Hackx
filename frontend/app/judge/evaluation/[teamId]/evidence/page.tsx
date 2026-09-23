"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Claim } from "@/lib/types";
import { EvidenceCard } from "@/components/judge/EvidenceCard";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function JudgeEvidenceDeepDivePage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evData = await api.getAiEvidence(teamId);
        if (evData?.claims) setClaims(evData.claims);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Evidence Deep Dive</h1>
          <p className="text-xs text-graphite-400">
            Comprehensive audit report of all extracted statements and source citations.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {claims.map((claim, idx) => (
          <EvidenceCard key={claim.id || idx} claim={claim} />
        ))}
      </div>
    </div>
  );
}
