"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Hackathon, Team, TeamMemberInput } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  UserCheck,
  UserPlus,
  Trash2,
  Trophy,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from "lucide-react";

interface TeamRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathons: Hackathon[];
  defaultHackathonId?: string;
  onSuccess: (team: Team) => void;
}

const COMMON_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "AI / ML Engineer",
  "UI / UX Designer",
  "Smart Contract Dev",
  "DevOps / Cloud"
];

export function TeamRegisterModal({
  isOpen,
  onClose,
  hackathons,
  defaultHackathonId,
  onSuccess,
}: TeamRegisterModalProps) {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [hackathonId, setHackathonId] = useState(
    defaultHackathonId || (hackathons[0]?.id ?? "")
  );
  const [leaderRole, setLeaderRole] = useState("Team Leader / Fullstack");

  // Members 2 to 6 (up to 5 additional members)
  const [members, setMembers] = useState<TeamMemberInput[]>([
    { full_name: "", email: "", role_in_team: "Frontend Developer" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (members.length >= 5) return; // Total 1 leader + 5 = 6 members
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Please enter a valid Team Name.");
      return;
    }
    if (!hackathonId) {
      setError("Please select a hackathon event to register for.");
      return;
    }

    // Filter valid members with non-empty email
    const validMembers: TeamMemberInput[] = members
      .filter((m) => m.email.trim().length > 0)
      .map((m) => ({
        full_name: m.full_name.trim() || m.email.split("@")[0],
        email: m.email.trim().toLowerCase(),
        role_in_team: m.role_in_team.trim() || "Developer",
      }));

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await api.createTeam({
        name: teamName.trim(),
        hackathon_id: hackathonId,
        members: validMembers,
      });

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to register team. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMembersCount = 1 + members.filter((m) => m.email.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-graphite-750 bg-graphite-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-graphite-800 bg-graphite-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Register Hackathon Team</span>
                <Badge variant="success" className="text-xs">Up to 6 Members</Badge>
              </h2>
              <p className="text-xs text-graphite-400">
                Register as Team Leader and add up to 5 teammates for instant team enrollment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="team-register-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Hackathon Selection & Team Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider mb-2">
                  Select Hackathon *
                </label>
                <select
                  value={hackathonId}
                  onChange={(e) => setHackathonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-graphite-950 border border-graphite-750 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  required
                >
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neural Pioneers"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-graphite-950 border border-graphite-750 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Member 1: Team Leader (Current User) */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Member 1: Team Leader (You)</span>
                </span>
                <Badge variant="indigo" className="text-[10px]">Leader Account</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-graphite-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.full_name || "You"}
                    className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-graphite-400 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-800 text-graphite-300 text-xs cursor-not-allowed font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
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

            {/* Additional Teammates (Slots 2 to 6) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Teammates Details ({members.length} / 5 slots used)</span>
                  </h3>
                  <p className="text-[11px] text-graphite-400">
                    Add up to 5 additional members to complete your 6-person team.
                  </p>
                </div>

                {members.length < 5 && (
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

              {members.map((member, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-graphite-950/80 border border-graphite-800 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-graphite-300">
                      Member {index + 2}
                    </span>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="text-graphite-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
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
                      <label className="block text-[11px] text-graphite-400 mb-1">Email *</label>
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
                      <label className="block text-[11px] text-graphite-400 mb-1">Role / Specialization</label>
                      <input
                        type="text"
                        list={`roles-list-${index}`}
                        placeholder="e.g. Frontend Developer"
                        value={member.role_in_team}
                        onChange={(e) =>
                          handleMemberChange(index, "role_in_team", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-graphite-900 border border-graphite-750 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                      <datalist id={`roles-list-${index}`}>
                        {COMMON_ROLES.map((r) => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-graphite-800 bg-graphite-950/80">
          <div className="text-xs text-graphite-400 font-mono">
            <span>Total Team Size: </span>
            <strong className="text-emerald-400">{totalMembersCount} / 6 members</strong>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-graphite-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="team-register-form"
              variant="emerald"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold px-5 gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Registration</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
