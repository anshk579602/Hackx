"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
        <p className="text-xs text-graphite-400">
          Inquire about deploying HackX for your university, corporate, or web3 hackathon.
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-graphite-800 bg-graphite-850 shadow-xl space-y-6">
        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Message Dispatched!</p>
            <p className="text-xs text-graphite-300">
              Our decentralized engineering team will get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Your Name" placeholder="Alex Rivers" required />
            <Input label="Email Address" type="email" placeholder="alex@hackathon.org" required />
            <Input label="Hackathon / Organization" placeholder="HackX 2026 Championship" required />
            <Textarea label="Message" placeholder="Tell us about your judging requirements, expected teams, and dates..." rows={4} required />
            <Button type="submit" variant="primary" className="w-full">
              Send Inquiry
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
