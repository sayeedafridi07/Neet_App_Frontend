import type { ApiResponse, ApiSubject, SubjectsData } from "@/types";
import { apiConnector } from "./apiConnector";
import { subjectEndpoints } from "./apis";

const { SUBJECTS_API } = subjectEndpoints;

export const getSubjects = async (): Promise<ApiResponse<SubjectsData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: SUBJECTS_API,
  });

  return data;
};

export const getSubjectById = async (
  id: string,
): Promise<ApiResponse<ApiSubject>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: `${SUBJECTS_API}/${encodeURIComponent(id)}`,
  });

  return data;
};
