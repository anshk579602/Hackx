"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Users, Mail, Building, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeamMembersPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const t = await api.getMyTeam();
        setTeam(t);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/participant/team"
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team Members</h1>
          <p className="text-xs text-graphite-400">
            {team ? team.name : "Team"} • {team?.members?.length || 0} Member(s)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(team?.members || []).map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl border border-graphite-750 bg-graphite-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                {m.user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{m.user?.full_name || "Team Member"}</h3>
                  <Badge variant="success">{m.role_in_team}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-graphite-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-graphite-500" />
                    <span>{m.user?.email}</span>
                  </span>
                  {m.user?.organization && (
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-graphite-500" />
                      <span>{m.user?.organization}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-graphite-500" />
                    <span>Joined {formatDate(m.joined_at)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
