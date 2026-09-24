// Case studies are authored one per file in ./caseStudies/*.js (default export,
// slug taken from the filename) — this module loads them at build time, checks
// the fields every page relies on, and orders them newest first.
//
// Optional fields the detail page renders when present: role, timeline,
// stack (string[]), keyTakeaways (string[]), sections[].table.columnGroups.
import { WORDS_PER_MINUTE, countWords } from "../utils/text";

const files = import.meta.glob("./caseStudies/*.js", {
  import: "default",
  eager: true,
});

const REQUIRED_FIELDS = ["title", "category", "year", "summary", "before", "intervention", "after", "tags", "images"];

// The prose a reader works through; image paths and alt text aren't part of the read.
const READABLE_FIELDS = [
  "summary",
  "before",
  "intervention",
  "after",
  "constraints",
  "decisionsDefended",
  "keyTakeaways",
  "sections",
  "whatIdDoDifferently",
];
const UNREAD_KEYS = new Set(["src", "alt"]);

const collectText = (value) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !UNREAD_KEYS.has(key))
      .map(([, child]) => collectText(child))
      .join(" ");
  }
  return "";
};

export const caseStudies = Object.entries(files)
  .map(([path, study]) => {
    const slug = path.replace(/^.*\/([^/]+)\.js$/, "$1");
    const missing = REQUIRED_FIELDS.filter((field) => !study[field]);
    if (missing.length) {
      throw new Error(`Case study "${slug}" is missing required field(s): ${missing.join(", ")}`);
    }
    const wordCount = countWords(READABLE_FIELDS.map((field) => collectText(study[field])).join(" "));
    return {
      slug,
      ...study,
      wordCount,
      readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    };
  })
  .sort((a, b) => Number(b.year) - Number(a.year) || a.slug.localeCompare(b.slug));
