// Everything on the /writing page: case studies and notes (essays and short notes) as one
// list, newest first. Each entry keeps its own URL (/work/… or /notes/…).
import { caseStudies } from "./caseStudies";
import { notes } from "./notes";

export const WRITING_KINDS = [
  { id: "case-study", label: "Case study", plural: "Case studies" },
  { id: "essay", label: "Essay", plural: "Essays" },
  { id: "note", label: "Note", plural: "Notes" },
];

// The case studies shown at the top of /writing: the ones marked `pinned: true`, newest first,
// or the newest few when none are pinned.
const START_HERE_FALLBACK = 3;
const pinnedStudies = caseStudies.filter((study) => study.pinned);
export const startHere = pinnedStudies.length ? pinnedStudies : caseStudies.slice(0, START_HERE_FALLBACK);

export const writing = [
  ...caseStudies.map((study) => ({
    kind: "case-study",
    slug: study.slug,
    href: `/work/${study.slug}`,
    title: study.title,
    summary: study.resultLine || study.summary,
    publishedAt: study.publishedAt,
    date: study.date,
    readingMinutes: study.readingMinutes,
  })),
  ...notes.map((note) => ({
    kind: note.tier,
    slug: note.slug,
    href: `/notes/${note.slug}`,
    title: note.title,
    summary: note.excerpt,
    publishedAt: note.publishedAt,
    date: note.date,
    readingMinutes: note.readingMinutes,
  })),
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
