import type { AudioLecture, ClassLevel } from "@/types";

// TODO: remove once the keyword-revisions API returns chapter info
const DUMMY_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

type DummyChapter = { name: string; keywords: [string, number][] };

const CHAPTERS: Record<ClassLevel, DummyChapter[]> = {
  11: [
    {
      name: "The Living World",
      keywords: [
        ["Taxonomy & Systematics", 240],
        ["Binomial Nomenclature", 180],
        ["Taxonomic Hierarchy", 300],
      ],
    },
    {
      name: "Cell: The Unit of Life",
      keywords: [
        ["Prokaryotic vs Eukaryotic Cells", 320],
        ["Cell Membrane & Fluid Mosaic Model", 270],
        ["Endomembrane System", 350],
        ["Mitochondria & Plastids", 290],
      ],
    },
    {
      name: "Biomolecules",
      keywords: [
        ["Amino Acids & Proteins", 260],
        ["Enzymes & Co-factors", 330],
      ],
    },
  ],
  12: [
    {
      name: "Molecular Basis of Inheritance",
      keywords: [
        ["DNA Replication", 340],
        ["Transcription & Translation", 380],
        ["Lac Operon", 250],
      ],
    },
    {
      name: "Human Health and Disease",
      keywords: [
        ["Pathogens & Common Diseases", 300],
        ["Immunity: Innate vs Acquired", 280],
      ],
    },
  ],
};

const now = new Date().toISOString();

export const getDummyKeywordRevisions = (
  classLevel: ClassLevel,
): AudioLecture[] =>
  CHAPTERS[classLevel].flatMap((chapter, ci) => {
    const chapterId = `c${classLevel}-${ci + 1}`;
    return chapter.keywords.map(([title, duration], ki) => ({
      id: `${chapterId}-k${ki + 1}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: chapter.name,
      duration,
      order: ki + 1,
      chapterId,
      chapter: { id: chapterId, name: chapter.name, order: ci + 1 },
      isActive: true,
      audioUrl: DUMMY_AUDIO_URL,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
    }));
  });
