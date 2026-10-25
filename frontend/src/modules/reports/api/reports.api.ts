import { api } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types/api.types";
import type { DashboardSummary } from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> =>
  (await api.get<ApiResponse<DashboardSummary>>("/reports/summary")).data;

