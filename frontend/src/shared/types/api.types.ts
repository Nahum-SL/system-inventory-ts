// Manejar estados de la conexion de una api
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error: string;
}
export interface ApiResponse<T> {
  status: "success";
  data: T;
  message?: string;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  results: number;
}

export interface ApiErrorBody {
  status: "error";
  message: string;
  details?: { field: string; message: string }[];
}