"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Hackathon, Team, Evaluation, IntegrityOverview, AnomalyDashboardData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import {
  Trophy,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  CheckCircle2,
  ArrowRight,
  Flame,
  BarChart3,
  PlusCircle,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityOverview | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const hacks = await api.listHackathons();
        const active = hacks[0] || null;
        setHackathon(active);

        const teamList = await api.listTeams();
        setTeams(teamList);

        const evalList = await api.listEvaluations();
        setEvaluations(evalList);

        const integrityData = await api.getIntegrityOverview();
        setIntegrity(integrityData);

        const anomalyData = await api.getAnomalyDashboard();
        setAnomalies(anomalyData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const hasTamperViolation = integrity?.system_status === "INTEGRITY_VIOLATION";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Organiser Command Center
            </h1>
            <Badge variant="indigo">Verified Host</Badge>
          </div>
          <p className="text-xs text-graphite-400 mt-1">
            {hackathon ? (
              <>
                Active Event: <strong className="text-white">{hackathon.title}</strong> • Status: {hackathon.status}
              </>
            ) : (
              <span>No hackathon active yet. Create your first event below to get started.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/organizer/hackathons/new">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-lg shadow-indigo-600/20">
              <PlusCircle className="w-4 h-4" />
              <span>Create Hackathon</span>
            </Button>
          </Link>

          <Link href="/organizer/integrity">
            <Button
              variant={hasTamperViolation ? "danger" : "outline"}
              size="sm"
              className={hasTamperViolation ? "animate-pulse" : ""}
            >
              {hasTamperViolation ? (
                <>
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  <span>Tampering Detected!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
                  <span>Integrity Center</span>
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding Wizard when no hackathon exists */}
      {!hackathon && (
        <Card className="border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-graphite-900 to-graphite-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Started in 3 Simple Steps</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome to HackJudge, {user?.full_name || "Organiser"}!
                </h2>
                <p className="text-sm text-graphite-300 leading-relaxed">
                  Your platform is freshly initialized with zero mock data. Follow the 3-step checklist below to launch your transparent, verifiable hackathon.
                </p>
              </div>

              <Link href="/organizer/hackathons/new" className="shrink-0">
                <Button size="lg" variant="primary" className="gap-2 shadow-xl shadow-indigo-600/30 font-semibold px-6 py-3.5">
                  <PlusCircle className="w-5 h-5" />
                  <span>Create First Hackathon</span>
                </Button>
              </Link>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl border border-graphite-800 bg-graphite-950/80 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Create Hackathon</h4>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Set event title, tagline, description, tracks, and submission dates.
                </p>
                <Link href="/organizer/hackathons/new" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1">
                  Start setup <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl border border-graphite-800 bg-graphite-950/80 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Define Rubric</h4>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Set evaluation categories (Technical, Innovation, Rigor) with immutable versioning.
                </p>
                <Link href="/organizer/rubrics" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-1">
                  Setup rubric <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-5 rounded-2xl border border-graphite-800 bg-graphite-950/80 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Invite &amp; Evaluate</h4>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  Invite participants &amp; judges. AI evidence and autonomous score guardrails run automatically.
                </p>
                <Link href="/organizer/judges" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold pt-1">
                  Invite evaluators <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tamper Alert Notice Banner if simulated */}
      {hasTamperViolation && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/60 flex items-center justify-between gap-4 shadow-xl glow-rose">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">Cryptographic Tampering Detected</h3>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Database records differ from on-chain anchors. Result publication is locked until resolved.
              </p>
            </div>
          </div>
          <Link href="/organizer/integrity">
            <Button variant="danger" size="sm">
              Inspect in Integrity Center &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Active Teams</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-white">{teams.length}</div>
            <p className="text-xs text-graphite-400 mt-1">Participating squads</p>
          </CardContent>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Evaluations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{evaluations.length}</div>
            <p className="text-xs text-graphite-400 mt-1">Finalized on-chain</p>
          </CardContent>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {anomalies?.teams_with_anomalies || 0}
            </div>
            <p className="text-xs text-graphite-400 mt-1">Cross-judge deviations</p>
          </CardContent>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Integrity Proofs</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold font-mono text-white">
              {integrity?.verified_count || 0}
            </div>
            <p className="text-xs text-graphite-400 mt-1">100% Keccak-256 anchored</p>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Judge Scoring Distribution Chart */}
      <Card className="border-graphite-800 bg-graphite-900/90">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base text-white">Cross-Judge Score Distribution &amp; Deviation</CardTitle>
            <p className="text-xs text-graphite-400">
              Mean evaluation scores and standard deviation across judging panels. Amber bars denote anomaly review recommendations.
            </p>
          </div>
          <Link href="/organizer/anomalies">
            <Button size="sm" variant="outline" className="text-xs border-graphite-700">
              Anomaly Engine &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-graphite-800 rounded-2xl bg-graphite-950/40">
              <BarChart3 className="w-8 h-8 text-graphite-600 mx-auto" />
              <p className="text-sm font-semibold text-graphite-300">No score data to display yet</p>
              <p className="text-xs text-graphite-500 max-w-sm mx-auto">
                Once participants submit projects and judges submit their evaluations, live cross-judge score deviation charts will appear here.
              </p>
            </div>
          ) : (
            <ScoreDistributionChart
              data={(anomalies?.team_statistics || []).map((t) => ({
                team_name: t.team_name,
                mean_score: t.mean_score,
                std_deviation: t.std_deviation,
                has_anomaly: t.has_anomaly,
              }))}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/80 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Scale className="w-4 h-4" />
            <span>Rubric Governance</span>
          </div>
          <p className="text-xs text-graphite-400 leading-relaxed">
            Configure weighted categories (Technical Quality, Innovation, Rigor, Impact). Rubrics remain immutable once evaluations have begun.
          </p>
          <Link href="/organizer/rubrics" className="block pt-1">
            <Button size="sm" variant="secondary" className="w-full text-xs">
              Manage Rubric Versions
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Integrity</span>
          </div>
          <p className="text-xs text-graphite-400 leading-relaxed">
            Monitor real-time Keccak-256 on-chain hash validation on Polygon Amoy. Simulates and prevents unauthorized database score tampering.
          </p>
          <Link href="/organizer/integrity" className="block pt-1">
            <Button size="sm" variant="outline" className="w-full text-xs border-graphite-700">
              Open Integrity Center
            </Button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/80 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Publish Results</span>
          </div>
          <p className="text-xs text-graphite-400 leading-relaxed">
            Publish final standings to participants once all evaluations pass integrity validation and anomaly audits.
          </p>
          <Link href="/organizer/results" className="block pt-1">
            <Button size="sm" variant="emerald" className="w-full text-xs">
              Review Final Rankings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
