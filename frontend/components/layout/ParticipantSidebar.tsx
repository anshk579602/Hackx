
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Trophy,
  User,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Code2
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/participant/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Team",
    items: [
      { label: "Team Console", href: "/participant/team", icon: Users },
      { label: "Team Members", href: "/participant/team/members", icon: Users },
    ],
  },
  {
    label: "Submissions",
    items: [
      { label: "My Submissions", href: "/participant/submissions", icon: FolderGit2 },
      { label: "Submit Project", href: "/participant/submission/new", icon: PlusCircle },
    ],
  },
  {
    label: "Results",
    items: [
      { label: "Results & Scores", href: "/participant/results", icon: Trophy },
      { label: "Profile", href: "/participant/profile", icon: User },
    ],
  },
];

export function ParticipantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-emerald-900/40 bg-[#00100a]/90 min-h-[calc(100vh-4rem)] flex flex-col shrink-0 hidden md:flex">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="px-3 pt-1 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Participant Portal
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>HackX Arena Active</span>
          </div>
        </div>

        <Link href="/participant/submission/new">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition-colors text-xs font-semibold cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Project</span>
          </div>
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-graphite-500 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/participant/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                      : "text-graphite-400 hover:text-white hover:bg-graphite-800/50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-emerald-400" : "text-graphite-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-emerald-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-emerald-900/40">
        <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HackX AI Engine</span>
          </div>
          <p className="text-[11px] text-graphite-400 leading-relaxed">
            AI Evidence Agent continuously validates submitted repo links and claims.
          </p>
        </div>
      </div>
    </aside>
  );
}
