"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Evaluation } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Gavel, CheckCircle2, Building, Mail } from "lucide-react";

export default function OrganizerJudgesPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Five seed judges
  const judgesList = [
    {
      id: "judge-1",
      name: "Dr. Aris Vance",
      email: "judge@verijudge.demo",
      org: "MIT AI Lab",
      specialty: "Distributed Systems & Machine Learning",
      completed: 1,
    },
    {
      id: "judge-2",
      name: "Sarah Chen",
      email: "sarah.chen@judge.demo",
      org: "DeepMind Fellow",
      specialty: "Neural NLP & Reinforcement Learning",
      completed: 2,
    },
    {
      id: "judge-3",
      name: "Marcus Brody",
      email: "marcus.brody@judge.demo",
      org: "Y Combinator Partner",
      specialty: "Product Market Fit & Scalability",
      completed: 1,
    },
    {
      id: "judge-4",
      name: "Elena Rostova",
      email: "elena.rostova@judge.demo",
      org: "Oxford Cybernetics",
      specialty: "Robotics & Hardware IoT",
      completed: 0,
    },
    {
      id: "judge-5",
      name: "David Kim",
      email: "david.kim@judge.demo",
      org: "Polygon Foundation",
      specialty: "Smart Contracts & Cryptography",
      completed: 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Judging Panel</h1>
        <p className="text-xs text-graphite-400 mt-1">
          5 certified evaluators across technical domains for InnovateX 2026.
        </p>
      </div>

      <div className="space-y-4">
        {judgesList.map((j) => (
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
    </div>
  );
}
