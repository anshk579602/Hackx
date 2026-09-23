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
  Settings,
  Layers,
  PlusCircle,
  ChevronRight
} from "lucide-react";

type AccentColor = "amber" | "rose" | null;

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  accent?: AccentColor;
  badge?: string | null;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Event Management",
    items: [
      { label: "Hackathons", href: "/organizer/hackathons", icon: Trophy },
      { label: "Rubrics", href: "/organizer/rubrics", icon: Scale },
      { label: "Teams", href: "/organizer/teams", icon: Users },
      { label: "Judges", href: "/organizer/judges", icon: Gavel },
    ],
  },
  {
    label: "Evaluation",
    items: [
      { label: "Evaluations", href: "/organizer/evaluations", icon: CheckSquare },
      { label: "Results & Rankings", href: "/organizer/results", icon: BarChart3 },
    ],
  },
  {
    label: "Integrity & Audit",
    items: [
      { label: "Anomaly Engine", href: "/organizer/anomalies", icon: AlertTriangle, accent: "amber" as AccentColor },
      { label: "Integrity Center", href: "/organizer/integrity", icon: ShieldAlert, accent: "rose" as AccentColor, badge: "Guard" },
      { label: "Audit Log", href: "/organizer/audit-log", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/organizer/settings", icon: Settings },
    ],
  },
];

export function OrganizerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-indigo-900/60 bg-[#07091a]/90 min-h-[calc(100vh-4rem)] flex flex-col shrink-0 hidden md:flex">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400" />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="px-3 pt-1 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Organiser Console</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
            <span>Integrity Guard Active</span>
          </div>
        </div>

        <Link href="/organizer/hackathons/new">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-colors text-xs font-semibold cursor-pointer">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Hackathon</span>
          </div>
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-graphite-500 mb-1">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/organizer/dashboard" && pathname.startsWith(item.href));
              const accentColor = item.accent === "rose" ? "text-rose-400" : item.accent === "amber" ? "text-amber-400" : isActive ? "text-indigo-400" : "text-graphite-400";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30" : "text-graphite-400 hover:text-white hover:bg-graphite-800/50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", accentColor)} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-rose-500/20 text-rose-400 font-bold uppercase">{item.badge}</span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-indigo-500" />}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-indigo-900/50">
        <div className="p-3 rounded-xl bg-graphite-850/80 border border-graphite-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-graphite-300 font-medium">
            <span>Smart Contract</span>
            <span className="text-[10px] font-mono text-emerald-400">Connected</span>
          </div>
          <p className="text-[10px] font-mono text-graphite-500 truncate">0x5FbDB2315678afecb...</p>
          <p className="text-[10px] text-graphite-500">Polygon Amoy Testnet</p>
        </div>
      </div>
    </aside>
  );
}
