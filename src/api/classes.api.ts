import type { ApiResponse, ClassesData } from "@/types";
import { apiConnector } from "./apiConnector";
import { classEndpoints } from "./apis";

const { CLASSES_API } = classEndpoints;

export const getClasses = async (): Promise<ApiResponse<ClassesData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: CLASSES_API,
  });

  return data;
};

