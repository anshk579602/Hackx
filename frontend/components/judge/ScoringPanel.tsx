"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RubricCategory, Evaluation, GuardrailCheckResult } from "@/lib/types";
import { ScoreSlider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { GuardrailChallengeModal } from "./GuardrailChallengeModal";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  AlertTriangle,
  Lock,
  Sparkles
} from "lucide-react";

interface ScoringPanelProps {
  categories: RubricCategory[];
  scores: Record<string, number>;
  onScoreChange: (catName: string, val: number) => void;
  categoryComments: Record<string, string>;
  onCommentChange: (catName: string, text: string) => void;
  overallFeedback: string;
  onOverallFeedbackChange: (text: string) => void;
  teamId: string;
  hackathonId: string;
  rubricVersion: string;
  isReadOnly?: boolean;
  existingEvaluation?: Evaluation | null;
  onEvaluationSubmitted?: (evalRecord: Evaluation) => void;
  aiStatus?: "IDLE" | "RUNNING" | "COMPLETED";
}

export function ScoringPanel({
  categories,
  scores,
  onScoreChange,
  categoryComments,
  onCommentChange,
  overallFeedback,
  onOverallFeedbackChange,
  teamId,
  hackathonId,
  rubricVersion,
  isReadOnly = false,
  existingEvaluation,
  onEvaluationSubmitted,
  aiStatus = "IDLE",
}: ScoringPanelProps) {
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuardrailModalOpen, setIsGuardrailModalOpen] = useState(false);
  const [guardrailData, setGuardrailData] = useState<GuardrailCheckResult | null>(null);
  const [justification, setJustification] = useState(existingEvaluation?.justification || "");
  const [anchoredRecord, setAnchoredRecord] = useState<any>(
    existingEvaluation?.blockchain_record || null
  );
  // Verify step: shows score summary before locking
  const [showVerifyStep, setShowVerifyStep] = useState(false);
  // Unlock to edit after anchoring
  const [isUnlocked, setIsUnlocked] = useState(false);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossibleScore = categories.reduce((a, b) => a + b.max_score, 0) || 100;

  // Sliders disabled if: externally read-only, anchored AND not unlocked, in verify step, OR AI has not been run yet
  const isAwaitingAi = aiStatus !== "COMPLETED" && !anchoredRecord && !existingEvaluation;
  const isEffectivelyLocked = Boolean(anchoredRecord) && !isUnlocked;
  const slidersDisabled = isReadOnly || isEffectivelyLocked || showVerifyStep || isAwaitingAi;

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await api.saveDraftEvaluation({
        hackathon_id: hackathonId,
        team_id: teamId,
        rubric_version: rubricVersion,
        category_scores: scores,
        category_comments: categoryComments,
        overall_feedback: overallFeedback,
        justification: justification,
      });
      alert("Draft evaluation saved successfully.");
    } catch (err: any) {
      alert("Failed to save draft: " + (err.message || "Unknown error"));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePreSubmitCheck = async () => {
    setIsSubmitting(true);
    try {
      const guardrailResult = await api.checkGuardrail({
        hackathon_id: hackathonId,
        team_id: teamId,
        rubric_version: rubricVersion,
        category_scores: scores,
        category_comments: categoryComments,
        overall_feedback: overallFeedback,
        justification: justification,
      });

      if (guardrailResult.requires_justification) {
        setGuardrailData(guardrailResult);
        setIsGuardrailModalOpen(true);
        setIsSubmitting(false);
      } else {
        await executeFinalSubmission(justification);
      }
    } catch (err: any) {
      alert("Submission check error: " + err.message);
      setIsSubmitting(false);
    }
  };

  const executeFinalSubmission = async (justificationText: string) => {
    setIsSubmitting(true);
    try {
      const result = await api.submitEvaluation({
        hackathon_id: hackathonId,
        team_id: teamId,
        rubric_version: rubricVersion,
        category_scores: scores,
        category_comments: categoryComments,
        overall_feedback: overallFeedback,
        justification: justificationText,
      });

      setAnchoredRecord(result.blockchain_record);
      setShowVerifyStep(false);
      setIsUnlocked(false);
      setIsGuardrailModalOpen(false);
      if (onEvaluationSubmitted) {
        onEvaluationSubmitted(result);
      }
    } catch (err: any) {
      alert("Final submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-graphite-700/80 bg-graphite-850 p-5 space-y-5 sticky top-20 shadow-xl">

      {/* ── HEADER & LIVE TOTAL ── */}
      <div className="flex items-center justify-between pb-4 border-b border-graphite-800">
        <div>
          <h3 className="text-base font-bold text-white">Live Evaluation</h3>
          <p className="text-xs text-graphite-400 font-mono">Rubric: {rubricVersion}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-xs text-graphite-400 font-mono">/ {maxPossibleScore}</span>
          </div>
          <span className="text-[10px] text-graphite-400 uppercase tracking-wider font-semibold">
            Running Total
          </span>
        </div>
      </div>

      {/* ── AWAITING AI EVALUATION BANNER ── */}
      {isAwaitingAi && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5 shadow-inner"
        >
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Scores Awaiting Live Evaluation</span>
          </div>
          <p className="text-[11px] text-graphite-300 leading-relaxed">
            Click <strong className="text-amber-300">&quot;Run Live AI Evaluation&quot;</strong> on the left to analyze project code AST &amp; artifacts, and auto-populate all 5 rubric criteria.
          </p>
        </motion.div>
      )}

      {/* ── ANCHORED CONFIRMATION CARD ── */}
      {anchoredRecord && !isUnlocked && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Evaluation Successfully Anchored</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-graphite-300 font-mono">
            <div>
              <span className="text-graphite-500">Network:</span>
              <p className="text-white truncate">{anchoredRecord.network}</p>
            </div>
            <div>
              <span className="text-graphite-500">Block:</span>
              <p className="text-white">#{anchoredRecord.block_number}</p>
            </div>
          </div>
          <div>
            <span className="text-graphite-500 text-[10px]">Tx Hash:</span>
            <p className="font-mono text-[10px] text-indigo-400 truncate">{anchoredRecord.tx_hash}</p>
          </div>
          <div className="pt-1 flex items-center justify-between border-t border-emerald-900/40 text-[11px]">
            <span className="text-emerald-400 font-semibold">Status: Verified &amp; Locked</span>
            <a
              href={`/evaluation/${existingEvaluation?.id || teamId}/replay`}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>View Replay</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* ── EDITING-UNLOCKED BANNER ── */}
      {anchoredRecord && isUnlocked && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-xs flex items-center gap-2 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-200">Editing Unlocked.</strong> Adjust scores below and re-lock when ready.
          </span>
        </div>
      )}

      {/* ── VERIFY STEP: Score summary before final lock ── */}
      {showVerifyStep && (
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Verify Scores Before Locking</span>
          </div>
          <p className="text-graphite-300 text-[11px] leading-relaxed">
            Review your score breakdown below. Once confirmed, scores are cryptographically anchored on Polygon blockchain. You can still request a change afterward.
          </p>

          {/* Score Summary Table */}
          <div className="border border-graphite-800 rounded-lg overflow-hidden">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono ${
                  i < categories.length - 1 ? "border-b border-graphite-800/60" : ""
                } bg-graphite-900/60`}
              >
                <span className="text-graphite-300">{cat.name}</span>
                <span className="font-bold text-white">
                  {(scores[cat.name] || 0).toFixed(1)} / {cat.max_score} pts
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5 bg-indigo-950/50 font-mono">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Total Score</span>
              <span className="text-sm font-black text-white">{totalScore.toFixed(1)} / {maxPossibleScore}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="primary"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
              isLoading={isSubmitting}
              onClick={handlePreSubmitCheck}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>Confirm &amp; Lock to Blockchain</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs border-graphite-700 text-graphite-300 hover:text-white"
              onClick={() => setShowVerifyStep(false)}
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* ── CATEGORY SLIDERS ── */}
      <div className="space-y-3.5 max-h-[46vh] overflow-y-auto pr-1 no-scrollbar">
        {categories.map((cat) => {
          const isCommentOpen = expandedComment === cat.name;
          const currentScore = scores[cat.name] || 0;

          return (
            <div key={cat.id || cat.name} className="space-y-1.5">
              <ScoreSlider
                label={cat.name}
                maxScore={cat.max_score}
                value={currentScore}
                criteria={cat.evaluation_criteria}
                disabled={slidersDisabled}
                onChange={(val) => onScoreChange(cat.name, val)}
              />

              {/* Collapsible per-category note */}
              <div className="px-1">
                <button
                  type="button"
                  onClick={() => setExpandedComment(isCommentOpen ? null : cat.name)}
                  className="flex items-center gap-1 text-[11px] text-graphite-400 hover:text-indigo-400 transition-colors"
                >
                  {isCommentOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>
                    {categoryComments[cat.name] ? `Edit ${cat.name} Feedback` : `+ Add note for ${cat.name}`}
                  </span>
                </button>

                {isCommentOpen && (
                  <div className="mt-1.5">
                    <Textarea
                      placeholder={`Observations regarding ${cat.name}...`}
                      value={categoryComments[cat.name] || ""}
                      onChange={(e) => onCommentChange(cat.name, e.target.value)}
                      disabled={slidersDisabled}
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── OVERALL FEEDBACK ── */}
      <div className="space-y-1.5 pt-2 border-t border-graphite-800">
        <Textarea
          label="Overall Judge Feedback"
          placeholder="Comprehensive notes for the team and organizer review..."
          value={overallFeedback}
          onChange={(e) => onOverallFeedbackChange(e.target.value)}
          disabled={slidersDisabled}
          rows={3}
        />
      </div>

      {/* ── ACTION BUTTONS ── */}
      {!isReadOnly && !showVerifyStep && (
        <div className="space-y-2 pt-2 border-t border-graphite-800">
          {!isEffectivelyLocked ? (
            <>
              {isAwaitingAi ? (
                <Button
                  variant="primary"
                  disabled={true}
                  className="w-full bg-graphite-800 text-graphite-400 border border-graphite-700/80 cursor-not-allowed font-medium text-xs py-3"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  <span>Run AI Evaluation to Unlock Scoring</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.01]"
                  onClick={() => setShowVerifyStep(true)}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>Verify &amp; Lock Points</span>
                </Button>
              )}
              <p className="text-[10px] text-graphite-400 text-center font-mono">
                Keccak-256 sealed on Polygon testnet.
              </p>
              <Button
                variant="secondary"
                className="w-full text-xs"
                disabled={isSavingDraft || isSubmitting || isAwaitingAi}
                onClick={handleSaveDraft}
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                <span>Save Draft</span>
              </Button>
            </>
          ) : (
            /* Locked → show "Request Change" button */
            <Button
              variant="outline"
              className="w-full text-xs border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
              onClick={() => setIsUnlocked(true)}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>Request Score Change (Unlock to Edit)</span>
            </Button>
          )}
        </div>
      )}

      {/* Unlocked: Re-lock or cancel buttons */}
      {!isReadOnly && isUnlocked && !showVerifyStep && (
        <div className="space-y-2 pt-2 border-t border-graphite-800">
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/20"
            onClick={() => setShowVerifyStep(true)}
          >
            <Lock className="w-4 h-4 mr-1.5" />
            <span>Verify &amp; Re-lock Updated Scores</span>
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs border-graphite-700 text-graphite-400 hover:text-white"
            onClick={() => setIsUnlocked(false)}
          >
            Cancel Changes
          </Button>
        </div>
      )}

      {/* ── GUARDRAIL MODAL ── */}
      {guardrailData && (
        <GuardrailChallengeModal
          isOpen={isGuardrailModalOpen}
          onClose={() => setIsGuardrailModalOpen(false)}
          reasons={guardrailData.reasons}
          suggestedQuestions={guardrailData.suggested_questions}
          initialJustification={justification}
          isSubmitting={isSubmitting}
          onConfirm={(text) => {
            setJustification(text);
            executeFinalSubmission(text);
          }}
        />
      )}
    </div>
  );
}
