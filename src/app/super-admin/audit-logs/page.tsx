"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/hooks/use-auth";
import { useAuditLogs } from "@/hooks/use-super-admin";

export default function SuperAdminAuditLogsPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: authLoading } = useRequireAuth(false, true);
  const { data: logs, isLoading } = useAuditLogs(200);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLogs = useMemo(() => {
    return (logs ?? []).filter((log) => {
      const haystack = `${log.message} ${log.action} ${log.entityType} ${log.actorEmail ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [logs, search]);

  if (!mounted || authLoading || !user) {
    return (
      <DashboardLayout mode="super_admin">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout mode="super_admin">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">Review platform history and administrative activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search logs..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const isDelete = log.action.toLowerCase().includes("delete");
                const isCreate = log.action.toLowerCase().includes("create");
                const isUpdate = log.action.toLowerCase().includes("update");
                const isAuth = log.entityType === "auth";

                return (
                  <div
                    key={log.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors hover:bg-muted/50",
                      isDelete && "border-red-100 bg-red-50/30",
                      isCreate && "border-green-100 bg-green-50/30",
                      isUpdate && "border-blue-100 bg-blue-50/30",
                      isAuth && "border-purple-100 bg-purple-50/30"
                    )}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium break-words">{log.message}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded bg-background px-1.5 py-0.5 border shadow-sm">{log.action}</span>
                          <span className="rounded bg-background px-1.5 py-0.5 border shadow-sm">{log.entityType}</span>
                          <span className="rounded bg-background px-1.5 py-0.5 border shadow-sm truncate max-w-[200px]">
                            {log.actorEmail ?? "system"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
