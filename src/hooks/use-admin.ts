import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import type { Report, User } from "@/lib/schema";

export function useAdminMembers() {
  return useQuery({
    queryKey: ["admin-members"],
    queryFn: () => apiRequest<User[]>("/api/admin/members", { method: "GET" }),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => apiRequest<Report[]>("/api/admin/reports", { method: "GET" }),
  });
}
