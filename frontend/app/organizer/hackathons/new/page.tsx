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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.createHackathon({
        title: title.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
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

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
              Create Hackathon &amp; Configure Rubric
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
