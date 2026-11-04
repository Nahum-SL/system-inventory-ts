import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDistribution } from "../api/reports.api";
import type { DistributionFilters } from "../types";

export const useDistribution = (filters: DistributionFilters) =>
  useQuery({
    queryKey: ["reports", "distribution", filters],
    queryFn: () => getDistribution(filters),
    placeholderData: keepPreviousData, // al cambiar el filtro, el gráfico no parpadea
  });
