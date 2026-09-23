"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Search, ShieldCheck, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.listAuditLogs();
        setLogs(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Append-Only Audit Log</h1>
          <p className="text-xs text-graphite-400 mt-1">
            Immutable system event ledger recording all submission, judging, and verification actions.
          </p>
        </div>

        <Input
          placeholder="Filter audit actions or actors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 h-9 text-xs"
        />
      </div>

      <Card className="border-graphite-750">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-graphite-800 text-graphite-400 font-mono text-[11px] bg-graphite-900/60">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800/60 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-graphite-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-graphite-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-graphite-200 font-medium">{log.actor_name || "System"}</p>
                      <span className="text-[10px] text-graphite-500 font-mono uppercase">
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-graphite-400 text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="py-3 px-4 text-graphite-400 max-w-xs truncate text-[11px] font-mono">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
