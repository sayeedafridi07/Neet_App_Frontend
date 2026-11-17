import type { ClassLevel, McqChapter, McqSet } from "@/types";

// TODO: replace with the MCQ API once available

export const SET_SIZE = 100;

type ChapterSeed = {
  name: string;
  totalQuestions: number;
  /** [attempted, correct] per set; missing sets are untouched */
  progress: [number, number][];
};

const SEED: Record<ClassLevel, ChapterSeed[]> = {
  11: [
    {
      name: "The Living World",
      totalQuestions: 300,
      progress: [
        [100, 82],
        [45, 31],
      ],
    },
    {
      name: "Cell: The Unit of Life",
      totalQuestions: 400,
      progress: [[20, 14]],
    },
    { name: "Biomolecules", totalQuestions: 250, progress: [] },
  ],
  12: [
    {
      name: "Molecular Basis of Inheritance",
      totalQuestions: 350,
      progress: [[100, 71]],
    },
    { name: "Human Health and Disease", totalQuestions: 200, progress: [] },
  ],
};

const buildChapter = (
  classLevel: ClassLevel,
  seed: ChapterSeed,
  index: number,
): McqChapter => {
  const id = `c${classLevel}-${index + 1}`;
  const setCount = Math.ceil(seed.totalQuestions / SET_SIZE);
  return {
    id,
    name: seed.name,
    classLevel,
    totalQuestions: seed.totalQuestions,
    sets: Array.from({ length: setCount }, (_, i) => {
      const from = i * SET_SIZE + 1;
      const to = Math.min((i + 1) * SET_SIZE, seed.totalQuestions);
      const [attempted, correct] = seed.progress[i] ?? [0, 0];
      return {
        id: `${id}-s${i + 1}`,
        number: i + 1,
        from,
        to,
        total: to - from + 1,
        attempted,
        correct,
      };
    }),
  };
};

export const getMcqChapters = (classLevel: ClassLevel): McqChapter[] =>
  SEED[classLevel].map((seed, i) => buildChapter(classLevel, seed, i));
