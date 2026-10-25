import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/reports.api";

export const reportKeys = { summary: ["reports", "summary"] as const };

export function useDashboardSummary() {
  return useQuery({
    queryKey: reportKeys.summary,
    queryFn: getDashboardSummary,
    staleTime: 0,
  });
}
