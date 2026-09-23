"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  User,
  Scale,
  ShieldCheck,
  Gavel,
  ChevronRight,
  Clock
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/judge/dashboard", icon: LayoutDashboard },
  { label: "Assigned Teams", href: "/judge/assigned-teams", icon: Users },
  { label: "Profile & Focus", href: "/judge/profile", icon: User },
];

export function JudgeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-amber-900/40 bg-[#0e0a00]/90 min-h-[calc(100vh-4rem)] flex flex-col shrink-0 hidden md:flex">
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" />

      <div className="flex-1 p-4 space-y-5">
        <div className="px-3 pt-1 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Judge Workspace</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>Rubric v1.2 Active</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-graphite-500 mb-1">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/judge/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-graphite-400 hover:text-white hover:bg-graphite-800/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-graphite-400")} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-amber-500" />}
              </Link>
            );
          })}
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-graphite-500 mb-1">Quick Evaluate</p>
          <Link
            href="/judge/assigned-teams"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors text-xs font-semibold"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Start Evaluation</span>
          </Link>
        </div>
      </div>

      <div className="p-4 border-t border-amber-900/40">
        <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score Guardrail Active</span>
          </div>
          <p className="text-[11px] text-graphite-400 leading-relaxed">
            AI checks evidence alignment. Unjustified scores trigger human review.
          </p>
        </div>
      </div>
    </aside>
  );
}
