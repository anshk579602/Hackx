"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Gavel,
  Users,
  Trophy,
  Sparkles,
  CheckCircle2,
  KeyRound,
  FileCheck,
  Code2,
  Layers,
  Scale,
  Cpu,
  Eye,
  EyeOff,
  Terminal,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "PARTICIPANT" | "ORGANIZER" | "JUDGE";

interface RoleConfig {
  title: string;
  badge: string;
  subtitle: string;
  themeColor: "emerald" | "indigo" | "amber";
  accentBorder: string;
  accentBg: string;
  accentText: string;
  glowClass: string;
  buttonClass: string;
  icon: React.ReactNode;
  heroBadge: string;
  heroHeading: string;
  heroSubtitle: string;
  featurePills: { icon: React.ReactNode; title: string; desc: string }[];
  registerLabel: string;
  registerUrl: string;
  placeholderEmail: string;
}

const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  PARTICIPANT: {
    title: "Participant Squad Console",
    badge: "HACKER & SQUAD CONSOLE",
    subtitle: "Manage teams, submit code repositories, define atomic claims, and view verified results.",
    themeColor: "emerald",
    accentBorder: "border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-400",
    glowClass: "shadow-[0_0_35px_rgba(16,185,129,0.18)]",
    buttonClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 text-white",
    icon: <Code2 className="w-5 h-5 text-emerald-400" />,
    heroBadge: "SQUAD LAUNCHPAD",
    heroHeading: "Build, Submit & Verify Your Hackathon Squad",
    heroSubtitle: "Form your squad with unique join codes, submit GitHub repos with atomic claims, and view cryptographic scores.",
    featurePills: [
      {
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        title: "Squad Roster & Join Codes",
        desc: "Generate instant 6-character team codes to invite co-hackers."
      },
      {
        icon: <FileCheck className="w-4 h-4 text-emerald-400" />,
        title: "Deterministic AST Claims",
        desc: "Propose atomic technical propositions verified directly against code."
      },
      {
        icon: <Trophy className="w-4 h-4 text-emerald-400" />,
        title: "Cryptographic Results",
        desc: "Official category score breakdowns backed by Polygon testnet hashes."
      }
    ],
    registerLabel: "Need a squad? Register New Participant Squad →",
    registerUrl: "/register?role=PARTICIPANT",
    placeholderEmail: "alex.hacker@squad.io"
  },
  ORGANIZER: {
    title: "Organiser Command Center",
    badge: "ADMIN & INTEGRITY PROTOCOL",
    subtitle: "Launch hackathons, configure immutable rubrics, audit live cryptographic anchors, and publish results.",
    themeColor: "indigo",
    accentBorder: "border-indigo-500/40",
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-400",
    glowClass: "shadow-[0_0_35px_rgba(99,102,241,0.22)]",
    buttonClass: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 text-white",
    icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
    heroBadge: "COMMAND CENTER",
    heroHeading: "Total Hackathon Integrity & Orchestration",
    heroSubtitle: "Host competitive challenges with automated scoring guardrails, cross-judge anomaly audits, and on-chain anchoring.",
    featurePills: [
      {
        icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
        title: "Keccak-256 On-Chain Anchors",
        desc: "Cryptographically seal finalized evaluations onto Polygon blockchain."
      },
      {
        icon: <Layers className="w-4 h-4 text-indigo-400" />,
        title: "Immutable Rubric Versioning",
        desc: "Strict rubric category weights locked prior to judging commencement."
      },
      {
        icon: <Activity className="w-4 h-4 text-indigo-400" />,
        title: "Real-time Anomaly Detection",
        desc: "Statistical outlier monitoring flags biased or divergent scoring instantly."
      }
    ],
    registerLabel: "Hosting a hackathon? Register as Organiser →",
    registerUrl: "/register?role=ORGANIZER",
    placeholderEmail: "director@techcouncil.org"
  },
  JUDGE: {
    title: "Judicial Evaluation Chamber",
    badge: "VERIFIED EVALUATOR BENCH",
    subtitle: "Inspect AST code claims, score projects with fine-grained rubric sliders, and fulfill guardrail checks.",
    themeColor: "amber",
    accentBorder: "border-amber-500/40",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-400",
    glowClass: "shadow-[0_0_35px_rgba(245,158,11,0.18)]",
    buttonClass: "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-white",
    icon: <Gavel className="w-5 h-5 text-amber-400" />,
    heroBadge: "EVALUATOR BENCH",
    heroHeading: "Evidence-Backed Evaluation Workspace",
    heroSubtitle: "Review assigned teams with multi-model claim verification, sticky rubric criteria sliders, and justification guardrails.",
    featurePills: [
      {
        icon: <Terminal className="w-4 h-4 text-amber-400" />,
        title: "AST Evidence Verification",
        desc: "Direct verification of technical claims against repository commits."
      },
      {
        icon: <Scale className="w-4 h-4 text-amber-400" />,
        title: "Autonomous Score Guardrails",
        desc: "Non-overriding justification alerts for high scores on unsupported claims."
      },
      {
        icon: <Gavel className="w-4 h-4 text-amber-400" />,
        title: "Authoritative Human Decision",
        desc: "100% human-controlled scoring preserved with zero automated overrides."
      }
    ],
    registerLabel: "Invited to evaluate? Create Judge Account →",
    registerUrl: "/register?role=JUDGE",
    placeholderEmail: "judge.elena@institution.edu"
  }
};

