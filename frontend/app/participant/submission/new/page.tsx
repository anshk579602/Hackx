"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Team } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  HelpCircle
} from "lucide-react";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [projectTitle, setProjectTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [pptUrl, setPptUrl] = useState("");
  const [architectureUrl, setArchitectureUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [techStackInput, setTechStackInput] = useState("Next.js 15, FastAPI, PostgreSQL, PyTorch");
  const [claims, setClaims] = useState<string[]>([
    "Our system supports 10,000 concurrent users without latency degradation.",
    "Our model reduces student waiting time by 40% in campus dining facilities.",
    "Our solution works seamlessly in both Hindi and English with full localization.",
  ]);
  const [newClaimText, setNewClaimText] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const myTeam = await api.getMyTeam();
        if (!myTeam) {
          router.push("/participant/team");
          return;
        }
        setTeam(myTeam);

        // Check if draft in localStorage
        const savedDraft = localStorage.getItem(`draft_submission_${myTeam.id}`);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setProjectTitle(parsed.projectTitle || "");
            setProblemStatement(parsed.problemStatement || "");
            setProjectDescription(parsed.projectDescription || "");
            setGithubUrl(parsed.githubUrl || "");
            setLiveDemoUrl(parsed.liveDemoUrl || "");
            setPptUrl(parsed.pptUrl || "");
            setArchitectureUrl(parsed.architectureUrl || "");
            setDemoVideoUrl(parsed.demoVideoUrl || "");
            if (parsed.claims?.length) setClaims(parsed.claims);
          } catch (e) {
            console.error("Failed to restore draft:", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [router]);

  const handleSaveDraftLocally = () => {
    if (!team) return;
    const draftPayload = {
      projectTitle,
      problemStatement,
      projectDescription,
      githubUrl,
      liveDemoUrl,
      pptUrl,
      architectureUrl,
      demoVideoUrl,
      claims,
    };
    localStorage.setItem(`draft_submission_${team.id}`, JSON.stringify(draftPayload));
    alert("Draft saved to browser storage.");
  };

  const handleAddClaim = () => {
    if (!newClaimText.trim()) return;
    setClaims([...claims, newClaimText.trim()]);
    setNewClaimText("");
  };

  const handleRemoveClaim = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    if (claims.length === 0) {
      setError("Please add at least one verifiable project claim.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const techStackList = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const submission = await api.createSubmission({
        team_id: team.id,
        project_title: projectTitle,
        problem_statement: problemStatement,
        project_description: projectDescription,
        github_url: githubUrl,
        live_demo_url: liveDemoUrl,
        ppt_url: pptUrl,
        architecture_url: architectureUrl,
        demo_video_url: demoVideoUrl,
        tech_stack: techStackList,
        raw_claims: claims,
      });

      // Clear draft
      localStorage.removeItem(`draft_submission_${team.id}`);
      router.push(`/participant/submission/${submission.id}`);
    } catch (err: any) {
      setError(err.message || "Submission failed.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Submit Project: {team?.name}
        </h1>
        <p className="text-xs text-graphite-400 mt-1">
          Provide complete technical details and factual claims for AI evidence analysis and human judge review.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Project Info */}
        <Card className="border-graphite-750 space-y-4">
          <CardHeader>
            <CardTitle className="text-base">1. Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Project Title *"
              placeholder="e.g. Smart Campus Assistant"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />

            <Textarea
              label="Problem Statement *"
              placeholder="Clearly define the specific pain point your hackathon project addresses..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={3}
              required
            />

            <Textarea
              label="Project Description & Solution Architecture *"
              placeholder="Describe your solution, workflow, and core technical components..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              required
            />

            <Input
              label="Technical Stack (Comma-separated) *"
              placeholder="Next.js 15, FastAPI, PyTorch, PostgreSQL"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Links & Uploads */}
        <Card className="border-graphite-750 space-y-4">
          <CardHeader>
            <CardTitle className="text-base">2. Repository, Demo &amp; Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GitHub Repository URL *"
                placeholder="https://github.com/team/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
              <Input
                label="Live Demo URL"
                placeholder="https://demo.verijudge.ai"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pitch Deck / PPT / PDF URL"
                placeholder="https://verijudge.ai/uploads/deck.pdf"
                value={pptUrl}
                onChange={(e) => setPptUrl(e.target.value)}
              />
              <Input
                label="Architecture Diagram URL"
                placeholder="https://verijudge.ai/uploads/architecture.png"
                value={architectureUrl}
                onChange={(e) => setArchitectureUrl(e.target.value)}
              />
            </div>

            <Input
              label="Demo Video Link (YouTube / Loom / Vimeo)"
              placeholder="https://youtu.be/..."
              value={demoVideoUrl}
              onChange={(e) => setDemoVideoUrl(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Project Claims Manager */}
        <Card className="border-graphite-750 space-y-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>3. Verifiable Project Claims</span>
              </CardTitle>
              <Badge variant="indigo">{claims.length} Claims Listed</Badge>
            </div>
            <p className="text-xs text-graphite-400">
              The AI Evidence Agent will extract and cross-reference each claim against your repository code, logs, and diagrams.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Claims list */}
            <div className="space-y-2">
              {claims.map((claim, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-graphite-900 border border-graphite-800 text-xs text-graphite-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-indigo-400 font-bold">#{idx + 1}</span>
                    <span>{claim}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveClaim(idx)}
                    className="p-1 rounded text-graphite-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new claim input */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="e.g. Our system supports 10,000 concurrent users with <100ms response time..."
                value={newClaimText}
                onChange={(e) => setNewClaimText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddClaim();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddClaim} className="shrink-0">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Claim</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-graphite-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSaveDraftLocally}
            className="text-graphite-400 hover:text-white"
          >
            Save Draft Locally
          </Button>

          <Button
            type="submit"
            variant="emerald"
            size="lg"
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            <span>Submit for AI Analysis</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
