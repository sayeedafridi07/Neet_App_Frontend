// Mirrors neet-backend src/modules/quiz/quiz-attempt.service.ts

export const QUIZ_ANSWER_STATUS = {
  NOT_ANSWERED: "NOT_ANSWERED",
  ANSWERED: "ANSWERED",
  MARKED: "MARKED",
  MARKED_AND_ANSWERED: "MARKED_AND_ANSWERED",
} as const;

export type QuizAnswerStatus =
  (typeof QUIZ_ANSWER_STATUS)[keyof typeof QUIZ_ANSWER_STATUS];

/** Server statuses plus the client-only "never opened" state for the palette. */
export type QuizPaletteStatus = QuizAnswerStatus | "NOT_VISITED";

export type QuizAttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED"
  | "EXPIRED";

export interface QuizPlayOption {
  id: string;
  text: string;
  imageUrl: string | null;
  order: number;
}

export interface QuizPlayQuestion {
  id: string;
  question: string;
  imageUrl: string | null;
  options: QuizPlayOption[];
}

export interface QuizAttemptAnswer {
  questionId: string;
  questionOrder: number;
  selectedOptionId: string | null;
  status: QuizAnswerStatus;
}

export interface QuizAttempt {
  id: string;
  status: QuizAttemptStatus;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
}

export interface QuizAttemptQuizInfo {
  id: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  markingScheme: { correct: number; wrong: number; skipped: number };
}

/** POST /quizzes/:quizId/start (starts or resumes) */
export interface StartQuizAttemptData {
  resumed: boolean;
  attempt: QuizAttempt;
  quiz: QuizAttemptQuizInfo;
  /** already in this attempt's (shuffled) order */
  questions: QuizPlayQuestion[];
  answers: QuizAttemptAnswer[];
}

/** PATCH /quizzes/attempts/:attemptId/answers — status is derived server-side */
export interface SaveAnswerPayload {
  questionId: string;
  /** null clears the selection */
  selectedOptionId: string | null;
  markedForReview: boolean;
}

/** POST /quizzes/attempts/:attemptId/submit */
export interface QuizAttemptSummary {
  attemptId: string;
  status: QuizAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  score: number | null;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  quiz: QuizAttemptQuizInfo;
}

export type QuizQuestionResult = "CORRECT" | "WRONG" | "SKIPPED";

export interface QuizResultOption extends QuizPlayOption {
  isCorrect: boolean;
  isSelected: boolean;
}

export interface QuizResultQuestion {
  id: string;
  questionOrder: number;
  question: string;
  imageUrl: string | null;
  explanation: string | null;
  explanationImageUrl: string | null;
  options: QuizResultOption[];
  selectedOptionId: string | null;
  correctOptionId: string | null;
  answerStatus: QuizAnswerStatus;
  result: QuizQuestionResult;
  marks: number;
}

/** GET /quizzes/attempts/:attemptId/result */
export interface QuizResultData {
  result: QuizAttemptSummary;
  questions: QuizResultQuestion[];
}
