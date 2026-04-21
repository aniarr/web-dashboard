import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import type { InsertReport, Report } from "@/lib/schema";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => apiRequest<Report[]>("/api/reports", { method: "GET" }),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InsertReport) =>
      apiRequest<Report>("/api/reports", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertReport> }) =>
      apiRequest<Report>(`/api/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}

export function usePreviewReport() {
  return useMutation({
    mutationFn: (details: string) =>
      apiRequest<{ content: any }>("/api/reports/preview", {
        method: "POST",
        body: JSON.stringify({ details }),
      }),
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/api/reports/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
