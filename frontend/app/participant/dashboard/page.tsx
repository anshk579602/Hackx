"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Team, Submission, Hackathon } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AnalysisTimeline } from "@/components/submission/AnalysisTimeline";
import {
  Trophy,
  Users,
  FolderGit2,
  PlusCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Rocket
} from "lucide-react";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [myTeam, hacks] = await Promise.all([
          api.getMyTeam(),
          api.listHackathons()
        ]);
        setTeam(myTeam);
        setHackathons(hacks || []);
        if (myTeam) {
          const mySub = await api.getMySubmission();
          setSubmission(mySub);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || "Hacker"}
            </h1>
            <Badge variant="success">Verified Participant</Badge>
          </div>
          <p className="text-xs text-graphite-400 mt-1">
            Participant Portal • Real-Time AI Evidence &amp; Tamper-Evident Scoring
          </p>
        </div>

        {team && !submission && (
          <Link href="/participant/submission/new">
            <Button variant="emerald" className="gap-2 shadow-lg shadow-emerald-600/20">
              <PlusCircle className="w-4 h-4" />
              <span>Submit Project</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Onboarding Guide if no team exists */}
      {!team && (
        <div className="space-y-6">
          <Card className="border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-graphite-900 to-graphite-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Participant Setup Required</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Join or Form Your Team to Get Started
                  </h2>
                  <p className="text-sm text-graphite-300 leading-relaxed">
                    To submit your repository and claim verification, create a new squad for an active hosted hackathon or join an existing team with an invite code.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link href="/participant/team">
                    <Button size="lg" variant="emerald" className="gap-2 shadow-xl shadow-emerald-600/30 font-semibold px-6 py-3.5">
                      <PlusCircle className="w-5 h-5" />
                      <span>Form Squad</span>
                    </Button>
                  </Link>
                  <Link href="/participant/team">
                    <Button size="lg" variant="outline" className="border-graphite-700 text-graphite-200">
                      <span>Join with Code</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 3 Step Process Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-graphite-800/80">
                <div className="p-4 rounded-2xl bg-graphite-950/60 border border-graphite-800 space-y-1">
                  <div className="text-xs font-mono font-bold text-emerald-400">Step 1</div>
                  <div className="text-sm font-bold text-white">Squad Formation</div>
                  <div className="text-xs text-graphite-400">Select a hosted event and register your squad name.</div>
                </div>
                <div className="p-4 rounded-2xl bg-graphite-950/60 border border-graphite-800 space-y-1">
                  <div className="text-xs font-mono font-bold text-emerald-400">Step 2</div>
                  <div className="text-sm font-bold text-white">Project Submission</div>
                  <div className="text-xs text-graphite-400">Enter GitHub repo link and atomic technical claims.</div>
                </div>
                <div className="p-4 rounded-2xl bg-graphite-950/60 border border-graphite-800 space-y-1">
                  <div className="text-xs font-mono font-bold text-emerald-400">Step 3</div>
                  <div className="text-sm font-bold text-white">AI Evidence Audit</div>
                  <div className="text-xs text-graphite-400">AI maps repository AST to verify all pitch claims.</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Hosted Hackathons Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Hosted Hackathons Open for Registration</span>
              </h3>
              <Badge variant="indigo">
                {hackathons.length} {hackathons.length === 1 ? "Event" : "Events"} Live
              </Badge>
            </div>

            {hackathons.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-graphite-800 bg-graphite-900/40 text-center space-y-2">
                <Trophy className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="text-sm font-semibold text-white">No Hackathons Hosted Yet</p>
                <p className="text-xs text-graphite-400 max-w-sm mx-auto">
                  Organisers have not published any hackathons yet. As soon as an organiser hosts an event, it will appear here so you can register your squad.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.map((h) => (
                  <div
                    key={h.id}
                    className="p-5 rounded-2xl border border-graphite-800 bg-graphite-900/80 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-base line-clamp-1">{h.title}</h4>
                        <Badge variant="success">{h.status || "ACTIVE"}</Badge>
                      </div>
                      {h.tagline && (
                        <p className="text-xs text-emerald-400 font-medium line-clamp-1">{h.tagline}</p>
                      )}
                      {h.description && (
                        <p className="text-xs text-graphite-400 line-clamp-2 leading-relaxed">{h.description}</p>
                      )}
                    </div>
                    <Link href="/participant/team" className="w-full pt-2">
                      <Button variant="emerald" size="sm" className="w-full gap-1.5 font-medium">
                        <span>Register Squad</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team and Submission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Team Card */}
        <Card className="border-graphite-800 bg-graphite-900/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">
                Your Team
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <CardTitle className="text-xl text-white">
              {team ? team.name : "No Team Joined"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {team ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-graphite-400">
                  <span>Join Code:</span>
                  <span className="font-mono font-bold text-white tracking-wider px-2 py-0.5 rounded bg-graphite-800">
                    {team.join_code}
                  </span>
                </div>
                <div className="flex justify-between text-graphite-400">
                  <span>Members:</span>
                  <span className="font-semibold text-white">{team.members?.length || 1} hacker(s)</span>
                </div>
                <Link
                  href="/participant/team"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold pt-1"
                >
                  <span>Manage Team Roster</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-graphite-400">You haven&apos;t joined or created a team yet.</p>
                <Link href="/participant/team">
                  <Button size="sm" variant="secondary" className="w-full">
                    Create or Join Team
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Submission Card */}
        <Card className="border-graphite-800 bg-graphite-900/90 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">
                Project Submission
              </span>
              {submission ? (
                <Badge variant="success">Submitted</Badge>
              ) : (
                <Badge variant="warning">Not Submitted</Badge>
              )}
            </div>
            <CardTitle className="text-xl text-white">
              {submission ? submission.project_title : "Ready for Submission"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submission ? (
              <div className="space-y-3 text-xs">
                <p className="text-graphite-300 line-clamp-2">{submission.project_description}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {submission.github_url && (
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                    >
                      <span>Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {submission.live_demo_url && (
                    <a
                      href={submission.live_demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Link
                    href={`/participant/submission/${submission.id}`}
                    className="ml-auto text-indigo-400 hover:underline font-semibold"
                  >
                    View Claims &amp; Verification Details &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-graphite-400">
                  Ready to compete? Fill in project links, architecture diagrams, and list your verifiable claims.
                </p>
                <Link href={team ? "/participant/submission/new" : "/participant/team"}>
                  <Button size="sm" variant="emerald">
                    {team ? "Start Project Submission" : "Create Team First"}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Timeline (If submission exists) */}
      {submission && (
        <AnalysisTimeline
          currentStatus={submission.ai_analysis_status}
          statusMessage={submission.ai_status_message}
          claimsCount={submission.claims?.length || 0}
          bundleHash={submission.evidence_bundle_hash || undefined}
        />
      )}

      {/* Hackathon Milestones & Info */}
      <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/60 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-400" />
          <span>HackX Participant &amp; Judging Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-graphite-300">
          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 space-y-1">
            <span className="font-semibold text-white">1. Evidence First</span>
            <p className="text-graphite-400">Ensure your GitHub repository includes clear build instructions and automated test coverage.</p>
          </div>
          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 space-y-1">
            <span className="font-semibold text-white">2. Avoid Empty Claims</span>
            <p className="text-graphite-400">Avoid stating scale benchmarks (e.g. 10k users) unless backed by committed stress test scripts.</p>
          </div>
          <div className="p-4 rounded-xl bg-graphite-950 border border-graphite-800 space-y-1">
            <span className="font-semibold text-white">3. Tamper-Proof</span>
            <p className="text-graphite-400">Once finalized, judge scores are anchored to Polygon Amoy blockchain and cannot be modified.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
