"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  History,
  User,
  ShieldCheck,
  Scale
} from "lucide-react";

export function JudgeSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/judge/dashboard", icon: LayoutDashboard },
    { label: "Assigned Teams", href: "/judge/assigned-teams", icon: Users },
    { label: "Profile & Focus", href: "/judge/profile", icon: User },
  ];

  return (
    <aside className="w-64 border-r border-graphite-800 bg-graphite-900/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite-400">
            Judge Workspace
          </p>
          <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Rubric v1.2 (Active)</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/judge/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-graphite-400 hover:text-white hover:bg-graphite-800/60"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-graphite-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Score Guardrail Active</span>
        </div>
        <p className="text-[11px] text-graphite-400 leading-relaxed">
          AI checks evidence alignment in real-time. Unjustified score discrepancies will request human review.
        </p>
      </div>
    </aside>
  );
}
