"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Trophy } from "lucide-react";

export default function NewHackathonPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (minTeamSize > maxTeamSize) {
      setError("Minimum team size cannot be greater than maximum team size.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.createHackathon({
        title: title.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        min_team_size: Number(minTeamSize) || 1,
        max_team_size: Number(maxTeamSize) || 4,
      });
      router.push("/organizer/hackathons");
    } catch (err: any) {
      setError(err.message || "Failed to create hackathon. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/organizer/hackathons"
          className="p-1.5 rounded-lg border border-graphite-750 bg-graphite-850 hover:bg-graphite-800 text-graphite-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Hackathon</h1>
          <p className="text-xs text-graphite-400">Initialize a competitive challenge with verifiable scoring.</p>
        </div>
      </div>

      <Card className="border-graphite-750">
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Hackathon Title *"
              placeholder="e.g. NextGen AI Challenge 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Tagline"
              placeholder="e.g. Building Sovereign & Verifiable Machine Intelligence"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />

            <Textarea
              label="Description"
              placeholder="Describe the challenge scope, themes, and participant eligibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-graphite-900 border border-graphite-750">
              <div>
                <label className="text-xs font-medium text-graphite-300 block mb-1.5">
                  Minimum Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-950 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-graphite-500 mt-1">e.g. 1 for solo allowed, 2 for min pair</p>
              </div>

              <div>
                <label className="text-xs font-medium text-graphite-300 block mb-1.5">
                  Maximum Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 rounded-lg border border-graphite-700 bg-graphite-950 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-graphite-500 mt-1">Configurable limit: e.g. 2, 4, 6, etc.</p>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
              Create Hackathon &amp; Configure Rubric
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
