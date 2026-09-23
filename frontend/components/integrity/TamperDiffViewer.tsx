"use client";

import React, { useState } from "react";
import { IntegrityItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Flame,
  ArrowRight,
  Database,
  Link as ChainLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TamperDiffViewerProps {
  item: IntegrityItem;
  onRefresh: () => void;
}

export function TamperDiffViewer({ item, onRefresh }: TamperDiffViewerProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSimulateTamper = async () => {
    setIsSimulating(true);
    try {
      await api.simulateTampering(item.evaluation_id);
      onRefresh();
    } catch (err: any) {
      alert("Tamper simulation failed: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await api.restoreDemo();
      onRefresh();
    } catch (err: any) {
      alert("Restore failed: " + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const isTampered = item.status === "TAMPERED" || !item.is_verified;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all space-y-4",
        isTampered
          ? "border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-950/30 glow-rose"
          : "border-emerald-500/40 bg-emerald-950/15"
      )}
    >
      {/* Header with Title and Verification State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white">{item.team_name}</h4>
            <span className="text-xs text-graphite-400 font-mono">({item.rubric_version})</span>
            {isTampered ? (
              <Badge variant="danger" className="animate-pulse">
                Violation Detected
              </Badge>
            ) : (
              <Badge variant="success">Verified On-Chain</Badge>
            )}
          </div>
          <p className="text-xs text-graphite-400 mt-0.5">
            Evaluator: <strong className="text-graphite-200">{item.judge_name}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isTampered ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={isRestoring}
              onClick={handleRestore}
              className="text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/40"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Restore Original DB Record</span>
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              isLoading={isSimulating}
              onClick={handleSimulateTamper}
              className="text-xs bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm"
              title="Demo only: Alters database score to test blockchain mismatch"
            >
              <Flame className="w-3.5 h-3.5 mr-1" />
              <span>Simulate Database Tampering</span>
            </Button>
          )}

          <a
            href={`/evaluation/${item.evaluation_id}/replay`}
            className="px-3 py-1.5 rounded-lg border border-graphite-700 bg-graphite-800 hover:bg-graphite-750 text-xs font-medium text-graphite-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Decision Replay</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Visual Diff: Database Score vs Blockchain Anchored Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database state */}
        <div className="p-4 rounded-xl bg-graphite-900/90 border border-graphite-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-graphite-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current PostgreSQL / SQLite State</span>
            </span>
            {isTampered && (
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                Modified in DB
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl font-black font-mono",
                isTampered ? "text-rose-400" : "text-white"
              )}
            >
              {item.database_score.toFixed(1)}
            </span>
            <span className="text-xs text-graphite-400 font-mono">/ 100 pts</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-graphite-500">Recomputed Canonical Hash:</span>
            <p className="text-[11px] font-mono text-graphite-300 truncate">
              {item.database_hash}
            </p>
          </div>
        </div>

        {/* Blockchain state */}
        <div className="p-4 rounded-xl bg-graphite-900/90 border border-graphite-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-graphite-300">
              <ChainLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Blockchain Proof ({item.network || "Polygon Amoy"})</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              Immutable Anchor
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {item.anchored_score.toFixed(1)}
            </span>
            <span className="text-xs text-graphite-400 font-mono">/ 100 pts</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-graphite-500">On-Chain Anchored Hash:</span>
            <p className="text-[11px] font-mono text-emerald-400 truncate">
              {item.anchored_hash}
            </p>
          </div>
        </div>
      </div>

      {/* Status banner message */}
      <div
        className={cn(
          "p-3 rounded-xl border text-xs flex items-start gap-2.5",
          isTampered
            ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
            : "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
        )}
      >
        {isTampered ? (
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed">{item.message}</p>
      </div>

      {/* Transaction & Explorer Link */}
      {item.tx_hash && (
        <div className="flex items-center justify-between text-[11px] font-mono text-graphite-400 pt-1">
          <span className="truncate max-w-[300px]">Tx: {item.tx_hash}</span>
          {item.explorer_url && (
            <a
              href={item.explorer_url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans"
            >
              <span>Inspect on Polygonscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
