"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, ExternalLink, ArrowRight } from "lucide-react";

export default function OrganizerTeamsPage() {
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Teams Directory</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Registered squads, project titles, and member rosters.
        </p>
      </div>

      {teams.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-indigo">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Teams Registered Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              When participants register and form teams, their squads, join codes, and project repositories will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((t) => (
            <Card key={t.id} className="border-graphite-750">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-graphite-800 text-graphite-300">
                      Code: {t.join_code}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-semibold mt-1">
                    Project: {t.submission?.project_title || "Pending submission"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={t.submission ? "success" : "warning"}>
                    {t.submission ? "Project Submitted" : "Drafting"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-graphite-300 flex items-center justify-between pt-2 border-t border-graphite-800">
                  <span>Roster: {t.members?.length || 1} hacker(s)</span>
                  {t.submission && (
                    <Link
                      href={`/participant/submission/${t.submission.id}`}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
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
    </div>
  );
}
