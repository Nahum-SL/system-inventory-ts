import { api } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type {
  DashboardSummary,
  DistributionFilters,
  DistributionSummary,
} from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> =>
  (await api.get<ApiResponse<DashboardSummary>>("/reports/summary")).data;

export const getDistribution = async (
  filters: DistributionFilters = {},
): Promise<DistributionSummary> => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "")
      params.set(key, String(value));
  }
 
  const qs = params.toString();

  return (
    await api.get<ApiResponse<DistributionSummary>>(
      `/reports/distribution${qs ? `?${qs}` : ""}`,
    )
  ).data;
};
