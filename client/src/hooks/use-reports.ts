import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Report, InsertReport } from "@shared/schema";

// MOCKED DATA for UI demonstration
let mockReports: Report[] = [
  {
    id: "1",
    userId: "1",
    title: "Q3 Financial Summary",
    details: "Analysis of Q3 revenue streams and expenditures.",
    content: "The third quarter showed a 15% increase in MRR...",
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: "2",
    userId: "1",
    title: "Competitor Analysis",
    details: "Market positioning vs top 3 competitors.",
    content: "Competitor A has recently launched a new feature...",
    createdAt: new Date(Date.now() - 86400000 * 5)
  }
];

export function useReports() {
  return useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));
      return [...mockReports].sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertReport) => {
      // Simulate AI generation delay
      await new Promise(r => setTimeout(r, 2500));

      const newReport: Report = {
        id: Date.now().toString(),
        userId: data.userId,
        title: data.title,
        details: data.details,
        content: `Generated comprehensive report based on: "${data.details}".\n\nThis entails a detailed breakdown of the strategic objectives, key performance indicators, and actionable insights derived from the provided context. The automated analysis highlights significant opportunities for growth and potential risk factors to mitigate.`,
        createdAt: new Date()
      };

      mockReports.push(newReport);
      return newReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
    },
  });
}
