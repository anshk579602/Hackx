"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Copy, Check, Plus, UserPlus, ArrowRight, Shield } from "lucide-react";

export default function ParticipantTeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form states
  const [createTeamName, setCreateTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const loadTeam = async () => {
    setIsLoading(true);
    try {
      const myTeam = await api.getMyTeam();
      setTeam(myTeam);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
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
    setActionError(null);
    try {
      const hackathons = await api.listHackathons();
      const hackathonId = hackathons[0]?.id || "";
      const newTeam = await api.createTeam({
        name: createTeamName.trim(),
        hackathon_id: hackathonId,
      });
      setTeam(newTeam);
      setCreateTeamName("");
    } catch (err: any) {
      setActionError(err.message || "Failed to create team.");
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setActionError(null);
    try {
      const joinedTeam = await api.joinTeam(joinCode.trim());
      setTeam(joinedTeam);
      setJoinCode("");
    } catch (err: any) {
      setActionError(err.message || "Failed to join team.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Team Management</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Coordinate with fellow hackers, share your join code, and prepare your project submission.
        </p>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          {actionError}
        </div>
      )}

      {team ? (
        <div className="space-y-6">
          {/* Team Info Banner */}
          <Card className="border-graphite-750">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-graphite-400 uppercase font-semibold">Active Team</span>
                <CardTitle className="text-2xl mt-1">{team.name}</CardTitle>
              </div>

              {/* Join code pill */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-graphite-900 border border-graphite-800">
                <div className="text-xs">
                  <span className="text-graphite-500 block text-[10px]">Invite Code:</span>
                  <span className="font-mono font-bold text-white text-sm tracking-wider">
                    {team.join_code}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-8 px-2 text-xs"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-graphite-400 pt-2 border-t border-graphite-800">
                <span>Hackathon: <strong>InnovateX 2026</strong></span>
                <Link
                  href="/participant/team/members"
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <span>View All Members ({team.members?.length || 1})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Members list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Roster</h3>
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
        /* Create or Join Options */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Team */}
          <Card className="border-graphite-750">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Create a New Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <Input
                  label="Team Name"
                  placeholder="e.g. GenX AI"
                  value={createTeamName}
                  onChange={(e) => setCreateTeamName(e.target.value)}
                  required
                />
                <Button type="submit" variant="emerald" className="w-full">
                  Create Team
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Team */}
          <Card className="border-graphite-750">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Join with Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <Input
                  label="6-Character Join Code"
                  placeholder="e.g. GENX26"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                />
                <Button type="submit" variant="primary" className="w-full">
                  Join Existing Team
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
