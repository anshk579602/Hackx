"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Rubric } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Scale, Lock, PlusCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerRubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.listRubrics();
        setRubrics(list);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Rubrics &amp; Governance</h1>
          <p className="text-xs text-graphite-400 mt-1">
            Standardized evaluation rubrics with immutable versioning. Historical rubrics are locked once evaluated.
          </p>
        </div>

        <Link href="/organizer/rubrics/new">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Create Rubric Version</span>
          </Button>
        </Link>
      </div>

      {rubrics.length === 0 ? (
        <Card className="border-2 border-dashed border-graphite-800 p-12 text-center rounded-3xl bg-graphite-900/50 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-glow-indigo">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Rubrics Defined Yet</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Create your evaluation criteria across weighted categories (e.g. Technical Quality, Innovation, Rigor, Impact).
            </p>
          </div>
          <Link href="/organizer/rubrics/new" className="inline-block pt-2">
            <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-indigo-600/25">
              <PlusCircle className="w-4 h-4" />
              <span>Create First Rubric</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {rubrics.map((r) => (
            <Card key={r.id} className="border-graphite-750">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{r.title}</CardTitle>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {r.version}
                    </span>
                    {r.is_active && <Badge variant="success">Active</Badge>}
                    {r.is_immutable && (
                      <Badge variant="outline" className="flex items-center gap-1 border-graphite-600">
                        <Lock className="w-3 h-3 text-graphite-400" />
                        <span>Immutable</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-graphite-400 mt-1">
                    Created {formatDate(r.created_at)} • 100 Points Total
                  </p>
                </div>

                <Link href={`/organizer/rubrics/${r.id}`}>
                  <Button size="sm" variant="secondary">
                    <span>Inspect Criteria</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {(r.categories || []).map((cat) => (
                    <div
                      key={cat.id || cat.name}
                      className="p-3 rounded-xl bg-graphite-900 border border-graphite-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white truncate">{cat.name}</span>
                        <span className="font-mono text-indigo-400 font-bold">{cat.max_score} pts</span>
                      </div>
                      <p className="text-[11px] text-graphite-400 line-clamp-2">
                        {cat.evaluation_criteria}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
