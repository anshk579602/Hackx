"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Mail, Building } from "lucide-react";

export default function OrganizerParticipantsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Flatten participants from teams
  const allMembers = teams.flatMap((t) =>
    (t.members || []).map((m) => ({ ...m, teamName: t.name }))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Participants Directory</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Registered hackers and teammates across active HackX squads.
        </p>
      </div>

      {allMembers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-graphite-800 bg-graphite-900/40">
          <p className="text-base font-semibold text-white">No participants registered yet</p>
          <p className="text-xs text-graphite-400 mt-1.5 max-w-sm mx-auto">
            When hackers register their account and create or join squads, their names and teams will be listed here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMembers.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-graphite-750 bg-graphite-850 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                  {m.user?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{m.user?.full_name || "Participant"}</h3>
                    <Badge variant="success">{m.teamName}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-graphite-400 mt-0.5">
                    <span>{m.user?.email}</span>
                    {m.user?.organization && <span>• {m.user?.organization}</span>}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-graphite-400">{m.role_in_team}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
