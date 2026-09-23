"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Gavel, CheckCircle2, Building, Mail, UserPlus, Copy, Check } from "lucide-react";

interface JudgeItem {
  id: string;
  name: string;
  email: string;
  org: string;
  specialty: string;
  completed: number;
}

export default function OrganizerJudgesPage() {
  const [judges, setJudges] = useState<JudgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadJudges() {
      try {
        const data = await api.getJudges();
        setJudges(data || []);
      } catch (err) {
        console.error("Failed to load judges:", err);
        setJudges([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadJudges();
  }, []);

  const handleCopyInvite = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/register?role=judge`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Gavel className="w-7 h-7 text-amber-400" />
            <span>Judging Panel</span>
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            {judges.length > 0
              ? `${judges.length} accredited evaluator${judges.length > 1 ? "s" : ""} on HackX.`
              : "Active evaluators, cryptographic credentials, and judging assignments."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyInvite}
          className="border-graphite-700 hover:border-amber-500/50 hover:bg-amber-500/10 text-xs gap-1.5 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Invite Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-graphite-400" />
              <span>Copy Judge Invite Link</span>
            </>
          )}
        </Button>
      </div>

      {judges.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-graphite-800 bg-graphite-900/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-base font-semibold text-white">No Judges Registered Yet</p>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Accredited evaluators can register directly through the HackX portal under the <strong className="text-amber-400">Judge</strong> role. Once registered, their credentials, domain specialties, and anchored evaluations will appear here automatically.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyInvite}
            className="gap-2 bg-amber-500 hover:bg-amber-400 text-graphite-950 font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied to Clipboard" : "Copy Judge Registration Link"}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {judges.map((j) => (
            <Card key={j.id} className="border-graphite-750">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shadow-md">
                    {j.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{j.name}</CardTitle>
                      <Badge variant="warning">Evaluator</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-graphite-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-graphite-500" />
                        <span>{j.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-graphite-500" />
                        <span>{j.org}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-graphite-500 uppercase font-mono block">Status</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{j.completed} Evaluations Anchored</span>
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-graphite-300 bg-graphite-900/60 p-2.5 rounded-lg border border-graphite-800">
                  <span className="text-graphite-500 font-semibold mr-1">Domain Focus:</span>
                  <span>{j.specialty}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
