import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-graphite-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-glow-indigo">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-2 font-semibold">
        Error 404 — Page Not Found
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight max-w-md mb-3">
        Cryptographic Trail Lost in Transit
      </h1>

      <p className="text-sm text-graphite-400 max-w-md mb-8 leading-relaxed">
        The requested record, page, or evaluation could not be resolved on this node.
        Check the URL or return to the main dashboard.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="default" className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
        <Link href="/judge/dashboard">
          <Button variant="outline" className="gap-2 border-graphite-750">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
