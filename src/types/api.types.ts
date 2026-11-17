export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string;
  success: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
