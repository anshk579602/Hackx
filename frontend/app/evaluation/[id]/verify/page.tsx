"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Search,
  Hash,
  Database,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationResult {
  evaluation_id: string;
  status: "VERIFIED" | "TAMPERED" | "NOT_FOUND" | "UNFINALIZED" | "NOT_ANCHORED";
  is_verified: boolean;
  database_score?: number;
  anchored_score?: number;
  database_hash?: string;
  anchored_hash?: string;
  tx_hash?: string;
  block_number?: number;
  network?: string;
  timestamp?: string;
  explorer_url?: string;
  message?: string;
}

export default function PublicEvaluationVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.id as string;

  const [inputVal, setInputVal] = useState(evaluationId || "");
  const [data, setData] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchVerification = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.verifyEvaluationIntegrity(id);
      setData(res);
    } catch (err: any) {
      console.error(err);
      setData({
        evaluation_id: id,
        status: "NOT_FOUND",
        is_verified: false,
        message: err.message || "Failed to load cryptographic verification records.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evaluationId) {
      fetchVerification(evaluationId);
    }
  }, [evaluationId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && inputVal !== evaluationId) {
      router.push(`/evaluation/${inputVal.trim()}/verify`);
    } else if (inputVal.trim()) {
      fetchVerification(inputVal.trim());
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-graphite-950 text-graphite-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/organizer/integrity"
              className="p-2 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  Public Cryptographic Verification
                </h1>
                <Badge variant="indigo">Polygon Amoy</Badge>
              </div>
              <p className="text-xs text-graphite-400 mt-1">
                Independent Keccak-256 cryptographic verification against immutable on-chain state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/evaluation/${evaluationId}/replay`}>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <History className="w-3.5 h-3.5 text-graphite-400" />
                Decision Replay
              </Button>
            </Link>
          </div>
        </div>

        {/* Verification Search Bar */}
        <Card className="bg-graphite-900/90 border-graphite-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-500" />
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter Evaluation ID to verify..."
                  className="pl-9 font-mono text-sm bg-graphite-950 border-graphite-800"
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-mono text-graphite-400">
              Recomputing canonical Keccak-256 hash & querying smart contract...
            </p>
          </div>
        ) : !data ? (
          <div className="text-center py-16 text-graphite-500">
            No record found. Please enter a valid Evaluation ID.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Status Hero */}
            <Card
              className={cn(
                "border-2 transition-all",
                data.status === "VERIFIED"
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : data.status === "TAMPERED"
                  ? "bg-rose-950/20 border-rose-500/50"
                  : "bg-graphite-900 border-graphite-800"
              )}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                        data.status === "VERIFIED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : data.status === "TAMPERED"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      )}
                    >
                      {data.status === "VERIFIED" ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <ShieldAlert className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">
                          {data.status === "VERIFIED"
                            ? "Cryptographic Integrity Verified"
                            : data.status === "TAMPERED"
                            ? "Tampering Detected — Cryptographic Mismatch"
                            : `Evaluation Status: ${data.status}`}
                        </h2>
                        <Badge
                          variant={
                            data.status === "VERIFIED"
                              ? "success"
                              : data.status === "TAMPERED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {data.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-graphite-300 mt-1 max-w-xl">
                        {data.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-graphite-800 sm:pl-6 shrink-0">
                    <div className="text-xs uppercase font-mono text-graphite-500">Database Score</div>
                    <div
                      className={cn(
                        "text-3xl font-black font-mono mt-0.5",
                        data.status === "VERIFIED"
                          ? "text-emerald-400"
                          : data.status === "TAMPERED"
                          ? "text-rose-400"
                          : "text-white"
                      )}
                    >
                      {data.database_score !== undefined ? `${data.database_score.toFixed(1)} / 100` : "N/A"}
                    </div>
                    {data.anchored_score !== undefined && data.status === "TAMPERED" && (
                      <div className="text-xs font-mono text-graphite-400 mt-1">
                        Anchored On-Chain: <strong className="text-emerald-400">{data.anchored_score.toFixed(1)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cryptographic Proof Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Hash */}
              <Card className="bg-graphite-900 border-graphite-800">
                <CardHeader className="pb-3 border-b border-graphite-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-graphite-200">
                      <Database className="w-4 h-4 text-cyan-400" />
                      Live Database Canonical Hash
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Recomputed Keccak-256
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-graphite-400">
                    Calculated by ordering JSON fields deterministically and applying standard Keccak-256 hashing.
                  </p>
                  <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800 font-mono text-xs text-graphite-300 break-all relative group">
                    {data.database_hash || "N/A"}
                    {data.database_hash && (
                      <button
                        onClick={() => copyToClipboard(data.database_hash!, "db_hash")}
                        className="absolute right-2 top-2 p-1.5 rounded bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
                        title="Copy hash"
                      >
                        {copiedKey === "db_hash" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-graphite-500 font-mono flex items-center justify-between">
                    <span>Algorithm: keccak256</span>
                    <span>State: {data.is_verified ? "Valid Match" : "Hash Discrepancy"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Anchored Hash */}
              <Card className="bg-graphite-900 border-graphite-800">
                <CardHeader className="pb-3 border-b border-graphite-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-graphite-200">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      On-Chain Anchored Hash
                    </CardTitle>
                    <Badge variant="success" className="text-[10px] font-mono">
                      Smart Contract
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs text-graphite-400">
                    Stored permanently inside smart contract <span className="font-mono text-indigo-300">EvaluationAnchor.sol</span> upon judge submission.
                  </p>
                  <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800 font-mono text-xs text-graphite-300 break-all relative group">
                    {data.anchored_hash || "N/A"}
                    {data.anchored_hash && (
                      <button
                        onClick={() => copyToClipboard(data.anchored_hash!, "anchor_hash")}
                        className="absolute right-2 top-2 p-1.5 rounded bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
                        title="Copy hash"
                      >
                        {copiedKey === "anchor_hash" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-graphite-500 font-mono flex items-center justify-between">
                    <span>Network: {data.network || "Polygon Amoy"}</span>
                    <span>Block: #{data.block_number || "Local"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blockchain Receipt Details */}
            {data.tx_hash && (
              <Card className="bg-graphite-900 border-graphite-800">
                <CardHeader className="pb-3 border-b border-graphite-800/80">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-graphite-200">
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    Polygon Proof of Anchor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800/60">
                      <div className="text-graphite-500 uppercase text-[10px]">Network</div>
                      <div className="text-white font-medium mt-1">{data.network || "Polygon Amoy"}</div>
                    </div>
                    <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800/60">
                      <div className="text-graphite-500 uppercase text-[10px]">Block Height</div>
                      <div className="text-white font-medium mt-1">#{data.block_number}</div>
                    </div>
                    <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800/60">
                      <div className="text-graphite-500 uppercase text-[10px]">Timestamp (UTC)</div>
                      <div className="text-white font-medium mt-1">
                        {data.timestamp ? new Date(data.timestamp).toLocaleString() : "Confirmed"}
                      </div>
                    </div>
                    <div className="p-3 bg-graphite-950 rounded-lg border border-graphite-800/60 flex flex-col justify-between">
                      <div className="text-graphite-500 uppercase text-[10px]">Explorer Link</div>
                      <a
                        href={data.explorer_url || `https://amoy.polygonscan.com/tx/${data.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-1 truncate"
                      >
                        Verify on Polygonscan <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-graphite-950 rounded-lg border border-graphite-800 flex items-center justify-between font-mono text-xs">
                    <div className="truncate mr-4">
                      <span className="text-graphite-500">Transaction Hash: </span>
                      <span className="text-graphite-300">{data.tx_hash}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(data.tx_hash!, "tx_hash")}
                      className="p-1 rounded hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors shrink-0"
                    >
                      {copiedKey === "tx_hash" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How It Works Explainer Card */}
            <Card className="bg-graphite-900/60 border-graphite-800">
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Why is this evaluation tamper-evident?
                </h4>
                <p className="text-xs text-graphite-400 leading-relaxed">
                  When a judge finalizes an evaluation, HackX constructs a canonical JSON string containing the exact scores,
                  justification hash, evidence bundle hash, and timestamp. It computes the Keccak-256 hash and commits it to the
                  Polygon blockchain. If any database record or score is altered post-evaluation, the live recalculation will
                  instantly fail to match the immutable on-chain record, producing a public tamper alert.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
