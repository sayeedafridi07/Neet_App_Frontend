import type { ApiResponse, AuthUser } from "@/types";
import { apiConnector } from "./apiConnector";
import { userEndpoints } from "./apis";

const { ME_API } = userEndpoints;

// Current user (includes premium status)
export const getMe = async (): Promise<ApiResponse<AuthUser>> => {
  const { data } = await apiConnector({ method: "GET", url: ME_API });
  return data;
};
