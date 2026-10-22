import type { ApiErrorBody } from "../types/api.types";

export class ApiError extends Error {
  status: number;
  details?: ApiErrorBody["details"];

  constructor(message: string, status: number, details?: ApiErrorBody["details"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}