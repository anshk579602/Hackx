"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Hackathon } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, PlusCircle, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.listHackathons();
        setHackathons(list);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hackathons</h1>
          <p className="text-xs text-graphite-400 mt-1">
            Manage your competitive hackathons and scoring rubrics.
          </p>
        </div>

        <Link href="/organizer/hackathons/new">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Create Hackathon</span>
          </Button>
        </Link>
      </div>

      {hackathons.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-indigo">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Hackathons Created Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Get started by creating your first hackathon. You can set the event dates, tracks, submission guidelines, and evaluation rubrics.
            </p>
          </div>
          <Link href="/organizer/hackathons/new" className="inline-block pt-2">
            <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-indigo-600/25">
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Hackathon</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {hackathons.map((h) => (
            <Card key={h.id} className="border-graphite-750">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{h.title}</CardTitle>
                    <Badge variant={h.status === "ACTIVE" || h.status === "EVALUATING" ? "success" : "default"}>
                      {h.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-graphite-400 mt-1">{h.tagline}</p>
                </div>

                <Link href={`/organizer/hackathons/${h.id}`}>
                  <Button size="sm" variant="secondary">
                    <span>Manage Event</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-graphite-300">
                <p>{h.description}</p>
                <div className="flex items-center gap-4 text-graphite-500 font-mono text-[11px] pt-2 border-t border-graphite-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Start: {formatDate(h.start_date)}</span>
                  </span>
                  <span>•</span>
                  <span>End: {formatDate(h.end_date)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
