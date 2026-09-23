"use client";

import React, { useState } from "react";
import { RubricCategory, Evaluation, GuardrailCheckResult } from "@/lib/types";
import { ScoreSlider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { GuardrailChallengeModal } from "./GuardrailChallengeModal";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossibleScore = categories.reduce((a, b) => a + b.max_score, 0) || 100;

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
      {/* Header and Live Total Gauge */}
      <div className="flex items-center justify-between pb-4 border-b border-graphite-800">
        <div>
          <h3 className="text-base font-bold text-white">Live Evaluation</h3>
          <p className="text-xs text-graphite-400 font-mono">Rubric: {rubricVersion}</p>
        </div>

        {/* Live Total Score */}
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

      {/* Already Anchored Card */}
      {anchoredRecord && (
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
            <p className="font-mono text-[10px] text-indigo-400 truncate">
              {anchoredRecord.tx_hash}
            </p>
          </div>
          <div className="pt-1 flex items-center justify-between border-t border-emerald-900/40 text-[11px]">
            <span className="text-emerald-400 font-semibold">Status: Verified</span>
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

      {/* Category Sliders */}
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
                disabled={isReadOnly || Boolean(anchoredRecord)}
                onChange={(val) => onScoreChange(cat.name, val)}
              />

              {/* Collapsible Category Comments */}
              <div className="px-1">
                <button
                  type="button"
                  onClick={() => setExpandedComment(isCommentOpen ? null : cat.name)}
                  className="flex items-center gap-1 text-[11px] text-graphite-400 hover:text-indigo-400 transition-colors"
                >
                  {isCommentOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span>
                    {categoryComments[cat.name]
                      ? `Edit ${cat.name} Feedback`
                      : `+ Add note for ${cat.name}`}
                  </span>
                </button>

                {isCommentOpen && (
                  <div className="mt-1.5">
                    <Textarea
                      placeholder={`Observations regarding ${cat.name}...`}
                      value={categoryComments[cat.name] || ""}
                      onChange={(e) => onCommentChange(cat.name, e.target.value)}
                      disabled={isReadOnly || Boolean(anchoredRecord)}
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

      {/* Overall Feedback */}
      <div className="space-y-1.5 pt-2 border-t border-graphite-800">
        <Textarea
          label="Overall Judge Feedback"
          placeholder="Comprehensive notes for the team and organizer review..."
          value={overallFeedback}
          onChange={(e) => onOverallFeedbackChange(e.target.value)}
          disabled={isReadOnly || Boolean(anchoredRecord)}
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      {!anchoredRecord && !isReadOnly && (
        <div className="space-y-2 pt-2 border-t border-graphite-800">
          <Button
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            onClick={handlePreSubmitCheck}
          >
            <Send className="w-4 h-4 mr-1.5" />
            <span>Finalize & Anchor to Blockchain</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full text-xs"
            disabled={isSavingDraft || isSubmitting}
            onClick={handleSaveDraft}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Save Draft</span>
          </Button>
        </div>
      )}

      {/* Guardrail Challenge Modal */}
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
