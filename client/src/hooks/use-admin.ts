import { useQuery } from "@tanstack/react-query";
import { User, Report } from "@shared/schema";

// Mock admin data
const mockMembers: User[] = [
  { id: "1", email: "member@example.com", name: "Jane Doe", password: "", role: "member" },
  { id: "3", email: "john@acme.inc", name: "John Smith", password: "", role: "member" },
  { id: "4", email: "sarah@startup.io", name: "Sarah Jenkins", password: "", role: "member" },
];

export function useAdminMembers() {
  return useQuery({
    queryKey: ["/api/admin/members"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600));
      return mockMembers;
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["/api/admin/reports"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 800));
      // Return cross-user mock reports
      return [
        {
          id: "1", userId: "1", title: "Q3 Financial Summary",
          details: "Analysis...", content: "...", createdAt: new Date()
        },
        {
          id: "3", userId: "3", title: "Acme Expansion Plan",
          details: "Plan...", content: "...", createdAt: new Date(Date.now() - 86400000)
        }
      ] as Report[];
    },
  });
}
