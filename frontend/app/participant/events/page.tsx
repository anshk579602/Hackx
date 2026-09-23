"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Hackathon, Team } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Calendar, Users, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

export default function ParticipantEventsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hacks, team] = await Promise.all([
        api.listHackathons(),
        api.getMyTeam()
      ]);
      setHackathons(hacks || []);
      setMyTeam(team);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Hosted Hackathon Events</span>
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Browse all competitive events hosted by organisers. Register your squad to participate.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="border-graphite-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Events</span>
        </Button>
      </div>

      {hackathons.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Hackathons Hosted Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Organisers have not hosted any hackathon events on the platform yet. As soon as an organiser publishes a hackathon, it will appear here with registration links.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hackathons.map((h) => {
            const isEnrolled = myTeam?.hackathon_id === h.id;

            return (
              <Card
                key={h.id}
                className={`border transition-all flex flex-col justify-between ${
                  isEnrolled
                    ? "border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/40"
                    : "border-graphite-750 bg-graphite-850 hover:border-graphite-650"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-white">{h.title}</CardTitle>
                        <Badge variant="success">{h.status || "ACTIVE"}</Badge>
                      </div>
                      {h.tagline && (
                        <p className="text-xs text-emerald-400 font-medium">{h.tagline}</p>
                      )}
                    </div>
                    {isEnrolled && (
                      <Badge variant="success" className="shrink-0 gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Enrolled Squad</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {h.description && (
                    <p className="text-xs text-graphite-300 leading-relaxed line-clamp-3">
                      {h.description}
                    </p>
                  )}

                  <div className="pt-3 border-t border-graphite-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-graphite-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-graphite-500" />
                      <span>Sovereign HackX Arena</span>
                    </div>

                    {isEnrolled ? (
                      <Link href="/participant/dashboard">
                        <Button variant="outline" size="sm" className="gap-1.5 border-emerald-500/50 text-emerald-400">
                          <span>View Squad Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/participant/team">
                        <Button variant="emerald" size="sm" className="gap-1.5 font-medium shadow-md shadow-emerald-600/20">
                          <span>Register Squad</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
