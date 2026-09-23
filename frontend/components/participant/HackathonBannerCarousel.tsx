"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Hackathon } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  Flame,
  ArrowRight,
  Radio
} from "lucide-react";

interface HackathonBannerCarouselProps {
  hackathons: Hackathon[];
  onRegisterClick?: (hackathonId: string) => void;
}

export function HackathonBannerCarousel({
  hackathons,
  onRegisterClick,
}: HackathonBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeHackathons = hackathons.filter(
    (h) => h.status !== "COMPLETED" && h.status !== "ARCHIVED"
  );
  const displayList = activeHackathons.length > 0 ? activeHackathons : hackathons;

  useEffect(() => {
    if (displayList.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayList.length, isPaused]);

  if (displayList.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-graphite-800 bg-gradient-to-r from-emerald-950/30 via-graphite-900 to-indigo-950/30 p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Awaiting Next Season</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              No Live Hackathons Hosted Currently
            </h2>
            <p className="text-sm text-graphite-400 leading-relaxed">
              Organisers host new events on HackX regularly. Check back soon or prepare your team with up to 6 members.
            </p>
          </div>
          <div className="shrink-0 p-6 rounded-2xl bg-graphite-950/80 border border-graphite-800/80 flex flex-col items-center text-center">
            <Trophy className="w-12 h-12 text-amber-400/60 mb-2 animate-bounce" />
            <span className="text-xs font-mono font-semibold text-graphite-300">HackX Championship</span>
            <span className="text-[11px] text-graphite-500 font-mono mt-0.5">Stay Tuned</span>
          </div>
        </div>
      </div>
    );
  }

  const current = displayList[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  const GRADIENT_THEMES = [
    "from-emerald-950/60 via-graphite-900 to-teal-950/40 border-emerald-500/30",
    "from-indigo-950/60 via-graphite-900 to-purple-950/40 border-indigo-500/30",
    "from-amber-950/50 via-graphite-900 to-rose-950/40 border-amber-500/30",
    "from-cyan-950/60 via-graphite-900 to-blue-950/40 border-cyan-500/30",
  ];

  const themeClass = GRADIENT_THEMES[currentIndex % GRADIENT_THEMES.length];

  return (
    <div
      className="relative group rounded-3xl overflow-hidden shadow-2xl transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Top Glow Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-teal-400 z-20 animate-pulse" />

      {/* Main Banner Card */}
      <div
        className={`relative bg-gradient-to-br ${themeClass} border p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 min-h-[260px] flex flex-col justify-between`}
      >
        {/* Subtle Decorative Ambient Background Graphic */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badges & Navigation Arrows */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>LIVE HACKATHON</span>
            </span>

            <Badge variant="success" className="text-xs">
              {current.status || "ACTIVE"}
            </Badge>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-graphite-800/80 border border-graphite-700/80 text-[11px] text-graphite-300 font-mono">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>
                Teams: {current.min_team_size || 1} to {current.max_team_size || 4} Members
              </span>
            </span>
          </div>

          {/* Navigation Controls */}
          {displayList.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl bg-graphite-900/80 border border-graphite-700 hover:border-emerald-500/50 hover:bg-graphite-800 text-graphite-300 hover:text-white transition-all shadow-md"
                aria-label="Previous hackathon"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-xl bg-graphite-900/80 border border-graphite-700 hover:border-emerald-500/50 hover:bg-graphite-800 text-graphite-300 hover:text-white transition-all shadow-md"
                aria-label="Next hackathon"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Banner Content Body */}
        <div className="relative z-10 my-4 space-y-2.5 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {current.title}
          </h2>

          {current.tagline && (
            <p className="text-emerald-400 font-semibold text-sm sm:text-base tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{current.tagline}</span>
            </p>
          )}

          {current.description && (
            <p className="text-xs sm:text-sm text-graphite-300 line-clamp-2 leading-relaxed">
              {current.description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Metadata & Action CTA */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-graphite-800/80">
          <div className="flex flex-wrap items-center gap-4 text-xs text-graphite-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {current.start_date
                  ? new Date(current.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Season Open"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Keccak-256 Anchored</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Evidence Scanner</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onRegisterClick ? (
              <Button
                variant="emerald"
                size="md"
                onClick={() => onRegisterClick(current.id)}
                className="gap-2 font-bold shadow-xl shadow-emerald-600/30 px-5"
              >
                <Users className="w-4 h-4" />
                <span>Register Team ({current.min_team_size || 1}-{current.max_team_size || 4} Members)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Link href={`/participant/team?hackathon=${current.id}`}>
                <Button
                  variant="emerald"
                  size="md"
                  className="gap-2 font-bold shadow-xl shadow-emerald-600/30 px-5"
                >
                  <Users className="w-4 h-4" />
                  <span>Register Team ({current.min_team_size || 1}-{current.max_team_size || 4} Members)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slide Indicators Dots */}
      {displayList.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {displayList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx
                  ? "w-6 bg-emerald-400"
                  : "w-2 bg-graphite-600 hover:bg-graphite-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
