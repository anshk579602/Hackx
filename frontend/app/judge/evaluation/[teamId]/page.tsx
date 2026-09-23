"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Team, Submission, Rubric, Evaluation, Claim } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ScoringPanel } from "@/components/judge/ScoringPanel";
import { EvidenceCard } from "@/components/judge/EvidenceCard";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Flame,
  Scale
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JudgeEvaluationWorkspacePage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [existingEvaluation, setExistingEvaluation] = useState<Evaluation | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scoring states
  const [scores, setScores] = useState<Record<string, number>>({
    Innovation: 22.0,
    "Technical Quality": 24.0, // Pre-filled to demonstrate guardrail trigger!
    "Problem Relevance": 18.0,
    Implementation: 18.0,
    Presentation: 9.0,
  });
  const [categoryComments, setCategoryComments] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [activeCenterTab, setActiveCenterTab] = useState("overview");

  useEffect(() => {
    async function loadWorkspace() {
      setIsLoading(true);
      try {
        const teamsList = await api.listTeams();
        setAllTeams(teamsList);
        const currentTeam = teamsList.find((t) => t.id === teamId) || teamsList[0] || null;
        setTeam(currentTeam);

        if (currentTeam) {
          // Fetch submission
          const sub = currentTeam.submission || (await api.listSubmissions()).find((s) => s.team_id === currentTeam.id) || null;
          setSubmission(sub);

          if (sub) {
            const evData = await api.getAiEvidence(sub.id);
            if (evData?.claims) setClaims(evData.claims);
          }

          // Fetch active rubric
          const rubrics = await api.listRubrics(currentTeam.hackathon_id);
          const activeRubric = rubrics.find((r) => r.is_active) || rubrics[0] || null;
          setRubric(activeRubric);

          // Fetch existing evaluation if any
          const evals = await api.listEvaluations({
            team_id: currentTeam.id,
            judge_id: user?.id,
          });
          const existing = evals[0] || null;
          setExistingEvaluation(existing);

          if (existing) {
            setScores(existing.category_scores || scores);
            setCategoryComments(existing.category_comments || {});
            setOverallFeedback(existing.overall_feedback || "");
          }
        }
      } catch (err) {
        console.error("Workspace load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, [teamId, user]);

  const handleScoreChange = (categoryName: string, val: number) => {
    setScores((prev) => ({ ...prev, [categoryName]: val }));
  };

  const handleCommentChange = (categoryName: string, text: string) => {
    setCategoryComments((prev) => ({ ...prev, [categoryName]: text }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const centerTabs = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "AI Evidence Report", badge: claims.length },
    { id: "claims", label: "Claims Inspector" },
    { id: "files", label: "Files & Architecture" },
    { id: "history", label: "Evaluation History" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-graphite-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/judge/assigned-teams"
            className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {team?.name || "Evaluation Workspace"}
              </h1>
              {existingEvaluation?.status === "SUBMITTED" ? (
                <Badge variant="success">Finalized &amp; Anchored</Badge>
              ) : (
                <Badge variant="warning">In Review</Badge>
              )}
            </div>
            <p className="text-xs text-graphite-400 font-mono mt-0.5">
              Project: <span className="text-indigo-300 font-semibold">{submission?.project_title}</span> • Rubric: {rubric?.version || "v1.2"}
            </p>
          </div>
        </div>

        {/* Challenge prompt callout */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-graphite-400 font-mono hidden sm:inline">
            Guardrail: <strong className="text-emerald-400 font-sans">Active</strong>
          </span>
        </div>
      </div>

      {/* 3-Column / Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Teams Switcher (2 cols) */}
        <div className="lg:col-span-2 hidden lg:flex flex-col space-y-3">
          <span className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider px-1">
            Assigned Queue
          </span>
          <div className="space-y-1.5">
            {allTeams.map((t) => {
              const isActive = t.id === team?.id;
              return (
                <Link
                  key={t.id}
                  href={`/judge/evaluation/${t.id}`}
                  className={`block p-2.5 rounded-xl border text-xs transition-colors ${
                    isActive
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-sm"
                      : "bg-graphite-850/80 border-graphite-800 text-graphite-400 hover:text-white hover:bg-graphite-800"
                  }`}
                >
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="text-[10px] text-graphite-500 truncate mt-0.5">
                    {t.submission?.project_title || "Pending"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center Column: Project Details & Evidence Tabs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <Tabs
            tabs={centerTabs}
            activeTab={activeCenterTab}
            onChange={setActiveCenterTab}
          />

          {/* TAB 1: OVERVIEW */}
          {activeCenterTab === "overview" && (
            <div className="space-y-5">
              <Card className="border-graphite-750">
                <CardHeader>
                  <CardTitle className="text-base">Problem &amp; Solution Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <span className="text-graphite-400 block font-semibold mb-1">Problem Statement:</span>
                    <p className="text-graphite-200 leading-relaxed bg-graphite-900/60 p-3 rounded-xl border border-graphite-800">
                      {submission?.problem_statement}
                    </p>
                  </div>

                  <div>
                    <span className="text-graphite-400 block font-semibold mb-1">Project Description:</span>
                    <p className="text-graphite-200 leading-relaxed bg-graphite-900/60 p-3 rounded-xl border border-graphite-800">
                      {submission?.project_description}
                    </p>
                  </div>

                  {/* Links Row */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {submission?.github_url && (
                      <a
                        href={submission.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-graphite-700 bg-graphite-800 hover:bg-graphite-750 text-xs text-graphite-200 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5 text-indigo-400" />
                        <span>GitHub Repository</span>
                        <ExternalLink className="w-3 h-3 text-graphite-400" />
                      </a>
                    )}
                    {submission?.live_demo_url && (
                      <a
                        href={submission.live_demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-emerald-700/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-xs text-emerald-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rubric Category Evidence Summaries */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider block">
                  AI Rubric Alignment Summary
                </span>

                {(rubric?.categories || []).map((cat) => {
                  const catClaims = claims.filter((c) => c.category === cat.name);
                  const supportedCount = catClaims.filter((c) => c.status === "Supported").length;
                  const concernCount = catClaims.filter((c) => c.status === "Unsupported" || c.status === "Contradicted").length;

                  return (
                    <div
                      key={cat.id || cat.name}
                      className="p-4 rounded-xl border border-graphite-750 bg-graphite-850/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{cat.name}</span>
                          <span className="text-graphite-500 font-mono">({cat.max_score} pts max)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">{supportedCount} Supported</span>
                          {concernCount > 0 && (
                            <span className="text-rose-400 font-semibold">• {concernCount} Concerns</span>
                          )}
                        </div>
                      </div>

                      <p className="text-graphite-400 text-[11px]">{cat.evaluation_criteria}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI EVIDENCE REPORT */}
          {activeCenterTab === "evidence" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Autonomous AI Evidence Synthesis</span>
                </div>
                <p className="text-graphite-300 leading-relaxed">
                  {submission?.project_summary || "AI analyzed submission artifacts against rubric categories without hallucinations."}
                </p>
              </div>

              <div className="space-y-3">
                {claims.map((claim, idx) => (
                  <EvidenceCard key={claim.id || idx} claim={claim} />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CLAIMS INSPECTOR */}
          {activeCenterTab === "claims" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-graphite-800">
                <span className="text-xs text-graphite-400">
                  Showing all {claims.length} claims extracted from submission metadata.
                </span>
              </div>
              {claims.map((claim, idx) => (
                <EvidenceCard key={claim.id || idx} claim={claim} />
              ))}
            </div>
          )}

          {/* TAB 4: FILES & ARCHITECTURE */}
          {activeCenterTab === "files" && (
            <div className="space-y-4">
              <Card className="border-graphite-750">
                <CardHeader>
                  <CardTitle className="text-base">Submission Artifacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-graphite-900 border border-graphite-800">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="font-semibold text-white">Project Pitch Deck (PDF)</p>
                        <p className="text-[11px] text-graphite-400">{submission?.ppt_url || "genx-pitch-v1.2.pdf"}</p>
                      </div>
                    </div>
                    <Badge variant="indigo">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-graphite-900 border border-graphite-800">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-white">System Architecture Diagram</p>
                        <p className="text-[11px] text-graphite-400">{submission?.architecture_url || "genx-architecture.png"}</p>
                      </div>
                    </div>
                    <Badge variant="success">Attached</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: EVALUATION HISTORY */}
          {activeCenterTab === "history" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-graphite-750 bg-graphite-850 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Evaluation Audit Trail</span>
                </h4>
                <p className="text-graphite-400">
                  All drafts and finalized decisions are logged with tamper-evident hashes.
                </p>
                <div className="pt-2">
                  <Link href={`/evaluation/${existingEvaluation?.id || teamId}/replay`}>
                    <Button size="sm" variant="outline">
                      Open Step-by-Step Decision Replay
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Scoring Panel (4 cols) */}
        <div className="lg:col-span-4">
          <ScoringPanel
            categories={rubric?.categories || []}
            scores={scores}
            onScoreChange={handleScoreChange}
            categoryComments={categoryComments}
            onCommentChange={handleCommentChange}
            overallFeedback={overallFeedback}
            onOverallFeedbackChange={setOverallFeedback}
            teamId={team?.id || teamId}
            hackathonId={team?.hackathon_id || "innovatex-2026"}
            rubricVersion={rubric?.version || "v1.2"}
            existingEvaluation={existingEvaluation}
            onEvaluationSubmitted={(ev) => setExistingEvaluation(ev)}
          />
        </div>
      </div>
    </div>
  );
}
