"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Team, Submission, Hackathon } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { AnalysisTimeline } from "@/components/submission/AnalysisTimeline";
import { HackathonBannerCarousel } from "@/components/participant/HackathonBannerCarousel";
import { TeamRegisterModal } from "@/components/participant/TeamRegisterModal";
import {
  Trophy,
  Users,
  FolderGit2,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Rocket,
} from "lucide-react";

export default function ParticipantDashboard() {
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedHackathonForModal, setSelectedHackathonForModal] =
    useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [myTeam, hacks, parts] = await Promise.all([
        api.getMyTeam(),
        api.listHackathons(),
        api.getMyParticipations().catch(() => []),
      ]);

      setTeam(myTeam);
      setHackathons(hacks || []);
      setParticipations(parts || []);

      if (myTeam) {
        const mySubmission = await api.getMySubmission();
        setSubmission(mySubmission);
      } else {
        setSubmission(null);
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleOpenRegister = (hackathonId?: string) => {
    if (hackathonId) {
      setSelectedHackathonForModal(hackathonId);
    } else if (hackathons.length > 0) {
      setSelectedHackathonForModal(hackathons[0].id);
    } else {
      setSelectedHackathonForModal("");
    }

    setIsRegisterModalOpen(true);
  };

  const handleTeamCreated = (_newTeam: Team) => {
    setIsRegisterModalOpen(false);
    void loadData();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    );