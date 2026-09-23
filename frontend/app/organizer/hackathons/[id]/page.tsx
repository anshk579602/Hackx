"use client";

import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Hackathon, Rubric } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  ArrowLeft,
  Calendar,
  Users,
  Scale,
  Award,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Code,
  ShieldCheck,
  RefreshCw,
  FolderGit2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TeamSummaryItem {
  team_id: string;
  team_name: string;
  join_code: string;
  member_count: number;
  members: Array<{
    user_id: string;
    name: string;
    email: string;
    role_in_team: string;
  }>;
  has_submission: boolean;
  submission_id?: string | null;
  project_title?: string | null;
  submission_url?: string | null;
  evaluation_count: number;
  avg_score?: number | null;
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Safely unwrap ID
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teamsSummary, setTeamsSummary] = useState<TeamSummaryItem[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editRubricId, setEditRubricId] = useState("");
  const [editMinTeamSize, setEditMinTeamSize] = useState(1);
  const [editMaxTeamSize, setEditMaxTeamSize] = useState(4);
  const [isSaving, setIsSaving] = useState(false);

  // Publish Status
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  // Expanded team row
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const loadData = async () => {
    if (!id || id === "undefined") {
      setErrorMsg("Invalid Hackathon ID specified.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMsg(null);
      const [h, summaryData, rList] = await Promise.all([
        api.getHackathon(id),
        api.getHackathonTeamsSummary(id).catch(() => ({ teams: [] })),
        api.listRubrics().catch(() => [])
      ]);

      setHackathon(h);
      setTeamsSummary(summaryData.teams || []);
      setRubrics(rList);

      // Populate edit fields
      setEditTitle(h.title);
      setEditTagline(h.tagline || "");
      setEditDescription(h.description || "");
      setEditStatus(h.status);
      setEditRubricId(h.active_rubric_id || "");
      setEditMinTeamSize(h.min_team_size || 1);
      setEditMaxTeamSize(h.max_team_size || 4);
    } catch (err: any) {
      console.error("Failed to load hackathon data:", err);
      setErrorMsg(err.message || "Could not retrieve hackathon details from the server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !hackathon) return;
    if (editMinTeamSize > editMaxTeamSize) {
      alert("Minimum team size cannot be greater than maximum team size.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.updateHackathon(id, {
        title: editTitle.trim(),
        tagline: editTagline.trim(),
        description: editDescription.trim(),
        status: editStatus,
        active_rubric_id: editRubricId || undefined,
        min_team_size: Number(editMinTeamSize) || 1,
        max_team_size: Number(editMaxTeamSize) || 4,
      });
      setHackathon(updated);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (!id || !hackathon) return;
    const confirmPublish = window.confirm(
      "Are you sure you want to finalize and publish the evaluation results for this event? All evaluations will undergo cryptographic integrity verification."
    );
    if (!confirmPublish) return;

    setIsPublishing(true);
    setPublishMessage(null);
    try {
      const res = await api.publishResults(id);
      setPublishMessage(res.message);
      setHackathon((prev) => (prev ? { ...prev, is_published: true, status: "COMPLETED" } : null));
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !hackathon) return;
    const confirmDelete = window.confirm(
      `Permanently delete "${hackathon.title}"? This will erase all teams, registrations, and evaluations for this event.`
    );
    if (!confirmDelete) return;

    try {
      await api.deleteHackathon(id);
      router.push("/organizer/hackathons");
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-xs text-graphite-400 font-mono tracking-wider animate-pulse">
          LOADING EVENT DATA...
        </p>
      </div>
    );
  }

  if (errorMsg || !hackathon) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-glow-rose">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Event Endpoint Notice</h2>
        <p className="text-sm text-graphite-400 leading-relaxed">
          {errorMsg || "The requested hackathon could not be found or has been removed."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <Link href="/organizer/hackathons">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Hackathons</span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Retry Connection</span>
          </Button>
        </div>
      </div>
    );
  }

  // Calculated stats
  const totalTeams = teamsSummary.length;
  const totalParticipants = teamsSummary.reduce((acc, t) => acc + t.member_count, 0);
  const totalSubmissions = teamsSummary.filter((t) => t.has_submission).length;
  const evaluatedTeams = teamsSummary.filter((t) => t.evaluation_count > 0).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/organizer/hackathons"
            className="p-2 rounded-xl border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {hackathon.title}
              </h1>
              <Badge
                variant={
                  hackathon.status === "ACTIVE"
                    ? "success"
                    : hackathon.status === "EVALUATING"
                    ? "warning"
                    : "indigo"
                }
              >
                {hackathon.status}
              </Badge>
              {hackathon.is_published && (
                <Badge variant="indigo" className="gap-1">
                  <Award className="w-3 h-3" />
                  <span>Results Live</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-graphite-400 mt-1 font-medium">{hackathon.tagline}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 text-xs text-graphite-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit Event</span>
          </Button>

          {!hackathon.is_published && (
            <Button
              size="sm"
              variant="primary"
              onClick={handlePublishResults}
              disabled={isPublishing}
              className="gap-1.5 text-xs shadow-lg shadow-indigo-600/25"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isPublishing ? "Verifying & Publishing..." : "Publish Results"}</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            className="gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {publishMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{publishMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-graphite-750 bg-gradient-to-br from-indigo-950/20 to-graphite-900/60 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Registered Teams</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalTeams}</div>
          <p className="text-[10px] text-graphite-500 mt-1 font-mono">
            Squad size: {hackathon.min_team_size || 1}-{hackathon.max_team_size || 4}
          </p>
        </Card>

        <Card className="border-graphite-750 bg-gradient-to-br from-teal-950/20 to-graphite-900/60 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Hackers</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalParticipants}</div>
          <p className="text-[10px] text-graphite-500 mt-1 font-mono">Active participants</p>
        </Card>

        <Card className="border-graphite-750 bg-gradient-to-br from-cyan-950/20 to-graphite-900/60 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Submissions</span>
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalSubmissions}</div>
          <p className="text-[10px] text-graphite-500 mt-1 font-mono">
            {totalTeams > 0 ? `${Math.round((totalSubmissions / totalTeams) * 100)}% Turnout` : "Awaiting teams"}
          </p>
        </Card>

        <Card className="border-graphite-750 bg-gradient-to-br from-amber-950/20 to-graphite-900/60 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Evaluated</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{evaluatedTeams}</div>
          <p className="text-[10px] text-graphite-500 mt-1 font-mono">
            {totalSubmissions > 0 ? `${evaluatedTeams}/${totalSubmissions} complete` : "Pending submissions"}
          </p>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Teams & Members (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Registered Teams &amp; Rosters
              </h2>
              <p className="text-xs text-graphite-400">
                Click any team to inspect member breakdown (up to {hackathon.max_team_size || 4} members), join codes, and submission telemetry.
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {totalTeams} Teams Enrolled
            </Badge>
          </div>

          {teamsSummary.length === 0 ? (
            <Card className="border-dashed border-graphite-800 p-8 text-center rounded-2xl bg-graphite-900/40">
              <Users className="w-8 h-8 text-graphite-600 mx-auto mb-2" />
              <p className="text-sm text-graphite-300 font-medium">No teams registered yet</p>
              <p className="text-xs text-graphite-500 mt-1">
                Participants will appear here automatically when they form a team for this hackathon.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {teamsSummary.map((t) => {
                const isExpanded = expandedTeamId === t.team_id;
                return (
                  <Card
                    key={t.team_id}
                    className="border-graphite-750 hover:border-graphite-700 transition-all rounded-2xl overflow-hidden"
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedTeamId(isExpanded ? null : t.team_id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-white text-sm">{t.team_name}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-graphite-800 text-indigo-300 border border-graphite-700">
                            CODE: {t.join_code}
                          </span>
                          <Badge variant={t.has_submission ? "success" : "default"}>
                            {t.has_submission ? "Project Submitted" : "Pending Project"}
                          </Badge>
                        </div>
                        <p className="text-xs text-graphite-400">
                          {t.member_count} / {hackathon.max_team_size || 4} Members
                          {t.project_title && (
                            <>
                              {" "}• Project: <span className="text-graphite-200 font-medium">{t.project_title}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {t.avg_score !== null && t.avg_score !== undefined && (
                          <div className="text-right">
                            <span className="text-xs font-mono text-emerald-400 font-bold">
                              {t.avg_score} / 100
                            </span>
                            <p className="text-[10px] text-graphite-500">Score</p>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 w-8 text-graphite-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Members Breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-graphite-800 bg-graphite-950/40 space-y-3">
                        <div className="text-xs font-semibold text-graphite-400 uppercase font-mono tracking-wider">
                          Team Roster ({t.members.length} Members)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {t.members.map((m, idx) => (
                            <div
                              key={m.user_id || idx}
                              className="p-2.5 rounded-xl border border-graphite-800 bg-graphite-900/80 flex items-center justify-between text-xs"
                            >
                              <div className="truncate mr-2">
                                <p className="font-semibold text-white truncate">{m.name}</p>
                                <p className="text-[11px] text-graphite-400 font-mono truncate">{m.email}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                                {m.role_in_team}
                              </span>
                            </div>
                          ))}
                        </div>

                        {t.submission_url && (
                          <div className="pt-2 flex items-center justify-between text-xs text-graphite-400 border-t border-graphite-850">
                            <span className="flex items-center gap-1.5">
                              <Code className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Repository:</span>
                            </span>
                            <a
                              href={t.submission_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono"
                            >
                              <span>{t.submission_url.replace("https://github.com/", "")}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Event Settings & Rubric */}
        <div className="space-y-4">
          <Card className="border-graphite-750 p-5 rounded-2xl space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Event Schedule &amp; Scope</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-graphite-300">
              <p className="leading-relaxed text-graphite-400">{hackathon.description}</p>
              <div className="space-y-2 pt-2 border-t border-graphite-800 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-graphite-500">Starts:</span>
                  <span className="text-white">{formatDate(hackathon.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Ends:</span>
                  <span className="text-white">{formatDate(hackathon.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Status:</span>
                  <span className="text-indigo-300 font-semibold">{hackathon.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Team Size Rule:</span>
                  <span className="text-emerald-400 font-semibold">
                    {hackathon.min_team_size || 1} to {hackathon.max_team_size || 4} members
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-graphite-750 p-5 rounded-2xl space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span>Active Judging Rubric</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs">
              {(() => {
                const activeRubric =
                  hackathon.active_rubric ||
                  rubrics.find((r) => r.id === hackathon.active_rubric_id);
                if (!activeRubric) {
                  return (
                    <div className="p-4 rounded-xl border border-dashed border-graphite-800 text-center space-y-2">
                      <p className="text-graphite-400 text-xs">No active rubric linked</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        Assign Rubric
                      </Button>
                    </div>
                  );
                }
                const rubricName = (activeRubric as any).name || activeRubric.title || "Rubric";
                const rubricCategories = activeRubric.categories || (activeRubric as any).criteria || [];

                return (
                  <div className="p-3 rounded-xl bg-graphite-950/60 border border-graphite-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{rubricName}</span>
                      <Badge variant="indigo" className="text-[10px]">
                        v{activeRubric.version}
                      </Badge>
                    </div>
                    {activeRubric.description && (
                      <p className="text-[11px] text-graphite-400">{activeRubric.description}</p>
                    )}
                    {rubricCategories.length > 0 && (
                      <div className="space-y-1 pt-1 font-mono text-[10px] text-graphite-400">
                        {rubricCategories.map((c: any, i: number) => (
                          <div key={i} className="flex justify-between border-b border-graphite-850/60 py-0.5">
                            <span>{c.name}</span>
                            <span className="text-indigo-300 font-bold">
                              {typeof c.weight === "number" ? `${(c.weight * 100).toFixed(0)}%` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <Link href="/organizer/rubrics" className="block pt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-400 hover:text-indigo-300">
                  <span>Manage Rubrics Library</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-graphite-900 border border-graphite-750 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Hackathon Configuration</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-graphite-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                label="Event Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <Input
                label="Tagline / Catchphrase"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
              />

              <Textarea
                label="Event Description & Guidelines"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-graphite-300">Min Team Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editMinTeamSize}
                    onChange={(e) => setEditMinTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-graphite-500">1 = Solo allowed</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-graphite-300">Max Team Size</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={editMaxTeamSize}
                    onChange={(e) => setEditMaxTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-graphite-500">Limit: 2, 4, 6, etc.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-graphite-300">Lifecycle Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">ACTIVE (Open for registrations & submissions)</option>
                  <option value="EVALUATING">EVALUATING (Judging phase in progress)</option>
                  <option value="COMPLETED">COMPLETED (Event finalized)</option>
                </select>
              </div>

              {rubrics.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-graphite-300">Judging Rubric</label>
                  <select
                    value={editRubricId}
                    onChange={(e) => setEditRubricId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- No rubric linked --</option>
                    {rubrics.map((r) => (
                      <option key={r.id} value={r.id}>
                        {(r as any).name || r.title} (v{r.version})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
