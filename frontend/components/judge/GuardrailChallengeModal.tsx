"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { AlertTriangle, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

interface GuardrailChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasons: string[];
  suggestedQuestions: string[];
  initialJustification?: string;
  onConfirm: (justification: string) => void;
  isSubmitting?: boolean;
}

export function GuardrailChallengeModal({
  isOpen,
  onClose,
  reasons,
  suggestedQuestions,
  initialJustification = "",
  onConfirm,
  isSubmitting = false,
}: GuardrailChallengeModalProps) {
  const [justification, setJustification] = useState(initialJustification);
  const [selectedQuickReason, setSelectedQuickReason] = useState<string>("");

  const quickJustifications = [
    "Team demonstrated uncommitted local load test benchmark during live booth demonstration.",
    "Technical complexity was proven through proprietary algorithm walkthrough during Q&A.",
    "Evaluation based on functional edge cases and live stress test observed in real-time.",
    "Verified architecture differentiation exceeding baseline open-source implementations."
  ];

  const handleSelectQuick = (text: string) => {
    setSelectedQuickReason(text);
    setJustification((prev) => (prev ? `${prev} ${text}` : text));
  };

  const isValid = justification.trim().length >= 15;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluation Guardrail: Justification Requested"
      description="HackX detected a divergence between awarded scores and repository evidence."
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Score Divergence Notice</span>
            <ul className="list-disc pl-4 space-y-1 text-amber-200/90 text-xs">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Challenge questions */}
        {suggestedQuestions.length > 0 && (
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI Challenge Question:</span>
            </div>
            {suggestedQuestions.map((q, i) => (
              <p key={i} className="text-graphite-200 font-medium italic pl-2 border-l-2 border-indigo-500/50">
                &ldquo;{q}&rdquo;
              </p>
            ))}
          </div>
        )}

        {/* Quick presets */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider">
            Quick Justification Templates:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {quickJustifications.map((qj, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuick(qj)}
                className="text-left p-2 rounded-lg bg-graphite-900/80 hover:bg-graphite-800 border border-graphite-800 text-xs text-graphite-300 hover:text-white transition-colors"
              >
                + {qj}
              </button>
            ))}
          </div>
        </div>

        {/* Justification Textarea */}
        <div className="space-y-1">
          <Textarea
            label="Judge Justification (Audit-Secured)"
            placeholder="Explain why the awarded score is warranted (e.g. verified during live presentation or demo Q&A)..."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={3}
          />
          <div className="flex justify-between text-[11px] text-graphite-500">
            <span>Minimum 15 characters required</span>
            <span className={isValid ? "text-emerald-400" : "text-amber-400"}>
              {justification.length} characters
            </span>
          </div>
        </div>

        {/* Note on human sovereignty */}
        <p className="text-[11px] text-graphite-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            HackX never alters human scores. Your justification will be hashed and permanently anchored to the blockchain.
          </span>
        </p>

        {/* Action buttons */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-graphite-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            onClick={() => onConfirm(justification)}
          >
            Confirm Justification & Anchor
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
