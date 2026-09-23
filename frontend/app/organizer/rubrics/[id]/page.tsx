"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Rubric } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Lock, CheckCircle2, Sparkles, Scale } from "lucide-react";

export default function RubricDetailPage() {
  const params = useParams();
  const rubricId = params.id as string;
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await api.getRubric(rubricId);
        setRubric(r);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [rubricId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!rubric) {
    return <div className="text-center py-12 text-graphite-400">Rubric not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/organizer/rubrics"
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{rubric.title}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              {rubric.version}
            </span>
          </div>
          <p className="text-xs text-graphite-400 mt-0.5">
            Total Score: 100 Points • Version status: {rubric.is_immutable ? "Immutable (Locked after evaluation use)" : "Draft Editable"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {(rubric.categories || []).map((cat) => (
          <Card key={cat.id || cat.name} className="border-graphite-750">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <p className="text-xs text-graphite-400 mt-0.5">{cat.evaluation_criteria}</p>
              </div>
              <span className="text-xl font-bold font-mono text-indigo-400">
                {cat.max_score} pts
              </span>
            </CardHeader>
            <CardContent>
              {cat.ai_evidence_checklist && cat.ai_evidence_checklist.length > 0 && (
                <div className="p-3.5 rounded-xl bg-graphite-900 border border-graphite-800 space-y-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Automated Evidence Verification Checklist:</span>
                  </span>
                  <ul className="space-y-1 text-graphite-300 pl-4 list-disc text-[11px]">
                    {cat.ai_evidence_checklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
