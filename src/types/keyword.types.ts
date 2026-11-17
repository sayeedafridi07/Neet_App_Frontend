import type { AudioLecture } from "./audio.types";

// Keyword revisions share the audio lecture shape (audioUrl, duration, etc.)
export type KeywordRevision = AudioLecture;

/** A chapter with its keyword revisions, as returned by GET /keyword-revisions */
export interface KeywordChapter {
  id: string;
  name: string;
  slug: string;
  order: number;
  keywordRevisions: KeywordRevision[];
}

export type KeywordRevisionsData = KeywordChapter[];
