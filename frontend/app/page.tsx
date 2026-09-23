"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Gavel,
  Database,
  BarChart3,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Layers,
  Cpu,
  Trophy,
  Users,
  Code2,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { demoLogin, login, switchDemoRole } = useAuth();
  const [showPortalSelection, setShowPortalSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"ORGANIZER" | "PARTICIPANT" | "JUDGE">("ORGANIZER");
  const [customEmail, setCustomEmail] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleEnterClick = () => {
    setShowPortalSelection(true);
    // Smooth scroll to portal section
    const el = document.getElementById("portal-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRoleQuickEnter = async (role: "organizer" | "participant" | "judge") => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setLoginError(err.message || "Failed to enter portal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customPassword) return;
    setIsLoading(true);
    setLoginError(null);
    try {
      await login(customEmail, customPassword);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-graphite-950 text-graphite-100 overflow-x-hidden">
      {/* 1. ANIMATED HERO SCREEN: HACKJUDGE NAME ANIMATION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 py-20 overflow-hidden border-b border-graphite-800">
        {/* Glowing Background Radial & Circuit Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.22),rgba(16,185,129,0.05),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          {/* Top Pill with Animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs font-mono font-medium shadow-glow-indigo backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>VeriJudge AI Protocol • Transparent, Evidence-Based Hackathons</span>
          </motion.div>

          {/* Animated Logo Shield Mark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 120 }}
            className="flex justify-center"
          >
            <div className="relative group cursor-pointer" onClick={handleEnterClick}>
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-500 animate-tilt" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-graphite-900 border border-graphite-700 flex items-center justify-center shadow-2xl">
                <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
                <Gavel className="w-5 h-5 text-amber-400 absolute bottom-3 right-3" />
              </div>
            </div>
          </motion.div>

          {/* MAIN PLATFORM NAME ANIMATION: HACKJUDGE */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="space-y-3"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight uppercase leading-none select-none">
              <span className="text-white drop-shadow-md">HACK</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]">
                JUDGE
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="text-base sm:text-xl md:text-2xl font-semibold text-graphite-200 tracking-tight"
            >
              Transparent, Evidence-Based Hackathon Evaluation
            </motion.p>
          </motion.div>

          {/* Core Tagline & Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <p className="text-sm sm:text-base text-graphite-300 leading-relaxed">
              AI analyzes technical claims from code repositories without hallucinating.
              Human judges make final authoritative decisions. Every score is Keccak-256 hashed and anchored to Polygon blockchain.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs text-graphite-400">
              <span className="px-3 py-1 rounded-md bg-graphite-900 border border-graphite-800 text-indigo-300">
                ⚡ AI-assisted
              </span>
              <span className="text-graphite-600">•</span>
              <span className="px-3 py-1 rounded-md bg-graphite-900 border border-graphite-800 text-amber-300">
                ⚖️ Human-decided
              </span>
              <span className="text-graphite-600">•</span>
              <span className="px-3 py-1 rounded-md bg-graphite-900 border border-graphite-800 text-emerald-300">
                🔒 Blockchain-auditable
              </span>
            </div>
          </motion.div>

          {/* PROMINENT ANIMATED ENTER BUTTON */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleEnterClick}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-base font-bold rounded-2xl group bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 group-hover:from-indigo-500 group-hover:to-emerald-500 hover:text-white text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative px-8 py-4 transition-all ease-in duration-150 bg-graphite-950 rounded-2xl group-hover:bg-opacity-0 flex items-center gap-3">
                <span className="tracking-wide uppercase font-mono text-sm">Enter HackJudge</span>
                <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-x-1.5 transition-all" />
              </span>
            </button>

            <Link href="/about">
              <Button variant="outline" size="lg" className="rounded-2xl border-graphite-750 hover:bg-graphite-900 px-6 py-4">
                Architecture & Whitepaper
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Subtle bounce indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-graphite-500 cursor-pointer"
          onClick={handleEnterClick}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* 2. DEDICATED LOGIN INTERFACE: ORGANISER AND PARTICIPANT PORTALS */}
      <section
        id="portal-section"
        className={cn(
          "py-20 px-6 max-w-6xl mx-auto w-full transition-all duration-700",
          showPortalSelection ? "opacity-100" : "opacity-95"
        )}
      >
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-900 border border-graphite-800 text-xs font-mono text-indigo-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Select Your Access Role</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Portal to Enter
          </h2>
          <p className="text-sm text-graphite-400 max-w-lg mx-auto">
            Access dedicated environments for Hackathon Organisers, Participants, or Judges.
            Click below for instant 1-click demo entry or standard login.
          </p>

          {loginError && (
            <div className="p-3 max-w-md mx-auto rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {loginError}
            </div>
          )}
        </div>

        {/* DUAL PROMINENT PORTAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* A. ORGANISER PORTAL */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-b from-graphite-900 to-graphite-900/90 shadow-2xl relative flex flex-col justify-between group hover:border-indigo-500/60 transition-all"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                  <Trophy className="w-7 h-7" />
                </div>
                <Badge variant="indigo" className="font-mono text-xs px-2.5 py-1">
                  Organiser Console
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Organiser Portal
                </h3>
                <p className="text-xs font-mono text-indigo-400/80 mt-1">
                  InnovateX 2026 Hackathon Admin
                </p>
                <p className="text-sm text-graphite-300 mt-3 leading-relaxed">
                  Full control over hackathon lifecycle, versioned rubrics, cross-judge statistical anomaly detection, and real-time blockchain integrity audit.
                </p>
              </div>

              <div className="space-y-2 py-2 border-y border-graphite-800 text-xs text-graphite-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Cross-judge scoring anomaly alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Live tampering simulation & audit logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Cryptographic safeguard results release</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <Link href="/login?role=ORGANIZER" className="block">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Sign In as Organiser</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/register?role=ORGANIZER" className="block">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-graphite-700 hover:border-indigo-500/50 text-graphite-300 hover:text-white"
                >
                  Create Organiser Account
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* B. PARTICIPANT PORTAL */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-graphite-900 to-graphite-900/90 shadow-2xl relative flex flex-col justify-between group hover:border-emerald-500/60 transition-all"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <Code2 className="w-7 h-7" />
                </div>
                <Badge variant="success" className="font-mono text-xs px-2.5 py-1">
                  Participant Portal
                </Badge>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Participant Portal
                </h3>
                <p className="text-xs font-mono text-emerald-400/80 mt-1">
                  Team Leader / Project Builder
                </p>
                <p className="text-sm text-graphite-300 mt-3 leading-relaxed">
                  Submit GitHub repos and project architectures, manage team members, observe 5-step AI evidence extraction, and view verified transparent results.
                </p>
              </div>

              <div className="space-y-2 py-2 border-y border-graphite-800 text-xs text-graphite-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atomic claim manager with GitHub AST mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5-step live AI evidence verification pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verifiable, non-tamperable final rubric scores</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <Link href="/login?role=PARTICIPANT" className="block">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Sign In as Participant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/register?role=PARTICIPANT" className="block">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-graphite-700 hover:border-emerald-500/50 text-graphite-300 hover:text-white"
                >
                  Create Participant Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* SECONDARY / THIRD OPTION: JUDGE WORKSPACE */}
        <div className="mt-8 max-w-4xl mx-auto p-5 rounded-2xl border border-graphite-800 bg-graphite-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Looking for Judge Evaluation Workspace?</span>
                <Badge variant="warning" className="text-[10px]">Evaluator</Badge>
              </div>
              <p className="text-xs text-graphite-400">
                Score assigned teams with real-time AI evidence cards and autonomous guardrail justification checks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login?role=JUDGE">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                Sign In as Judge
              </button>
            </Link>
            <Link href="/register?role=JUDGE">
              <Button variant="outline" size="sm" className="text-xs border-graphite-750">
                Register Judge
              </Button>
            </Link>
          </div>
        </div>

        {/* CUSTOM CREDENTIALS LOGIN EXPANDER */}
        {showCustomForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 max-w-md mx-auto p-6 rounded-2xl border border-graphite-750 bg-graphite-900 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-graphite-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Sign In ({selectedRole})
              </span>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="text-xs text-graphite-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="you@domain.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Your password"
                required
              />

              <Button
                type="submit"
                variant={selectedRole === "PARTICIPANT" ? "emerald" : "primary"}
                className="w-full"
                isLoading={isLoading}
              >
                Sign In to {selectedRole === "ORGANIZER" ? "Organiser" : selectedRole === "PARTICIPANT" ? "Participant" : "Judge"} Portal
              </Button>
            </form>
          </motion.div>
        )}
      </section>

      {/* 3. PLATFORM ARCHITECTURE PILLARS (VERIFIED FEATURES) */}
      <section className="py-20 px-6 border-t border-graphite-800 bg-graphite-900/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
              System Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Pillars of Transparent Hackathon Integrity
            </h2>
            <p className="text-sm text-graphite-400 max-w-xl mx-auto">
              How VeriJudge AI eliminates bias, unverified pitch claims, and centralized database tampering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. AI Evidence Agent</h3>
              <p className="text-xs text-graphite-300 leading-relaxed">
                Decomposes complex pitch claims into atomic propositions. Scans GitHub AST trees, commit history, and system diagrams to assign structured evidence tags without hallucinating.
              </p>
              <div className="pt-2 font-mono text-[11px] text-indigo-400 flex items-center gap-1.5">
                <span>[Supported] [Partially Supported] [Unsupported]</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Autonomous Score Guardrails</h3>
              <p className="text-xs text-graphite-300 leading-relaxed">
                Detects evidence/score divergence in real-time. If a judge awards top marks (24/25) to unsupported claims, a modal prompts brief written justification while preserving 100% human discretion.
              </p>
              <div className="pt-2 font-mono text-[11px] text-amber-400 flex items-center gap-1.5">
                <span>Non-blocking challenge modal with audit hash</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-900/60 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Polygon Keccak-256 Anchoring</h3>
              <p className="text-xs text-graphite-300 leading-relaxed">
                Submissions and final score bundles are deterministically serialized and hashed with Keccak-256. Committed on-chain to Polygon Amoy testnet for permanent, tamper-evident verification.
              </p>
              <div className="pt-2 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span>EvaluationAnchor.sol smart contract</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-graphite-800 text-center text-xs text-graphite-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">HackJudge</span>
            <span>• VeriJudge AI Protocol</span>
          </div>
          <div>Polygon Amoy Testnet • Keccak-256 Verified State</div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-graphite-300">About</Link>
            <Link href="/contact" className="hover:text-graphite-300">Contact</Link>
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
