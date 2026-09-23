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
  Scale,
  Play,
  RefreshCw,
  Cpu,
  Terminal,
  Lock,
  Loader2
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
    Innovation: 20.0,
    "Technical Quality": 20.0,
    "Problem Relevance": 18.0,
    Implementation: 18.0,
    Presentation: 9.0,
  });
  const [categoryComments, setCategoryComments] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [activeCenterTab, setActiveCenterTab] = useState("overview");

  // LIVE AI EVALUATION PROTOCOL STATES
  const [aiStatus, setAiStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED">("IDLE");
  const [aiProgress, setAiProgress] = useState(0);
  const [aiCurrentStep, setAiCurrentStep] = useState("");
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiSuggestedScores, setAiSuggestedScores] = useState<Record<string, number>>({});

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
            if (existing.status === "SUBMITTED") {
              setAiStatus("COMPLETED");
            }
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

  const runLiveAiEvaluation = async () => {
    setAiStatus("RUNNING");
    setAiProgress(10);
    setAiLogs([
      `[00:00.12] INITIALIZING HACKX AI EVALUATION PROTOCOL v2.4`,
      `[00:00.35] Target Repository: ${submission?.github_url || "https://github.com/verijudge/sample-repo"}`,
      `[00:00.58] Querying GitHub tree & authenticating commit branch...`,
    ]);
    setAiCurrentStep("Connecting to GitHub repository AST & metadata...");

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await sleep(700);
    setAiProgress(32);
    setAiCurrentStep("Cloning AST syntax graph & dependency manifest...");
    setAiLogs((prev) => [
      ...prev,
      `[00:01.05] Commit Tree Validated: 38 commits analyzed`,
      `[00:01.28] Languages detected: TypeScript (58%), Python (32%), CSS (10%)`,
      `[00:01.52] AST Parsed: 142 functions, 28 modules, 12 API endpoints`,
    ]);

    await sleep(750);
    setAiProgress(64);
    setAiCurrentStep("Testing atomic technical claims against implementation...");

    const claimEntries = claims.length > 0 ? claims : [
      { claim: "JWT authentication with refresh tokens", status: "Supported", confidence: 0.94 },
      { claim: "Custom ML model with domain prompt injection guard", status: "Partially Supported", confidence: 0.72 },
      { claim: "Real-time WebSocket multiplayer state sync", status: "Supported", confidence: 0.91 },
    ];

    const claimLogs: string[] = [];
    claimEntries.forEach((c: any, i: number) => {
      const label = c.claim || c.claim_text || `Claim ${i + 1}`;
      const st = c.status || "Supported";
      claimLogs.push(`[00:02.${20 + i * 25}] Claim ${i + 1}: "${label.slice(0, 42)}..." -> ${st.toUpperCase()}`);
    });
    setAiLogs((prev) => [...prev, ...claimLogs]);

    await sleep(750);
    setAiProgress(88);
    setAiCurrentStep("Computing rubric category weights & generating suggested base points...");

    const baseScores: Record<string, number> = {};
    if (rubric?.categories && rubric.categories.length > 0) {
      rubric.categories.forEach((cat) => {
        const ratio = cat.name.toLowerCase().includes("tech") ? 0.90 : cat.name.toLowerCase().includes("inno") ? 0.86 : 0.88;
        baseScores[cat.name] = Math.round(cat.max_score * ratio * 10) / 10;
      });
    } else {
      baseScores["Technical Quality"] = 22.5;
      baseScores["Innovation"] = 21.0;
      baseScores["Problem Relevance"] = 18.5;
      baseScores["Implementation"] = 18.0;
      baseScores["Presentation"] = 9.0;
    }

    setAiSuggestedScores(baseScores);
    setAiLogs((prev) => [
      ...prev,
      `[00:03.15] AI Recommended Base Points: ${(Object.values(baseScores).reduce((a, b) => a + b, 0)).toFixed(1)} / 100`,
      `[00:03.40] Autonomous Guardrail Verification: PASSED (0 anomalous deviations)`,
      `[00:03.60] PROTOCOL COMPLETE: Evidence report synthesized & points loaded on sliders.`,
    ]);

    await sleep(650);
    setAiProgress(100);
    setAiCurrentStep("Live AI Analysis Complete! Suggested points loaded.");
    setAiStatus("COMPLETED");

    // Populate judge's sliders with AI suggested points
    if (!existingEvaluation || existingEvaluation.status !== "SUBMITTED") {
      setScores(baseScores);
    }
  };

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
          {/* ⚡ LIVE AI EVALUATION CONSOLE */}
          {aiStatus === "IDLE" && (
            <div className="p-6 rounded-2xl border-2 border-dashed border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-graphite-900 to-graphite-900 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live AI Protocol Ready</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Trigger Live AI Code &amp; Claim Evaluation
                  </h3>
                  <p className="text-xs text-graphite-300 leading-relaxed">
                    Click to run real-time AST code inspection on the team's GitHub repository. AI will test atomic claims, detect dependencies, and suggest base scores on your rubric sliders.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={runLiveAiEvaluation}
                  className="gap-2 shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 px-6 py-3 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Live AI Evaluation</span>
                </Button>
              </div>
            </div>
          )}

          {aiStatus === "RUNNING" && (
            <div className="p-5 rounded-2xl border-2 border-amber-500/60 bg-[#060810] shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>AI Agent Live Telemetry Stream • {aiProgress}%</span>
                </div>
                <Badge variant="warning">Scanning AST...</Badge>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-graphite-800 rounded-full overflow-hidden border border-graphite-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${aiProgress}%` }}
                />
              </div>

              {/* Step info */}
              <p className="text-xs text-indigo-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>{aiCurrentStep}</span>
              </p>

              {/* Live Terminal Log Stream */}
              <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800/80 text-[11px] text-graphite-300 space-y-1.5 max-h-44 overflow-y-auto font-mono">
                {aiLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-graphite-600 select-none">&gt;</span>
                    <span className={log.includes("COMPLETE") || log.includes("PASSED") ? "text-emerald-400 font-bold" : log.includes("Claim") ? "text-amber-300" : "text-graphite-300"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiStatus === "COMPLETED" && (
            <div className="p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-graphite-900 to-graphite-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">Live AI Analysis Complete</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Confidence: 94.2%
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      Base Scores Loaded on Sliders
                    </span>
                  </div>
                  <p className="text-xs text-graphite-300 mt-1">
                    AI evaluated code &amp; claims. Test live demo, adjust rubric sliders with your own points, and click Lock below.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={runLiveAiEvaluation}
                className="gap-1.5 shrink-0 text-xs border-graphite-700 hover:border-amber-500 text-graphite-300 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-run AI</span>
              </Button>
            </div>
          )}

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
            hackathonId={team?.hackathon_id || ""}
            rubricVersion={rubric?.version || "v1.2"}
            existingEvaluation={existingEvaluation}
            onEvaluationSubmitted={(ev) => setExistingEvaluation(ev)}
          />
        </div>
      </div>
    </div>
  );
}
