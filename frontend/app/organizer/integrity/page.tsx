"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { IntegrityOverview } from "@/lib/types";
import { TamperDiffViewer } from "@/components/integrity/TamperDiffViewer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  RotateCcw,
  RefreshCw,
  Lock,
  ExternalLink,
  Cpu
} from "lucide-react";

export default function OrganizerIntegrityPage() {
  const [overview, setOverview] = useState<IntegrityOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadIntegrityData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIntegrityOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrityData();
  }, []);

  const handleSimulateTamperDemo = async () => {
    setIsSimulatingAll(true);
    try {
      await api.simulateTampering();
      await loadIntegrityData();
    } catch (err: any) {
      alert("Tamper simulation error: " + err.message);
    } finally {
      setIsSimulatingAll(false);
    }
  };

  const handleRestoreDemo = async () => {
    setIsRestoring(true);
    try {
      await api.restoreDemo();
      await loadIntegrityData();
    } catch (err: any) {
      alert("Restore error: " + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isViolated = overview?.system_status === "INTEGRITY_VIOLATION";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cryptographic Integrity Center
            </h1>
            {isViolated ? (
              <Badge variant="danger" className="animate-pulse">
                Violation Detected
              </Badge>
            ) : (
              <Badge variant="success">All Proofs Verified</Badge>
            )}
          </div>
          <p className="text-xs text-graphite-400 mt-1">
            Real-time verification comparing live SQL database records against immutable Polygon Amoy blockchain anchors.
          </p>
        </div>

        {/* Global Demo Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadIntegrityData}
            className="text-graphite-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Re-verify</span>
          </Button>

          {isViolated ? (
            <Button
              variant="outline"
              size="sm"
              isLoading={isRestoring}
              onClick={handleRestoreDemo}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/40"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Restore Verified State</span>
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              isLoading={isSimulatingAll}
              onClick={handleSimulateTamperDemo}
              className="bg-rose-600/90 hover:bg-rose-500 text-white shadow-md shadow-rose-950"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              <span>Simulate Database Tampering</span>
            </Button>
          )}
        </div>
      </div>

      {/* Verification Protocol Explanation */}
      <div className="p-5 rounded-2xl border border-graphite-800 bg-graphite-850/70 space-y-3 text-xs text-graphite-300">
        <div className="flex items-center gap-2 text-white font-bold">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>How HackJudge Tamper Detection Works:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
            <span className="font-semibold text-white block mb-0.5">1. Load Record</span>
            <p className="text-[11px] text-graphite-400">Loads current database scores, comments, and justification.</p>
          </div>
          <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
            <span className="font-semibold text-white block mb-0.5">2. Canonicalize</span>
            <p className="text-[11px] text-graphite-400">Reconstructs strict sorted JSON payload deterministically.</p>
          </div>
          <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
            <span className="font-semibold text-white block mb-0.5">3. Keccak-256 Hash</span>
            <p className="text-[11px] text-graphite-400">Computes the cryptographic 32-byte hash of the canonical JSON.</p>
          </div>
          <div className="p-3 rounded-xl bg-graphite-900 border border-graphite-800">
            <span className="font-semibold text-white block mb-0.5">4. Compare On-Chain</span>
            <p className="text-[11px] text-graphite-400">Verifies against the smart contract anchor on Polygon Amoy.</p>
          </div>
        </div>
      </div>

      {/* Evaluations List with Live Diff */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Anchored Evaluations ({overview?.evaluations?.length || 0})</h3>
        {(!overview?.evaluations || overview.evaluations.length === 0) ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-graphite-800 bg-graphite-900/40 space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Evaluations Anchored Yet</h4>
            <p className="text-xs text-graphite-400 max-w-md mx-auto">
              The cryptographic integrity protocol is standing by. When judges finalize and submit evaluations, their Keccak-256 hashes will be anchored to Polygon Amoy and monitored here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {overview.evaluations.map((ev) => (
              <TamperDiffViewer
                key={ev.evaluation_id}
                item={ev}
                onRefresh={loadIntegrityData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
