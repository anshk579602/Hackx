"use client";

import React from "react";
import { Claim, EvidenceItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceCardProps {
  claim: Claim;
}

export function EvidenceCard({ claim }: EvidenceCardProps) {
  const getStatusIcon = () => {
    switch (claim.status) {
      case "Supported":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "Partially Supported":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "Unsupported":
      case "Contradicted":
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (claim.status) {
      case "Supported":
        return <Badge variant="success">Supported</Badge>;
      case "Partially Supported":
        return <Badge variant="warning">Partially Supported</Badge>;
      case "Unsupported":
        return <Badge variant="danger">Unsupported</Badge>;
      case "Contradicted":
        return <Badge variant="danger">Contradicted</Badge>;
      default:
        return <Badge variant="warning">Needs Human Review</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-graphite-700/70 bg-graphite-850/90 p-4 space-y-3 transition-all hover:border-graphite-600">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{getStatusIcon()}</div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-snug">
              {claim.claim || claim.claim_text}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-graphite-400 font-mono">
                Category: <strong className="text-graphite-300 font-sans">{claim.category}</strong>
              </span>
              <span className="text-graphite-600">•</span>
              <span className="text-xs text-graphite-400 font-mono">
                AI Confidence: <strong className="text-indigo-400">{claim.confidence}%</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Subclaims if compound claim was split */}
      {claim.subclaims && claim.subclaims.length > 1 && (
        <div className="pl-6 border-l-2 border-graphite-750 space-y-1">
          <p className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider">
            Decomposed Subclaims:
          </p>
          {claim.subclaims.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-graphite-300">
              <ChevronRight className="w-3 h-3 text-indigo-400" />
              <span>{sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Reasoning */}
      {claim.reasoning && (
        <div className="p-3 rounded-lg bg-graphite-900/80 border border-graphite-800 text-xs text-graphite-300 space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Verification Reasoning:</span>
          </div>
          <p className="leading-relaxed">{claim.reasoning}</p>
        </div>
      )}

      {/* Evidence sources */}
      {claim.evidence && claim.evidence.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider">
            Discovered Evidence Sources:
          </p>
          <div className="space-y-1.5">
            {claim.evidence.map((ev: EvidenceItem, idx: number) => {
              const isSupporting = ev.stance === "supporting";
              const isContradicting = ev.stance === "contradicting";
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-colors",
                    isSupporting
                      ? "bg-emerald-950/20 border-emerald-900/40 text-graphite-200"
                      : isContradicting
                      ? "bg-rose-950/20 border-rose-900/40 text-graphite-200"
                      : "bg-graphite-800/40 border-graphite-700/50 text-graphite-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSupporting
                            ? "bg-emerald-400"
                            : isContradicting
                            ? "bg-rose-400"
                            : "bg-amber-400"
                        )}
                      />
                      {ev.source_type} ({ev.source_name})
                    </span>

                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <p className="italic text-graphite-400 pl-3 border-l border-graphite-700">
                    &ldquo;{ev.excerpt}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
