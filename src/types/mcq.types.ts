import type { ClassLevel } from "./audio.types";

export type McqSet = {
  id: string;
  /** 1-based set number within the chapter */
  number: number;
  /** 1-based question range covered by this set, e.g. 101–200 */
  from: number;
  to: number;
  total: number;
  // Static placeholder progress
  attempted: number;
  correct: number;
};

export type McqChapter = {
  id: string;
  name: string;
  classLevel: ClassLevel;
  totalQuestions: number;
  sets: McqSet[];
};
