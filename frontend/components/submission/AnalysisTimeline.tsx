"use client";

import React from "react";
import { CheckCircle2, Clock, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisTimelineProps {
  currentStatus: "SUBMITTED" | "EXTRACTING" | "CLAIMS_IDENTIFIED" | "VERIFYING" | "READY" | string;
  statusMessage?: string;
  claimsCount?: number;
  bundleHash?: string;
}

export function AnalysisTimeline({
  currentStatus,
  statusMessage,
  claimsCount = 12,
  bundleHash,
}: AnalysisTimelineProps) {
  const steps = [
    {
      id: "SUBMITTED",
      title: "Submitted",
      desc: "Project payload received",
      icon: Clock,
    },
    {
      id: "EXTRACTING",
      title: "AI Extracting Details",
      desc: "Parsing GitHub, docs & links",
      icon: Sparkles,
    },
    {
      id: "CLAIMS_IDENTIFIED",
      title: "Claims Identified",
      desc: `${claimsCount} atomic claims isolated`,
      icon: Sparkles,
    },
    {
      id: "VERIFYING",
      title: "Evidence Verification",
      desc: "Cross-referencing evidence",
      icon: ShieldCheck,
    },
    {
      id: "READY",
      title: "Ready for Judge Review",
      desc: "Audit hash calculated",
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return 0;
      case "EXTRACTING":
        return 1;
      case "CLAIMS_IDENTIFIED":
        return 2;
      case "VERIFYING":
        return 3;
      case "READY":
        return 4;
      default:
        return 4;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="rounded-2xl border border-graphite-700/80 bg-graphite-850 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-graphite-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Verification Timeline</span>
          </h3>
          <p className="text-xs text-graphite-400 mt-0.5">
            {statusMessage || "Live autonomous evidence analysis progression."}
          </p>
        </div>

        {bundleHash && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-graphite-900 border border-graphite-800 text-xs font-mono text-graphite-300">
            <span className="text-graphite-500">Bundle Hash:</span>
            <span className="text-indigo-400 truncate max-w-[130px]">{bundleHash}</span>
          </div>
        )}
      </div>

      {/* Steps visualization */}
      <div className="relative">
        <div className="hidden lg:grid grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between",
                  isCompleted
                    ? "bg-indigo-950/20 border-indigo-500/40 text-white"
                    : "bg-graphite-900/60 border-graphite-800 text-graphite-500",
                  isCurrent && "ring-2 ring-indigo-500/50 bg-indigo-900/20"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-2 font-semibold text-xs",
                    isCompleted
                      ? "bg-indigo-600 text-white"
                      : "bg-graphite-800 text-graphite-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold leading-tight">{step.title}</h4>
                  <p className="text-[10px] text-graphite-400 leading-tight">{step.desc}</p>
                </div>

                {isCurrent && (
                  <span className="mt-2 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isCompleted
                    ? "bg-indigo-950/20 border-indigo-500/40 text-white"
                    : "bg-graphite-900/60 border-graphite-800 text-graphite-500"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    isCompleted ? "bg-indigo-600 text-white" : "bg-graphite-800 text-graphite-400"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">{step.title}</h4>
                  <p className="text-[10px] text-graphite-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
