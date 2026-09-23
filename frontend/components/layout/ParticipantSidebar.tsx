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
  Clock,
  Sparkles
} from "lucide-react";

export function ParticipantSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/participant/dashboard", icon: LayoutDashboard },
    { label: "Hosted Events", href: "/participant/events", icon: Trophy },
    { label: "My Team", href: "/participant/team", icon: Users },
    { label: "Team Members", href: "/participant/team/members", icon: Users },
    { label: "My Submissions", href: "/participant/submissions", icon: FolderGit2 },
    { label: "Submit Project", href: "/participant/submission/new", icon: PlusCircle },
    { label: "Results", href: "/participant/results", icon: Trophy },
    { label: "Profile", href: "/participant/profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r border-graphite-800 bg-graphite-900/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite-400">
            Participant Portal
          </p>
          <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HackX Arena Active</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-graphite-400 hover:text-white hover:bg-graphite-800/60"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-graphite-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HackX AI Engine</span>
        </div>
        <p className="text-[11px] text-graphite-400 leading-relaxed">
          AI Evidence Agent continuously validates submitted repo links and claims.
        </p>
      </div>
    </aside>
  );
}
