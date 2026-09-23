"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl border border-graphite-750 bg-graphite-850 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
          <p className="text-xs text-graphite-400">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <MailCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-emerald-300">
              Recovery link dispatched to <strong>{email}</strong>. For local demo purposes, you can reset immediately:
            </p>
            <Link href="/reset-password">
              <Button size="sm" variant="primary" className="mt-2">
                Continue to Password Reset
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full">
              Send Password Reset Link
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-graphite-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
