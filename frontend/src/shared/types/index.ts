export interface ListResponse<T> {
  status: "success";
  results: number;
  data: T[];
}

export interface ItemResponse<T> {
  status: "success";
  data: T;
}
