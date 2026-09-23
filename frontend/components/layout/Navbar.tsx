"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LayoutDashboard
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
                <span className="font-black text-lg tracking-tight text-white uppercase">
                  HACK<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">X</span>
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
