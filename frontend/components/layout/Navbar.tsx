"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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
  ArrowRightLeft
} from "lucide-react";

export function Navbar() {
  const { user, role, logout, switchDemoRole } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">
                  VeriJudge<span className="text-indigo-400">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  v1.2
                </span>
              </div>
              <p className="text-[10px] text-graphite-400 font-mono hidden sm:block">
                Transparent, Evidence-Based Hackathon Evaluation
              </p>
            </div>
          </Link>

          {/* Blockchain anchor network indicator */}
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-graphite-800/80 border border-graphite-700/60 text-xs text-graphite-300 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Polygon Amoy</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-graphite-700 bg-graphite-850 hover:bg-graphite-800 text-xs font-medium text-graphite-200 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-white">{role || "Select Role"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-graphite-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-graphite-700 bg-graphite-850 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[11px] font-semibold text-graphite-400 uppercase tracking-wider">
                  Quick Demo Switch
                </div>
                <button
                  onClick={() => {
                    switchDemoRole("organizer");
                    setIsRoleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === "ORGANIZER"
                      ? "bg-indigo-600/20 text-indigo-300 font-medium"
                      : "text-graphite-300 hover:bg-graphite-800"
                  }`}
                >
                  <span>Organizer Portal</span>
                  <Badge variant="indigo">Admin</Badge>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole("judge");
                    setIsRoleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === "JUDGE"
                      ? "bg-amber-600/20 text-amber-300 font-medium"
                      : "text-graphite-300 hover:bg-graphite-800"
                  }`}
                >
                  <span>Judge Workspace</span>
                  <Badge variant="warning">Evaluator</Badge>
                </button>
                <button
                  onClick={() => {
                    switchDemoRole("participant");
                    setIsRoleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    role === "PARTICIPANT"
                      ? "bg-emerald-600/20 text-emerald-300 font-medium"
                      : "text-graphite-300 hover:bg-graphite-800"
                  }`}
                >
                  <span>Participant Portal</span>
                  <Badge variant="success">Team</Badge>
                </button>
              </div>
            )}
          </div>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg text-graphite-400 hover:text-white hover:bg-graphite-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-graphite-700 bg-graphite-850 p-3 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-graphite-800">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-graphite-400">2 unread</span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-750 text-xs">
                    <p className="font-medium text-indigo-300">AI Evidence Agent Ready</p>
                    <p className="text-[11px] text-graphite-400 mt-0.5">12 claims parsed for Smart Campus Assistant.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-graphite-800/60 border border-graphite-750 text-xs">
                    <p className="font-medium text-emerald-400">Blockchain Anchored</p>
                    <p className="text-[11px] text-graphite-400 mt-0.5">Eval tx 0x8f3c... finalized on Polygon Amoy.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile and logout */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-graphite-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-white line-clamp-1">{user.full_name}</p>
                  <p className="text-[10px] text-graphite-400 font-mono line-clamp-1">{user.organization || user.email}</p>
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
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
