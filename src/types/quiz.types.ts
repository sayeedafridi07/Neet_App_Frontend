import type { Pagination } from "./api.types";

export type QuizType = "CHAPTER" | "SUBJECT" | "FULL" | (string & {});

export interface QuizChapterRef {
  id: string;
  name: string;
  slug: string;
}

// Shape returned by GET /quizzes and GET /quizzes/:id
export interface ApiQuiz {
  id: string;
  title: string;
  description: string | null;
  type: QuizType;
  chapterId: string | null;
  chapter?: QuizChapterRef | null;
  questionCount: number;
  durationMinutes: number | null;
  correctMarks: number;
  wrongMarks: number;
  skippedMarks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizzesData {
  quizzes: ApiQuiz[];
  pagination: Pagination;
}

export interface QuizParams {
  page?: number;
  limit?: number;
  subjectId?: string;
  classId?: string;
}
