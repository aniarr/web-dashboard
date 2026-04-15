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
