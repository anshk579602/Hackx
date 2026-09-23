"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  Scale,
  Gavel,
  Users,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Settings
} from "lucide-react";

export function OrganizerSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
    { label: "Hackathons", href: "/organizer/hackathons", icon: Trophy },
    { label: "Rubrics", href: "/organizer/rubrics", icon: Scale },
    { label: "Judges", href: "/organizer/judges", icon: Gavel },
    { label: "Teams", href: "/organizer/teams", icon: Users },
    { label: "Evaluations", href: "/organizer/evaluations", icon: CheckSquare },
    { label: "Results & Rankings", href: "/organizer/results", icon: BarChart3 },
    { label: "Anomalies", href: "/organizer/anomalies", icon: AlertTriangle },
    { label: "Integrity Center", href: "/organizer/integrity", icon: ShieldAlert },
    { label: "Audit Log", href: "/organizer/audit-log", icon: FileText },
    { label: "Settings", href: "/organizer/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-graphite-800 bg-graphite-900/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite-400">
            Organizer Console
          </p>
          <div className="mt-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Integrity Guard: Active</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/organizer/dashboard" && pathname.startsWith(item.href));
            const isIntegrity = item.label === "Integrity Center";
            const isAnomaly = item.label === "Anomalies";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-graphite-400 hover:text-white hover:bg-graphite-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive
                        ? "text-indigo-400"
                        : isIntegrity
                        ? "text-rose-400"
                        : isAnomaly
                        ? "text-amber-400"
                        : "text-graphite-400"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {isIntegrity && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-400 font-semibold">
                    Tamper Alert
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs">
        <div className="flex items-center justify-between text-graphite-300 font-medium mb-1">
          <span>Smart Contract</span>
          <span className="text-[10px] font-mono text-emerald-400">Connected</span>
        </div>
        <p className="text-[10px] font-mono text-graphite-400 truncate">
          0x5FbDB2315678afecb...
        </p>
      </div>
    </aside>
  );
}
