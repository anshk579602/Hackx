"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserRole } from "@/lib/types";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  Trophy,
  Users,
  Gavel,
  Building2,
  Mail,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<UserRole>("PARTICIPANT");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get("role")?.toUpperCase();
      if (queryRole === "ORGANIZER" || queryRole === "PARTICIPANT" || queryRole === "JUDGE") {
        setRole(queryRole as UserRole);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreeTerms) {
      setError("You must accept the terms of participation.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        organization,
        role,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-graphite-950">
      <div className="w-full max-w-xl p-8 rounded-3xl border border-graphite-800 bg-graphite-900/95 shadow-2xl backdrop-blur-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your HackJudge Account
          </h2>
          <p className="text-xs text-graphite-400 max-w-sm mx-auto">
            Transparent, evidence-based evaluation powered by AI & blockchain.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector - 3 Clear, Executive Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2",
                  role === "ORGANIZER"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-graphite-950/60 border-graphite-800 text-graphite-400 hover:text-white hover:border-graphite-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <Trophy className={cn("w-5 h-5", role === "ORGANIZER" ? "text-indigo-400" : "text-graphite-500")} />
                  {role === "ORGANIZER" && <Badge variant="indigo" className="text-[10px]">Selected</Badge>}
                </div>
                <div>
                  <div className="text-xs font-bold">Organiser</div>
                  <div className="text-[10px] text-graphite-400 leading-tight">Create & host hackathons</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("PARTICIPANT")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2",
                  role === "PARTICIPANT"
                    ? "bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-graphite-950/60 border-graphite-800 text-graphite-400 hover:text-white hover:border-graphite-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <Users className={cn("w-5 h-5", role === "PARTICIPANT" ? "text-emerald-400" : "text-graphite-500")} />
                  {role === "PARTICIPANT" && <Badge variant="success" className="text-[10px]">Selected</Badge>}
                </div>
                <div>
                  <div className="text-xs font-bold">Participant</div>
                  <div className="text-[10px] text-graphite-400 leading-tight">Join team & submit project</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("JUDGE")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2",
                  role === "JUDGE"
                    ? "bg-amber-600/20 border-amber-500 text-white shadow-md shadow-amber-600/20"
                    : "bg-graphite-950/60 border-graphite-800 text-graphite-400 hover:text-white hover:border-graphite-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <Gavel className={cn("w-5 h-5", role === "JUDGE" ? "text-amber-400" : "text-graphite-500")} />
                  {role === "JUDGE" && <Badge variant="warning" className="text-[10px]">Selected</Badge>}
                </div>
                <div>
                  <div className="text-xs font-bold">Judge</div>
                  <div className="text-[10px] text-graphite-400 leading-tight">Score & verify evidence</div>
                </div>
              </button>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3">
            <Input
              label="Full Name"
              placeholder="e.g. Elena Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Input
              label="College / Organization (Optional)"
              placeholder="e.g. Stanford University / Tech Corp / Independent"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-graphite-700 bg-graphite-800 text-indigo-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-graphite-400 cursor-pointer">
              I agree to the Hackathon Integrity Guidelines and Blockchain Audit Terms.
            </label>
          </div>

          <Button
            type="submit"
            variant={role === "PARTICIPANT" ? "emerald" : "primary"}
            className="w-full py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/25"
            isLoading={isLoading}
          >
            <span>Complete Registration as {role === "ORGANIZER" ? "Organiser" : role === "PARTICIPANT" ? "Participant" : "Judge"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="text-center text-xs text-graphite-400 pt-2 border-t border-graphite-800">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
