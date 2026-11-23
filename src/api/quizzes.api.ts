import type { ApiQuiz, ApiResponse, QuizParams, QuizzesData } from "@/types";
import { apiConnector } from "./apiConnector";
import { quizEndpoints } from "./apis";

const { QUIZZES_API, GET_QUIZZES_API } = quizEndpoints;

export const getQuizzes = async (
  params: QuizParams = {},
): Promise<ApiResponse<QuizzesData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: GET_QUIZZES_API,
    params: { ...params },
  });

  return data;
};

export const getQuizById = async (
  id: string,
): Promise<ApiResponse<ApiQuiz>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: `${QUIZZES_API}/${encodeURIComponent(id)}`,
  });

  return data;
};
