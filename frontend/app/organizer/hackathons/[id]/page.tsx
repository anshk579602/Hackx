"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Hackathon } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Trophy, Calendar, Users, Scale } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HackathonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const h = await api.getHackathon(id);
        setHackathon(h);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!hackathon) {
    return <div className="text-center py-12 text-graphite-400">Hackathon not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/organizer/hackathons"
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{hackathon.title}</h1>
            <Badge variant="success">{hackathon.status}</Badge>
          </div>
          <p className="text-xs text-graphite-400 mt-0.5">{hackathon.tagline}</p>
        </div>
      </div>

      <Card className="border-graphite-750">
        <CardHeader>
          <CardTitle className="text-base">Event Scope &amp; Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-graphite-300">
          <p className="leading-relaxed">{hackathon.description}</p>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-graphite-800 font-mono text-[11px] text-graphite-400">
            <div>
              <span className="text-graphite-500 block">Start Date:</span>
              <span className="text-white">{formatDate(hackathon.start_date)}</span>
            </div>
            <div>
              <span className="text-graphite-500 block">End Date:</span>
              <span className="text-white">{formatDate(hackathon.end_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
