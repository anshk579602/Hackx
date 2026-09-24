"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScoreSliderProps {
  label: string;
  maxScore: number;
  value: number;
  onChange: (val: number) => void;
  criteria?: string;
  disabled?: boolean;
}

export function ScoreSlider({
  label,
  maxScore,
  value,
  onChange,
  criteria,
  disabled = false,
}: ScoreSliderProps) {
  const percentage = Math.round((value / maxScore) * 100);

  const getTrackColor = () => {
    if (percentage >= 85) return "accent-indigo-500 text-indigo-400";
    if (percentage >= 60) return "accent-emerald-500 text-emerald-400";
    return "accent-amber-500 text-amber-400";
  };

  return (
    <div className="space-y-2 rounded-lg bg-graphite-900/60 p-3.5 border border-graphite-800">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{label}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300">
              {maxScore}%
            </span>
          </div>
          {criteria && (
            <p className="text-xs text-graphite-400 line-clamp-1 mt-0.5">{criteria}</p>
          )}
        </div>
        <div className="flex items-baseline gap-1 text-right">
          {disabled && value === 0 ? (
            <span className="text-lg font-bold font-mono text-graphite-600">—</span>
          ) : (
            <span className={cn("text-lg font-bold font-mono transition-colors", getTrackColor())}>
              {value}
            </span>
          )}
          <span className="text-xs text-graphite-500 font-mono">/ {maxScore}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max={maxScore}
          step="0.5"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-graphite-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
        <input
          type="number"
          min="0"
          max={maxScore}
          step="0.5"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
              onChange(Math.max(0, Math.min(maxScore, v)));
            }
          }}
          className="w-16 h-8 text-center rounded border border-graphite-700 bg-graphite-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
