import { getQuizResult } from "@/api/quizAttempts.api";
import { useQuery } from "@tanstack/react-query";

/** Shared by the result and review screens so review opens from cache. */
export const useQuizResult = (attemptId: string | undefined) =>
  useQuery({
    queryKey: ["quiz-result", attemptId],
    queryFn: () => getQuizResult(attemptId!),
    enabled: !!attemptId,
    // A submitted attempt never changes.
    staleTime: Infinity,
  });
