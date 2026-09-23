"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Team, Hackathon, TeamMemberInput } from "@/lib/types";
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
  UserCheck,
  Trash2,
  ArrowRight,
  Shield,
  Trophy,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const COMMON_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "AI / ML Engineer",
  "UI / UX Designer",
  "Smart Contract Dev",
  "DevOps / Cloud",
];

export default function ParticipantTeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form states for 6-member team
  const [createTeamName, setCreateTeamName] = useState("");
  const [leaderRole, setLeaderRole] = useState("Team Leader / Fullstack");
  const [members, setMembers] = useState<TeamMemberInput[]>([
    { full_name: "", email: "", role_in_team: "Frontend Developer" },
  ]);

  const [joinCode, setJoinCode] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [myTeam, hacks] = await Promise.all([
        api.getMyTeam(),
        api.listHackathons(),
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

  const selectedHackathon = hackathons.find((h) => h.id === selectedHackathonId) || hackathons[0];
  const minTeamSize = selectedHackathon?.min_team_size || 1;
  const maxTeamSize = selectedHackathon?.max_team_size || 4;
  const maxAdditionalSlots = Math.max(0, maxTeamSize - 1);

  const handleAddMember = () => {
    if (members.length >= maxAdditionalSlots) return;
    setMembers([
      ...members,
      { full_name: "", email: "", role_in_team: "Backend Developer" },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMemberInput,
    value: string
  ) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamName.trim()) {
      setActionError("Please enter a valid Team Name.");
      return;
    }
    if (!selectedHackathonId) {
      setActionError("Please select a hosted hackathon event first.");
      return;
    }

    const validMembers: TeamMemberInput[] = members
      .filter((m) => m.email.trim().length > 0)
      .map((m) => ({
        full_name: m.full_name.trim() || m.email.split("@")[0],
        email: m.email.trim().toLowerCase(),
        role_in_team: m.role_in_team.trim() || "Developer",
      }));

    const totalCount = 1 + validMembers.length;
    if (totalCount < minTeamSize) {
      setActionError(
        `This hackathon requires a minimum of ${minTeamSize} team member${minTeamSize > 1 ? "s" : ""}. You currently have ${totalCount}. Please add at least ${minTeamSize - 1} teammate${minTeamSize - 1 > 1 ? "s" : ""}.`
      );
      return;
    }
    if (totalCount > maxTeamSize) {
      setActionError(
        `Team size exceeds the maximum limit of ${maxTeamSize} members allowed for this hackathon.`
      );
      return;
    }

    setActionError(null);
    setIsSubmitting(true);
    try {
      const newTeam = await api.createTeam({
        name: createTeamName.trim(),
        hackathon_id: selectedHackathonId,
        members: validMembers,
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

  const activeTeamHackathon = team
    ? hackathons.find((h) => h.id === team.hackathon_id)
    : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Team Management</span>
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Browse hosted hackathon events, register your team with up to 6 members, and manage your team roster.
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
                    <Badge variant="success">Registered Team</Badge>
                  </div>
                  <p className="text-xs text-graphite-400 mt-0.5">
                    Team ID: <span className="font-mono">{team.id.substring(0, 8)}...</span>
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
                  href="/participant/submission/new"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Submit Project for this Team</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Members list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>
                  Team Roster ({team.members?.length || 1} / {activeTeamHackathon?.max_team_size || 4} Members)
                </span>
              </h3>
              <Link
                href="/participant/team/members"
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                View Detailed Roster &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(team.members || []).map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-graphite-800 bg-graphite-850 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {m.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{m.user?.full_name || "Team Member"}</p>
                      <p className="text-[11px] text-graphite-400 font-mono line-clamp-1">{m.user?.email}</p>
                    </div>
                  </div>
                  <Badge variant={idx === 0 ? "indigo" : "success"} className="text-[10px]">
                    {m.role_in_team}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* No Team Yet: Show Hosted Events First, Then Registration Form */
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
                  Select an active hackathon below to register your team.
                </p>
              </div>
              <Badge variant="indigo">{hackathons.length} Event{hackathons.length === 1 ? "" : "s"} Open</Badge>
            </div>

            {hackathons.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white">No Active Hackathon Events Hosted Yet</h3>
                  <p className="text-xs text-graphite-300 leading-relaxed">
                    An organiser must first host a hackathon event on HackX before teams can register. Once an event is published, it will appear here for team registration.
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

          {/* SECTION 2: REGISTRATION TABS (CREATE 6-MEMBER TEAM OR JOIN WITH CODE) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-graphite-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "create"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "text-graphite-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Team ({minTeamSize}-{maxTeamSize} Members)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("join")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "join"
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-graphite-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join with Code</span>
              </button>
            </div>

            {activeTab === "create" ? (
              /* Dynamic Team Registration Form */
              <Card className="border-graphite-750 bg-graphite-900/90 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <span>Team Registration ({minTeamSize}-{maxTeamSize} Members)</span>
                      </CardTitle>
                      <p className="text-xs text-graphite-400 mt-1">
                        {selectedHackathon ? (
                          <>
                            Registering team for:{" "}
                            <strong className="text-emerald-400 font-semibold">{selectedHackathon.title}</strong>
                          </>
                        ) : (
                          "Select an active event above to register your team."
                        )}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs">
                      {maxAdditionalSlots > 0
                        ? `1 Leader + up to ${maxAdditionalSlots} Teammates`
                        : "Solo Registration"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleCreateTeam} className="space-y-6">
                    <Input
                      label="Team Name *"
                      placeholder="e.g. CyberVanguard AI"
                      value={createTeamName}
                      onChange={(e) => setCreateTeamName(e.target.value)}
                      disabled={hackathons.length === 0 || isSubmitting}
                      required
                    />

                    {/* Member 1: Team Leader */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>Member 1: Team Leader (You)</span>
                        </span>
                        <Badge variant="indigo" className="text-[10px]">Leader Account</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-graphite-400 mb-1">Full Name</label>
                          <input
                            type="text"
                            disabled
                            value={user?.full_name || "You"}
                            className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 text-xs cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-graphite-400 mb-1">Email</label>
                          <input
                            type="email"
                            disabled
                            value={user?.email || ""}
                            className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 text-xs cursor-not-allowed font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-graphite-400 mb-1">Leader Role / Track</label>
                          <input
                            type="text"
                            value={leaderRole}
                            onChange={(e) => setLeaderRole(e.target.value)}
                            placeholder="e.g. Lead Developer"
                            className="w-full px-3 py-2 rounded-lg bg-graphite-950 border border-graphite-750 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Teammates */}
                    {maxAdditionalSlots > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              <UserPlus className="w-4 h-4 text-emerald-400" />
                              <span>Additional Teammates ({members.length} / {maxAdditionalSlots} slots)</span>
                            </h4>
                            <p className="text-[11px] text-graphite-400">
                              Enter name, email, and role for each teammate (Min: {minTeamSize}, Max: {maxTeamSize} members).
                            </p>
                          </div>

                          {members.length < maxAdditionalSlots && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddMember}
                              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Add Teammate</span>
                            </Button>
                          )}
                        </div>

                        {members.length === 0 ? (
                          <div className="p-4 rounded-xl bg-graphite-950/60 border border-dashed border-graphite-800 text-center space-y-1.5">
                            <p className="text-xs text-graphite-400">
                              No additional teammates added. Registering as leader (solo).
                            </p>
                            {members.length < maxAdditionalSlots && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAddMember}
                                className="text-xs text-emerald-400 hover:text-emerald-300"
                              >
                                + Add a Teammate
                              </Button>
                            )}
                          </div>
                        ) : (
                          members.map((member, index) => (
                            <div
                              key={index}
                              className="p-3.5 rounded-xl bg-graphite-950/80 border border-graphite-800 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-semibold text-graphite-300">
                                  Member {index + 2}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(index)}
                                  className="text-graphite-500 hover:text-rose-400 text-xs flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-graphite-400 mb-1">Full Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Alex Rivera"
                                value={member.full_name}
                                onChange={(e) =>
                                  handleMemberChange(index, "full_name", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-750 text-white text-xs focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-graphite-400 mb-1">Email</label>
                              <input
                                type="email"
                                placeholder="alex@team.com"
                                value={member.email}
                                onChange={(e) =>
                                  handleMemberChange(index, "email", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-750 text-white text-xs focus:border-emerald-500 focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-graphite-400 mb-1">Role / Track</label>
                              <input
                                type="text"
                                list={`team-roles-${index}`}
                                placeholder="e.g. Frontend Developer"
                                value={member.role_in_team}
                                onChange={(e) =>
                                  handleMemberChange(index, "role_in_team", e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-750 text-white text-xs focus:border-emerald-500 focus:outline-none"
                              />
                              <datalist id={`team-roles-${index}`}>
                                {COMMON_ROLES.map((r) => (
                                  <option key={r} value={r} />
                                ))}
                              </datalist>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                    <Button
                      type="submit"
                      variant="emerald"
                      className="w-full font-bold shadow-lg shadow-emerald-600/20 py-3"
                      disabled={hackathons.length === 0 || isSubmitting}
                      isLoading={isSubmitting}
                    >
                      {hackathons.length === 0
                        ? "Waiting for Hosted Event"
                        : `Complete Team Registration for ${selectedHackathon?.title || "Hackathon"}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* Join with Code Option */
              <Card className="border-graphite-750 bg-graphite-900/90 shadow-xl max-w-lg mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    <span>Join with Invite Code</span>
                  </CardTitle>
                  <p className="text-xs text-graphite-400">
                    If your team leader has already registered a team, enter their 6-character code below.
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
                      Join Existing Team
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
