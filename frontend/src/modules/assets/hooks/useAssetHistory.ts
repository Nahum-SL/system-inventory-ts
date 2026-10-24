import { useQuery } from "@tanstack/react-query";
import {
  getAssignmentHistory,
  getMaintenanceHistory,
  getMovementHistory,
} from "../api/assets.api";

import { assetKeys } from "../utils/asset-query-keys";

export const useAssignmentHistory = (id: number) =>
  useQuery({
    queryKey: assetKeys.history("assignments", id),
    queryFn: () => getAssignmentHistory(id),
  });

export const useMaintenanceHistory = (id: number) =>
  useQuery({
    queryKey: assetKeys.history("maintenance", id),
    queryFn: () => getMaintenanceHistory(id),
  });

export const useMovementHistory = (id: number) =>
  useQuery({
    queryKey: assetKeys.history("movements", id),
    queryFn: () => getMovementHistory(id),
  });
