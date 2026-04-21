import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import type {
  AuditLog,
  InsertOrganization,
  InsertUser,
  Organization,
  SiteSettings,
  SuperAdminAnalytics,
  SuperAdminStats,
  User,
} from "@/lib/schema";

export function useSuperAdminStats() {
  return useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: () => apiRequest<SuperAdminStats>("/api/super-admin/stats", { method: "GET" }),
  });
}

export function useSuperAdminAnalytics() {
  return useQuery({
    queryKey: ["super-admin-analytics"],
    queryFn: () => apiRequest<SuperAdminAnalytics>("/api/super-admin/analytics", { method: "GET" }),
  });
}

export function useSuperAdminUsers() {
  return useQuery({
    queryKey: ["super-admin-users"],
    queryFn: () => apiRequest<User[]>("/api/super-admin/users", { method: "GET" }),
  });
}

export function useSuperAdminOrganizations() {
  return useQuery({
    queryKey: ["super-admin-organizations"],
    queryFn: () => apiRequest<Organization[]>("/api/super-admin/organizations", { method: "GET" }),
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["super-admin-settings"],
    queryFn: () => apiRequest<SiteSettings>("/api/super-admin/settings", { method: "GET" }),
  });
}

export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ["super-admin-audit-logs", limit],
    queryFn: () => apiRequest<AuditLog[]>(`/api/super-admin/audit-logs?limit=${limit}`, { method: "GET" }),
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertUser) =>
      apiRequest<User>("/api/super-admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useUpdateManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertUser> }) =>
      apiRequest<User>(`/api/super-admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useDeleteManagedUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/api/super-admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertOrganization) =>
      apiRequest<Organization>("/api/super-admin/organizations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-organizations"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertOrganization> }) =>
      apiRequest<Organization>(`/api/super-admin/organizations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-organizations"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/api/super-admin/organizations/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-organizations"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] }),
      ]);
    },
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteSettings>) =>
      apiRequest<SiteSettings>("/api/super-admin/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["super-admin-settings"] }),
        queryClient.invalidateQueries({ queryKey: ["super-admin-audit-logs"] }),
      ]);
    },
  });
}
