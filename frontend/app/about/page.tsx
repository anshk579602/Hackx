"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Cpu, Gavel, Database, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold text-white">About HackX</h1>
        <p className="text-base text-graphite-300 max-w-2xl mx-auto">
          Built to guarantee transparent, evidence-based evaluation for global competitive engineering and innovation hackathons.
        </p>
      </div>

      <div className="space-y-6 text-sm text-graphite-300 leading-relaxed">
        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-850 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>The Hackathon Fairness Crisis</span>
          </h2>
          <p>
            Traditional hackathon judging often relies on subjective 3-minute pitches. Teams make sweeping claims — such as &quot;our system handles 10,000 concurrent requests&quot; or &quot;we built a custom BERT model from scratch&quot; — which judges cannot realistically verify during hurried Q&amp;A sessions.
          </p>
          <p>
            HackX solves this by introducing automated, deterministic evidence analysis without removing human authority.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-850 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            <span>Human-In-The-Loop Autonomous Guardrails</span>
          </h2>
          <p>
            AI assists judges but <strong>never</strong> chooses winners. If a judge gives a near-perfect score on a criterion where the evidence report found no repository benchmark, the Evaluation Agent requests a concise explanation. The judge can confirm their decision with a single sentence (e.g., &quot;Observed live during booth stress test&quot;).
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-graphite-800 bg-graphite-850 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Anchoring on Blockchain</span>
          </h2>
          <p>
            Every finalized evaluation bundle is deterministically canonicalized into UTF-8 JSON, hashed using Ethereum standard Keccak-256, and anchored to the Polygon Amoy blockchain. Organizers, participants, and auditors can verify that database scores were never retroactively altered.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/login">
          <Button size="lg">
            <span>Enter HackX Platform</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
