"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Team, Hackathon } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Copy,
  Check,
  Plus,
  UserPlus,
  ArrowRight,
  Shield,
  Trophy,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ParticipantTeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form states
  const [createTeamName, setCreateTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [myTeam, hacks] = await Promise.all([
        api.getMyTeam(),
        api.listHackathons()
      ]);
      setTeam(myTeam);
      setHackathons(hacks || []);
      if (hacks && hacks.length > 0) {
        setSelectedHackathonId(hacks[0].id);
      }
    } catch (err) {
      console.error("Team page load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = () => {
    if (team?.join_code) {
      navigator.clipboard.writeText(team.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamName.trim()) return;
    if (!selectedHackathonId) {
      setActionError("Please select a hosted hackathon event first.");
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const newTeam = await api.createTeam({
        name: createTeamName.trim(),
        hackathon_id: selectedHackathonId,
      });
      setTeam(newTeam);
      setCreateTeamName("");
    } catch (err: any) {
      setActionError(err.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      const joinedTeam = await api.joinTeam(joinCode.trim());
      setTeam(joinedTeam);
      setJoinCode("");
    } catch (err: any) {
      setActionError(err.message || "Failed to join team. Please check the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const selectedHackathon = hackathons.find((h) => h.id === selectedHackathonId);
  const activeTeamHackathon = team
    ? hackathons.find((h) => h.id === team.hackathon_id)
    : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Team & Squad Management</span>
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Browse hosted hackathon events, register your squad, share your invite code, and prepare submissions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="border-graphite-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {team ? (
        /* Team Overview Card */
        <div className="space-y-6">
          <Card className="border-emerald-500/30 bg-graphite-900/90 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 bg-emerald-950/20 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-lg shadow-lg">
                  {team.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <CardTitle className="text-xl font-bold text-white">{team.name}</CardTitle>
                    <Badge variant="success">Registered Squad</Badge>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    Squad ID: <span className="font-mono">{team.id.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>

              {/* Join Code Display */}
              <div className="flex items-center gap-2.5 bg-graphite-950 p-2.5 rounded-xl border border-graphite-800 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-graphite-400 block">Invite Code</span>
                  <span className="text-base font-mono font-bold text-white tracking-widest">{team.join_code}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-8 w-8 p-0 border-graphite-700 hover:border-emerald-500"
                  title="Copy 6-character code"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-graphite-300 gap-2">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Enrolled Hackathon:{" "}
                    <strong className="text-white">
                      {activeTeamHackathon?.title || "HackX Active Championship"}
                    </strong>
                  </span>
                </span>
                <Link
                  href="/participant/team/members"
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <span>Manage All Members ({team.members?.length || 1})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Members list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Squad Roster ({team.members?.length || 1})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(team.members || []).map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-graphite-800 bg-graphite-850 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {m.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{m.user?.full_name || "Hacker"}</p>
                      <p className="text-[11px] text-graphite-400 font-mono">{m.user?.organization || m.user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="success">{m.role_in_team}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* No Team Yet: Show Hosted Events First, Then Registration Forms */
        <div className="space-y-8">
          {/* SECTION 1: HOSTED HACKATHONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Available Hosted Hackathon Events</span>
                </h2>
                <p className="text-xs text-graphite-400 mt-0.5">
                  Select a hosted hackathon to register your team. Teams can only register for active hosted events.
                </p>
              </div>
              <Badge variant="indigo">{hackathons.length} Event{hackathons.length === 1 ? "" : "s"} Hosted</Badge>
            </div>

            {hackathons.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white">No Active Hackathon Events Hosted Yet</h3>
                  <p className="text-xs text-graphite-300 leading-relaxed">
                    An organiser must first create and host a hackathon event on HackX before participant squads can register. Once an event is published, it will appear here for team registration.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} className="gap-2 border-graphite-700">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check for New Events</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hackathons.map((h) => {
                  const isSelected = h.id === selectedHackathonId;
                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHackathonId(h.id)}
                      className={`cursor-pointer p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-950/50"
                          : "border-graphite-800 bg-graphite-900/60 hover:border-graphite-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{h.title}</span>
                            <Badge variant="success">{h.status || "ACTIVE"}</Badge>
                          </div>
                          {h.tagline && (
                            <p className="text-xs text-emerald-400 font-medium">{h.tagline}</p>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-400 text-graphite-950"
                              : "border-graphite-600"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {h.description && (
                        <p className="text-xs text-graphite-400 mt-2.5 line-clamp-2 leading-relaxed">
                          {h.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-graphite-400 mt-3 pt-3 border-t border-graphite-800/80 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-graphite-500" />
                        <span>Registered on HackX</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: CREATE OR JOIN OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Create Team Form */}
            <Card className="border-graphite-750">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Create a New Squad</span>
                </CardTitle>
                <p className="text-xs text-graphite-400">
                  {selectedHackathon ? (
                    <>
                      Registering team for: <strong className="text-emerald-400">{selectedHackathon.title}</strong>
                    </>
                  ) : (
                    "Select an active event above to register your team."
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <Input
                    label="Squad / Team Name *"
                    placeholder="e.g. CyberVanguard AI"
                    value={createTeamName}
                    onChange={(e) => setCreateTeamName(e.target.value)}
                    disabled={hackathons.length === 0 || isSubmitting}
                    required
                  />

                  <Button
                    type="submit"
                    variant="emerald"
                    className="w-full font-semibold"
                    disabled={hackathons.length === 0 || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {hackathons.length === 0
                      ? "Waiting for Hosted Event"
                      : `Register Team for ${selectedHackathon?.title || "Hackathon"}`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Join Team with Code Form */}
            <Card className="border-graphite-750">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <span>Join with Invite Code</span>
                </CardTitle>
                <p className="text-xs text-graphite-400">
                  Have an invite code from your squad lead? Join them immediately.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinTeam} className="space-y-4">
                  <Input
                    label="6-Character Join Code *"
                    placeholder="e.g. 22EQGM"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-semibold"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Join Existing Squad
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
