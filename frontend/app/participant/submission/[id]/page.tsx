"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Submission, Claim } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AnalysisTimeline } from "@/components/submission/AnalysisTimeline";
import { EvidenceCard } from "@/components/judge/EvidenceCard";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sub = await api.getSubmission(submissionId);
        setSubmission(sub);
        const evidenceData = await api.getAiEvidence(submissionId);
        if (evidenceData && evidenceData.claims) {
          setClaims(evidenceData.claims);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-graphite-400">Submission not found.</p>
        <Link href="/participant/submissions">
          <Button variant="secondary">Back to Submissions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/participant/submissions"
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {submission.project_title}
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Submitted on {formatDate(submission.submitted_at)}
          </p>
        </div>
      </div>

      {/* Analysis Pipeline */}
      <AnalysisTimeline
        currentStatus={submission.ai_analysis_status}
        statusMessage={submission.ai_status_message}
        claimsCount={claims.length}
        bundleHash={submission.evidence_bundle_hash || undefined}
      />

      {/* AI Executive Summary */}
      {submission.project_summary && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 text-xs text-graphite-200 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Synthesis</span>
          </div>
          <p className="leading-relaxed">{submission.project_summary}</p>
        </div>
      )}

      {/* Extracted and Verified Claims */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Extracted Claims &amp; Verification Evidence</h3>
            <p className="text-xs text-graphite-400">
              Each claim identified by AI is cross-referenced against your repository, diagrams, and benchmarks.
            </p>
          </div>
          <Badge variant="indigo">{claims.length} Claims Verified</Badge>
        </div>

        <div className="space-y-3">
          {claims.map((claim, idx) => (
            <EvidenceCard key={claim.id || idx} claim={claim} />
          ))}
        </div>
      </div>
    </div>
  );
}
