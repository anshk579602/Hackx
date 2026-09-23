"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Settings, ShieldCheck, Check, Database, Cpu } from "lucide-react";

export default function OrganizerSettingsPage() {
  const [network, setNetwork] = useState("Polygon Amoy (Testnet)");
  const [contractAddress, setContractAddress] = useState("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Configure blockchain network, smart contract addresses, and AI verification parameters.
        </p>
      </div>

      <Card className="border-graphite-750">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Blockchain Anchoring Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Active Blockchain Network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              required
            />

            <Input
              label="EvaluationAnchor Smart Contract Address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
            />

            <div className="p-3.5 rounded-xl bg-graphite-900 border border-graphite-800 text-xs text-graphite-300 space-y-1">
              <span className="font-semibold text-white">Smart Contract Features:</span>
              <p className="text-graphite-400">
                Supports <code className="text-indigo-400">anchorEvaluation(bytes32, string)</code> and <code className="text-indigo-400">verifyEvaluation(bytes32)</code>. Events emitted: <code className="text-emerald-400">EvaluationAnchored</code>.
              </p>
            </div>

            <Button type="submit" variant="primary">
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Settings Saved</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
