"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ParticipationItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Bell,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Sparkles,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Trophy,
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isParticipationsOpen, setIsParticipationsOpen] = useState(false);
  const [participations, setParticipations] = useState<ParticipationItem[]>([]);

  useEffect(() => {
    if (role === "PARTICIPANT") {
      api.getMyParticipations()
        .then((data) => setParticipations(data || []))
        .catch((err) => console.error("Navbar participations error:", err));
    }
  }, [role, pathname]);

  // Hide global navbar on root landing/splash and auth screens for total visual immersion
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const getDashboardLink = () => {
    switch (role) {
      case "ORGANIZER":
        return "/organizer/dashboard";
      case "JUDGE":
        return "/judge/dashboard";
      case "PARTICIPANT":
        return "/participant/dashboard";
      default:
        return "/login";
    }
  };

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "ORGANIZER":
        return "indigo";
      case "JUDGE":
        return "warning";
      case "PARTICIPANT":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-graphite-800 bg-graphite-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white uppercase flex items-center">
                  HACK<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-xl font-black inline-block transform scale-125 ml-0.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">X</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-graphite-400 font-mono hidden sm:block">
                Transparent, Evidence-Based Hackathon Platform
              </p>
            </div>
          </Link>

          {/* Blockchain anchor network indicator */}
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-graphite-800/80 border border-graphite-700/60 text-xs text-graphite-300 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Polygon Amoy Testnet</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-graphite-700 bg-graphite-850 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-graphite-800">
                  <span className="text-xs font-semibold text-white">HackX System Alerts</span>
                  <span className="text-[10px] text-graphite-400 font-mono">Live</span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-750 text-xs">
                    <p className="font-medium text-emerald-400">Cryptographic Protocol Active</p>
                    <p className="text-[11px] text-graphite-400 mt-0.5">Keccak-256 evaluation engine ready for anchoring.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-750 text-xs">
                    <p className="font-medium text-indigo-400">Database Synchronized</p>
                    <p className="text-[11px] text-graphite-400 mt-0.5">HackX clean slate database initialized.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile and Navigation */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-graphite-800">
              {/* Participated Hackathons Dropdown for Participants */}
              {role === "PARTICIPANT" && (
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsParticipationsOpen(!isParticipationsOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5 font-medium"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">My Hackathons</span>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5 font-mono">
                      {participations.length}
                    </Badge>
                    <ChevronDown className="w-3 h-3 text-graphite-400" />
                  </Button>

                  {isParticipationsOpen && (
                    <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-96 rounded-2xl border border-graphite-700 bg-graphite-900 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-graphite-800">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Participated Hackathons
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {participations.length} Enrolled
                        </span>
                      </div>

                      {participations.length === 0 ? (
                        <div className="p-4 rounded-xl bg-graphite-950/60 border border-graphite-800 text-center space-y-1.5">
                          <p className="text-xs font-medium text-graphite-300">No Participations Yet</p>
                          <p className="text-[11px] text-graphite-500">
                            Register your team on the dashboard to start submitting projects and viewing scores.
                          </p>
                          <Link
                            href="/participant/team"
                            onClick={() => setIsParticipationsOpen(false)}
                            className="inline-block mt-1 text-xs text-emerald-400 hover:underline font-semibold"
                          >
                            Browse &amp; Register Team &rarr;
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {participations.map((p) => {
                            const hasEvaluation = Boolean(p.evaluation);
                            const hasSubmission = Boolean(p.submission);

                            return (
                              <div
                                key={p.team.id}
                                className="p-3 rounded-xl bg-graphite-950 border border-graphite-800 hover:border-emerald-500/40 transition-all space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-white line-clamp-1">
                                      {p.hackathon?.title || "HackX Championship"}
                                    </h4>
                                    <p className="text-[11px] text-graphite-400">
                                      Team: <span className="text-emerald-400 font-medium">{p.team.name}</span>
                                    </p>
                                  </div>

                                  {hasEvaluation ? (
                                    <Badge variant="success" className="text-[10px]">
                                      Score: {p.evaluation?.final_score?.toFixed(1)}
                                    </Badge>
                                  ) : hasSubmission ? (
                                    <Badge variant="warning" className="text-[10px]">
                                      Submitted
                                    </Badge>
                                  ) : (
                                    <Badge variant="indigo" className="text-[10px]">
                                      Registered
                                    </Badge>
                                  )}
                                </div>

                                {/* Quick Links: Submission & Results */}
                                <div className="flex items-center gap-2 pt-1 border-t border-graphite-850 text-xs">
                                  <Link
                                    href={
                                      hasSubmission
                                        ? `/participant/submission/${p.submission?.id}`
                                        : "/participant/submission/new"
                                    }
                                    onClick={() => setIsParticipationsOpen(false)}
                                    className="flex-1 py-1 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium flex items-center justify-center gap-1 text-[11px] transition-colors"
                                  >
                                    <FolderGit2 className="w-3 h-3" />
                                    <span>{hasSubmission ? "View Submission" : "Submit Project"}</span>
                                  </Link>

                                  <Link
                                    href="/participant/results"
                                    onClick={() => setIsParticipationsOpen(false)}
                                    className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium flex items-center justify-center gap-1 text-[11px] transition-colors"
                                  >
                                    <Trophy className="w-3 h-3" />
                                    <span>View Results</span>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link href={getDashboardLink()}>
                <Button size="sm" variant="outline" className="text-xs border-graphite-700 hover:border-indigo-500/50 flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dashboard</span>
                  {role && (
                    <Badge variant={getRoleBadgeVariant() as any} className="ml-1 text-[10px] py-0 px-1.5">
                      {role}
                    </Badge>
                  )}
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-white line-clamp-1">{user.full_name}</p>
                  <p className="text-[10px] text-graphite-400 font-mono line-clamp-1">{user.email}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-graphite-400 hover:text-rose-400"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs text-graphite-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary" className="text-xs bg-indigo-600 hover:bg-indigo-500">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
