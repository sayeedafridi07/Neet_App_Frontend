import type {
  ApiResponse,
  SaveAnswerPayload,
  StartQuizAttemptData,
  QuizAttemptAnswer,
  QuizAttemptSummary,
  QuizResultData,
} from "@/types";
import { apiConnector } from "./apiConnector";
import { quizAttemptEndpoints } from "./apis";

const { START_ATTEMPT_API, SAVE_ANSWER_API, SUBMIT_ATTEMPT_API, RESULT_API } =
  quizAttemptEndpoints;

/** Cache key the instructions screen fills and the attempt screen reads. */
export const quizAttemptQueryKey = (attemptId: string) =>
  ["quiz-attempt", attemptId] as const;

/** Starts a new attempt, or resumes the in-progress one. */
export const startQuizAttempt = async (
  quizId: string,
): Promise<ApiResponse<StartQuizAttemptData>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: START_ATTEMPT_API(quizId),
  });
  return data;
};

export const saveQuizAnswer = async (
  attemptId: string,
  payload: SaveAnswerPayload,
): Promise<ApiResponse<QuizAttemptAnswer>> => {
  const { data } = await apiConnector({
    method: "PATCH",
    url: SAVE_ANSWER_API(attemptId),
    bodyData: payload,
  });
  return data;
};

export const submitQuizAttempt = async (
  attemptId: string,
): Promise<ApiResponse<QuizAttemptSummary>> => {
  const { data } = await apiConnector({
    method: "POST",
    url: SUBMIT_ATTEMPT_API(attemptId),
  });
  return data;
};

/** Scored attempt with every question, the correct option and explanation. */
export const getQuizResult = async (
  attemptId: string,
): Promise<ApiResponse<QuizResultData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: RESULT_API(attemptId),
  });
  return data;
};
