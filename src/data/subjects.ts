import type { ApiSubject, Subject, SubjectKey, SubjectMeta } from "@/types";

// Card visuals per subject slug — everything else comes from the API
export const SUBJECT_META: Record<SubjectKey, SubjectMeta> = {
  biology: {
    tagline: "Botany · Zoology",
    color: "#1D5FBF",
    icon: "Dna",
  },
  chemistry: {
    tagline: "Physical · Organic · Inorganic",
    color: "#C2410C",
    icon: "FlaskConical",
  },
  physics: {
    tagline: "Mechanics · Optics · Modern",
    color: "#5038A0",
    icon: "Atom",
  },
};

// Fallback visuals for subjects the app doesn't know about yet
const DEFAULT_META: SubjectMeta = {
  tagline: "",
  color: "#1D5FBF",
  icon: "Dna",
};

/** Merge an API subject with its local visual metadata (color, icon, tagline). */
export const toSubject = (api: ApiSubject): Subject => ({
  ...(SUBJECT_META[api.slug as SubjectKey] ?? DEFAULT_META),
  id: api.id,
  slug: api.slug as SubjectKey,
  title: api.name,
  counts: api.counts,
});
