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

export function useAdminOrganization() {
  return useQuery({
    queryKey: ["admin-organization"],
    queryFn: () => apiRequest<any>("/api/admin/organization", { method: "GET" }),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateAdminOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiRequest<any>("/api/admin/organization", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organization"] });
    },
  });
}

import type { InsertUser } from "@/lib/schema";

export function useCreateAdminMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InsertUser>) =>
      apiRequest<User>("/api/admin/members", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

export function useUpdateAdminMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertUser> }) =>
      apiRequest<User>(`/api/admin/members/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}

export function useDeleteAdminMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/api/admin/members/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
  });
}
