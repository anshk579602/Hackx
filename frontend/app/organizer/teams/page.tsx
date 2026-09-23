"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  ExternalLink,
  ArrowRight,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

export default function OrganizerTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.listTeams();
        setTeams(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await api.deleteTeam(teamToDelete.id);
      setTeams((prev) => prev.filter((t) => t.id !== teamToDelete.id));
      setSuccessMessage(`Team "${teamToDelete.name}" was successfully deleted.`);
      setTeamToDelete(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete team. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.join_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.submission?.project_title && t.submission.project_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Teams Management
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Full organizer controls: view rosters, track submissions, and delete squads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
            <input
              type="text"
              placeholder="Search team or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-graphite-900 border border-graphite-750 text-white text-xs placeholder-graphite-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <Badge variant="indigo" className="font-mono text-xs py-1 px-2.5 shrink-0">
            {teams.length} Teams
          </Badge>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Empty State */}
      {filteredTeams.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-indigo">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">
              {searchQuery ? "No Matching Teams Found" : "No Teams Registered Yet"}
            </h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              {searchQuery
                ? `No teams matched "${searchQuery}". Try searching by team name or code.`
                : "When participants register and form teams, their squads, join codes, and project repositories will appear here."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((t) => (
            <Card key={t.id} className="border-graphite-750 hover:border-graphite-650 transition-all">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <CardTitle className="text-lg text-white font-bold">{t.name}</CardTitle>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-graphite-800 text-graphite-300 border border-graphite-700">
                      Code: {t.join_code}
                    </span>
                    <Badge variant={t.submission ? "success" : "warning"} className="text-[10px]">
                      {t.submission ? "Project Submitted" : "Pending Submission"}
                    </Badge>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">
                    Project: {t.submission?.project_title || "No submission yet"}
                  </p>
                </div>

                {/* Team Controls: Delete Button */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setTeamToDelete(t)}
                    className="gap-1.5 text-xs border border-rose-500/30 hover:bg-rose-600/30 shadow-sm"
                    title="Delete Team"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                    <span>Delete Team</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-graphite-300 flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-graphite-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-graphite-400">Roster:</span>
                    <span className="font-semibold text-white font-mono">
                      {t.members?.length || 1} hacker(s)
                    </span>
                    {t.members && t.members.length > 0 && (
                      <span className="text-[11px] text-graphite-500 truncate max-w-md hidden sm:inline">
                        ({t.members.map((m) => m.user?.full_name || m.role_in_team).join(", ")})
                      </span>
                    )}
                  </div>

                  {t.submission && (
                    <Link
                      href={`/participant/submission/${t.submission.id}`}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold text-xs"
                    >
                      <span>View Submission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-graphite-900 p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Team</h3>
                <p className="text-xs text-graphite-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-graphite-950 border border-graphite-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-graphite-400">Team Name:</span>
                <span className="font-bold text-white">{teamToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-400">Join Code:</span>
                <span className="font-mono text-indigo-300">{teamToDelete.join_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-400">Members:</span>
                <span className="text-white">{teamToDelete.members?.length || 1}</span>
              </div>
              <div className="pt-2 border-t border-graphite-850 text-rose-400 text-[11px] leading-relaxed">
                ⚠️ Deleting this team will remove its member registrations, submitted projects, and any evaluations.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTeamToDelete(null)}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteTeam}
                disabled={isDeleting}
                className="text-xs gap-1.5 shadow-lg shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting Team..." : "Confirm Delete"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
