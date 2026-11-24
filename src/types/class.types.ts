import type { Pagination } from "./api.types";

// Shape returned by GET /classes
export interface ApiClass {
  id: string;
  name: string;
  isPremium?: boolean;
}

export interface ClassesData {
  classes: ApiClass[];
  pagination: Pagination;
}
