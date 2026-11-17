import type { Pagination } from "./api.types";

export type ClassLevel = 11 | 12;

// Shape returned by GET /audio-lectures
export type AudioLecture = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  order: number;
  chapterId: string;
  // Populated when the API includes the chapter relation
  chapter?: { id: string; name?: string; title?: string; order?: number };
  isActive: boolean;
  audioUrl: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface AudioLecturesData {
  audioLectures: AudioLecture[];
  pagination: Pagination;
}

export interface AudioLectureParams {
  page?: number;
  limit?: number;
  search?: string;
  chapterId?: string;
  subjectId?: string;
  classId?: string;
}
