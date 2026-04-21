import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import { AuditLog } from "@/lib/schema";

export function useActivity() {
  return useQuery<AuditLog[]>({
    queryKey: ["/api/user/activity"],
    queryFn: () => apiRequest<AuditLog[]>("/api/user/activity"),
  });
}
