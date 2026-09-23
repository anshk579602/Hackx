"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ParticipantSidebar } from "@/components/layout/ParticipantSidebar";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full">
      <ParticipantSidebar />
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
