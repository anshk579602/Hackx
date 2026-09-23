"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Building, ShieldCheck, Check } from "lucide-react";

export default function ParticipantProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [organization, setOrganization] = useState(user?.organization || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hacker Profile</h1>
        <p className="text-xs text-graphite-400 mt-1">
          Manage your participant credentials and university/organization affiliation.
        </p>
      </div>

      <Card className="border-graphite-750">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <CardTitle className="text-xl">{user?.full_name}</CardTitle>
            <p className="text-xs text-graphite-400 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-2">
              <Badge variant="success">Verified Participant</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              className="opacity-70 cursor-not-allowed"
            />

            <Input
              label="College / Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" variant="emerald">
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