export default function LoginPage() {
  const { login } = useAuth();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashStep, setSplashStep] = useState(0);

  // Login Form States
  const [activeRole, setActiveRole] = useState<RoleType>("PARTICIPANT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Splash animation progression
  useEffect(() => {
    // Check URL parameters for immediate role or skip
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedRole = params.get("role")?.toUpperCase();
      if (requestedRole && ["PARTICIPANT", "ORGANIZER", "JUDGE"].includes(requestedRole)) {
        setActiveRole(requestedRole as RoleType);
      }
      if (params.get("skip") === "true") {
        setShowSplash(false);
        return;
      }
    }

    const t1 = setTimeout(() => setSplashStep(1), 1200);
    const t2 = setTimeout(() => setSplashStep(2), 2500);
    const t3 = setTimeout(() => setSplashStep(3), 3700);
    const t4 = setTimeout(() => setShowSplash(false), 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const config = ROLE_CONFIGS[activeRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-graphite-100 flex flex-col relative overflow-hidden select-none">
      {/* 1. CINEMATIC SPLASH SCREEN (SOLID OPAQUE BACKGROUND, ONLY "HACKX" WITH EXTENDED DISPLAY) */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center px-6 overflow-hidden select-none"
            style={{ backgroundColor: "#06080d" }}
          >
            {/* 100% Solid Non-Transparent Foundation Layer */}
            <div className="absolute inset-0 bg-[#06080d] pointer-events-none" />

            {/* Ambient Nebula Glow - Contained within solid dark canvas */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22)_0%,rgba(16,185,129,0.08)_40%,#06080d_75%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d20_1px,transparent_1px),linear-gradient(to_bottom,#1f293d20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Glowing Aura Rings */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-3xl">
              {/* Animated Shield Insignia */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 140 }}
                className="relative group"
              >
                <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-3xl blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-graphite-900 border-2 border-indigo-400/40 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" />
                  <Gavel className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 absolute bottom-3 right-3 drop-shadow-md" />
                </div>
              </motion.div>

              {/* ONLY PORTAL NAME: HACKX ANIMATION */}
              <motion.div
                initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "-0.03em" }}
                transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                className="space-y-2"
              >
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight select-none">
                  <span className="text-white drop-shadow-lg">HACK</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                    X
                  </span>
                </h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center justify-center gap-2 font-mono text-xs sm:text-sm text-indigo-300 tracking-wider uppercase font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Verifiable Evaluation Protocol • Sovereign AI Architecture</span>
                </motion.div>
              </motion.div>

              {/* Protocol Initialization Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full max-w-sm space-y-2 pt-4"
              >
                <div className="h-1.5 w-full bg-graphite-800 rounded-full overflow-hidden border border-graphite-700/50">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4.4, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-graphite-400 px-1">
                  <span>
                    {splashStep === 0 && "[ INITIALIZING CRYPTOGRAPHIC VAULT ]"}
                    {splashStep === 1 && "[ VERIFYING ROLE PORTALS & SIGNATURES ]"}
                    {splashStep === 2 && "[ SYNCHRONIZING WITH IMMUTABLE LEDGER ]"}
                    {splashStep >= 3 && "[ SECURE MATRIX READY • WELCOME TO HACKX ]"}
                  </span>
                  <span className="text-emerald-400">
                    {splashStep >= 3 ? "100% OK" : "SYNCING"}
                  </span>
                </div>
              </motion.div>

              {/* Instant Bypass Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-2"
              >
                <button
                  onClick={() => setShowSplash(false)}
                  className="px-6 py-2.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 hover:bg-indigo-900/80 text-xs font-mono text-indigo-200 hover:text-white transition-all flex items-center gap-2 group shadow-lg shadow-indigo-950/50"
                >
                  <span>Enter HackX Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN LOGIN SCREEN (OPENS WITH 3 DEDICATED SECTIONS / ROLE TOGGLE) */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full relative z-10">
        {/* Top Header with Portal Mark and Return Home Link */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white uppercase">
                HACK<span className="text-indigo-400">JUDGE</span>
              </span>
              <p className="text-[10px] font-mono text-graphite-400">Evaluation Matrix</p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-mono text-graphite-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
          >
            <span>← Back to Overview</span>
          </Link>
        </div>

        {/* 3-WAY ROLE TOGGLE BAR (Participant | Organiser | Judge) */}
        <div className="w-full max-w-5xl mb-8">
          <div className="p-1.5 rounded-2xl bg-graphite-900 border border-graphite-800 shadow-xl grid grid-cols-3 gap-1.5">
            {/* Toggle 1: Participant */}
            <button
              type="button"
              onClick={() => {
                setActiveRole("PARTICIPANT");
                setError(null);
              }}
              className={cn(
                "relative py-3.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2",
                activeRole === "PARTICIPANT"
                  ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-950"
                  : "text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850/60"
              )}
            >
              <Code2 className={cn("w-4 h-4", activeRole === "PARTICIPANT" ? "text-emerald-400" : "text-graphite-500")} />
              <span>Participant</span>
              {activeRole === "PARTICIPANT" && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute bottom-1 w-8 h-0.5 bg-emerald-400 rounded-full"
                />
              )}
            </button>

            {/* Toggle 2: Organiser */}
            <button
              type="button"
              onClick={() => {
                setActiveRole("ORGANIZER");
                setError(null);
              }}
              className={cn(
                "relative py-3.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2",
                activeRole === "ORGANIZER"
                  ? "bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-950"
                  : "text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850/60"
              )}
            >
              <ShieldCheck className={cn("w-4 h-4", activeRole === "ORGANIZER" ? "text-indigo-400" : "text-graphite-500")} />
              <span>Organiser</span>
              {activeRole === "ORGANIZER" && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute bottom-1 w-8 h-0.5 bg-indigo-400 rounded-full"
                />
              )}
            </button>

            {/* Toggle 3: Judge */}
            <button
              type="button"
              onClick={() => {
                setActiveRole("JUDGE");
                setError(null);
              }}
              className={cn(
                "relative py-3.5 px-3 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2",
                activeRole === "JUDGE"
                  ? "bg-gradient-to-r from-amber-600/30 to-yellow-600/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950"
                  : "text-graphite-400 hover:text-graphite-200 hover:bg-graphite-850/60"
              )}
            >
              <Gavel className={cn("w-4 h-4", activeRole === "JUDGE" ? "text-amber-400" : "text-graphite-500")} />
              <span>Judge</span>
              {activeRole === "JUDGE" && (
                <motion.div
                  layoutId="roleIndicator"
                  className="absolute bottom-1 w-8 h-0.5 bg-amber-400 rounded-full"
                />
              )}
            </button>
          </div>
        </div>

        {/* DUAL COLUMN INTERFACE: LEFT ROLE PROFILE & RIGHT LOGIN FORM */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT COLUMN: DYNAMIC ROLE ENVIRONMENT PROFILE */}
          <motion.div
            key={`left-${activeRole}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "lg:col-span-6 p-8 sm:p-10 rounded-3xl border bg-gradient-to-br from-graphite-900/90 to-graphite-900/40 flex flex-col justify-between relative overflow-hidden backdrop-blur-md",
              config.accentBorder,
              config.glowClass
            )}
          >
            {/* Background Glow */}
            <div
              className={cn(
                "absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none",
                activeRole === "PARTICIPANT" && "bg-emerald-500",
                activeRole === "ORGANIZER" && "bg-indigo-500",
                activeRole === "JUDGE" && "bg-amber-500"
              )}
            />

            <div className="space-y-6 relative z-10">
              {/* Role Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium shadow-sm"
                style={{
                  borderColor:
                    activeRole === "PARTICIPANT"
                      ? "rgba(16,185,129,0.3)"
                      : activeRole === "ORGANIZER"
                      ? "rgba(99,102,241,0.3)"
                      : "rgba(245,158,11,0.3)",
                  backgroundColor:
                    activeRole === "PARTICIPANT"
                      ? "rgba(16,185,129,0.1)"
                      : activeRole === "ORGANIZER"
                      ? "rgba(99,102,241,0.1)"
                      : "rgba(245,158,11,0.1)"
                }}
              >
                {config.icon}
                <span className={config.accentText}>{config.heroBadge}</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {config.heroHeading}
                </h2>
                <p className="text-xs sm:text-sm text-graphite-300 leading-relaxed">
                  {config.heroSubtitle}
                </p>
              </div>

              {/* 3 Role-Specific Feature Bullet Cards */}
              <div className="space-y-3 pt-2">
                {config.featurePills.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-graphite-850/80 border border-graphite-750 flex items-start gap-3.5"
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-graphite-900 border border-graphite-700">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                      <p className="text-[11px] text-graphite-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Trust Footer */}
            <div className="pt-8 border-t border-graphite-800 text-[11px] font-mono text-graphite-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Polygon Amoy Testnet Ready</span>
              </span>
              <span className="text-graphite-500">Keccak-256 Engine</span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: LOGIN FORM FOR SELECTED ROLE */}
          <motion.div
            key={`right-${activeRole}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "lg:col-span-6 p-8 sm:p-10 rounded-3xl border bg-graphite-900/95 flex flex-col justify-between shadow-2xl relative backdrop-blur-md",
              config.accentBorder
            )}
          >
            <div className="space-y-6">
              {/* Form Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-mono font-bold tracking-wider uppercase", config.accentText)}>
                    {config.badge}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-graphite-800 text-graphite-400 border border-graphite-700">
                    Live Database
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Sign in to {config.title}
                </h3>
                <p className="text-xs text-graphite-400">
                  Enter your registered credentials to access your dashboard.
                </p>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{error}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder={config.placeholderEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-graphite-200">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-graphite-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-graphite-700 bg-graphite-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="font-mono text-[10px] text-graphite-500">256-bit Encrypted</span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50",
                    config.buttonClass
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Authenticating with Database...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In as {activeRole === "PARTICIPANT" ? "Participant" : activeRole === "ORGANIZER" ? "Organiser" : "Judge"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Direct Link to Register for this Role */}
            <div className="pt-6 mt-6 border-t border-graphite-800 text-center">
              <Link
                href={config.registerUrl}
                className={cn(
                  "text-xs font-mono font-semibold transition-colors hover:underline inline-flex items-center gap-1",
                  config.accentText
                )}
              >
                <span>{config.registerLabel}</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Global Footer Security Pill */}
        <div className="mt-12 text-center text-xs text-graphite-500 font-mono">
          <span>HackX Protocol v2.4 • End-to-End Cryptographic Persistence</span>
        </div>
      </div>
    </div>
  );
}
