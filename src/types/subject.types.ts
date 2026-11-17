export type SubjectKey = "biology" | "chemistry" | "physics";

export interface SubjectCounts {
  audioLectures: number;
  keywordRevisions: number;
  quizzes: number;
}

/** Local-only visuals for a subject (not returned by the API) */
export type SubjectMeta = {
  tagline: string;
  color: string; // card background
  icon: "Dna" | "FlaskConical" | "Atom";
};

/** API subject merged with its local visuals — what the UI renders */
export type Subject = SubjectMeta & {
  id: string;
  slug: SubjectKey;
  title: string;
  counts: SubjectCounts;
};

export interface ApiSubject {
  id: string;
  name: string;
  slug: string;
  counts: SubjectCounts;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsData {
  subjects: ApiSubject[];
}
