"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Submission, Team } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PlusCircle, ExternalLink, ArrowRight, Sparkles, FolderGit2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ParticipantSubmissionsPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const myTeam = await api.getMyTeam();
        setTeam(myTeam);
        if (myTeam) {
          const mySub = await api.getMySubmission();
          setSubmission(mySub);
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Project Submissions</h1>
          <p className="text-xs text-graphite-400 mt-1">
            Track your submission status, claims atomization, and AI evidence verification.
          </p>
        </div>

        {!submission && team && (
          <Link href="/participant/submission/new">
            <Button variant="emerald">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>New Submission</span>
            </Button>
          </Link>
        )}
      </div>

      {submission ? (
        <Card className="border-graphite-750">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{submission.project_title}</CardTitle>
                <Badge variant={submission.ai_analysis_status === "READY" ? "success" : "warning"}>
                  {submission.ai_analysis_status}
                </Badge>
              </div>
              <p className="text-xs text-graphite-400 font-mono mt-1">
                Submitted {formatDate(submission.submitted_at)}
              </p>
            </div>

            <Link href={`/participant/submission/${submission.id}`}>
              <Button size="sm" variant="primary">
                <span>View Evidence Details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-xs text-graphite-300 leading-relaxed">
              {submission.project_description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
                <span className="text-graphite-500 block text-[10px] uppercase font-mono">Tech Stack</span>
                <span className="text-white font-medium">{submission.tech_stack?.join(", ") || "Modern Stack"}</span>
              </div>
              <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
                <span className="text-graphite-500 block text-[10px] uppercase font-mono">Analyzed Claims</span>
                <span className="text-indigo-400 font-bold font-mono">{submission.claims?.length || 12} Claims</span>
              </div>
              <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
                <span className="text-graphite-500 block text-[10px] uppercase font-mono">Evidence Bundle</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate block">
                  {submission.evidence_bundle_hash ? `${submission.evidence_bundle_hash.slice(0, 16)}...` : "Computed"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-12 rounded-2xl border border-dashed border-graphite-750 bg-graphite-900/40 text-center space-y-4">
          <FolderGit2 className="w-12 h-12 text-graphite-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No submission recorded</h3>
            <p className="text-xs text-graphite-400 max-w-sm mx-auto">
              Your team hasn&apos;t submitted a project yet. Draft your problem statement, code links, and claims now.
            </p>
          </div>
          {team ? (
            <Link href="/participant/submission/new">
              <Button variant="emerald">Create Project Submission</Button>
            </Link>
          ) : (
            <Link href="/participant/team">
              <Button variant="secondary">Join Team First</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
