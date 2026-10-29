// Case studies are authored one per file in ./caseStudies/ as *.md (YAML frontmatter + body; see
// ./caseStudyMarkdown.js for the format), with the slug taken from the filename. This module
// parses them, checks the fields every page relies on, and orders them newest first by date.
//
// The detail page reads top to bottom as: title + resultLine, summary, stats,
// context (before), constraints, failedApproaches, approach (intervention),
// shipping, results (after), lessons, limits, whatIdDoDifferently.
//
// Optional fields the detail page renders when present: resultLine, role, timeline,
// stack (string[]), outOfScope (string[]), failedApproaches ({title, description}[]),
// shipping (string[], paragraphs), shippingTitle (its heading), resultsTable (same shape as sections[].table),
// resultsNote, lessons ({claim, detail?}[]), sections[].part (one of SECTION_PARTS,
// default "approach"), sections[].list (string[], numbered), sections[].table.columnGroups.
import { WORDS_PER_MINUTE, countWords, formatDate } from "../utils/text";
import { parseCaseStudyMarkdown } from "./caseStudyMarkdown";

const markdownFiles = import.meta.glob("./caseStudies/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const slugOf = (path) => path.replace(/^.*\/([^/]+)\.md$/, "$1");

const files = Object.entries(markdownFiles).map(([path, raw]) => [slugOf(path), parseCaseStudyMarkdown(raw, slugOf(path))]);

const REQUIRED_FIELDS = ["title", "category", "date", "summary", "before", "intervention", "after", "tags", "images"];

// Where a long-form section sits on the page: after the fixed section of the same name.
export const SECTION_PARTS = ["context", "approach", "results", "limits"];

// The prose a reader works through; image paths and alt text aren't part of the read.
const READABLE_FIELDS = [
  "resultLine",
  "summary",
  "before",
  "constraints",
  "outOfScope",
  "failedApproaches",
  "intervention",
  "decisionsDefended",
  "shipping",
  "after",
  "resultsTable",
  "resultsNote",
  "lessons",
  "sections",
  "whatIdDoDifferently",
];
const UNREAD_KEYS = new Set(["src", "alt", "part"]);

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

// Shape problems in the optional fields, as messages; an empty list means the study is fine.
const findProblems = (study) => {
  const problems = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(study.date)) problems.push(`date "${study.date}" must be YYYY-MM-DD`);
  if (study.pinned !== undefined && typeof study.pinned !== "boolean") problems.push("pinned must be true or false");
  study.stats?.forEach((stat, statIndex) => {
    if (typeof stat.value !== "string") problems.push(`stats[${statIndex}].value must be a string (quote it in YAML)`);
  });
  const tables = [
    study.resultsTable && ["resultsTable", study.resultsTable],
    ...(study.sections ?? []).map((section) => section.table && [`section "${section.heading}"`, section.table]),
  ].filter(Boolean);

  tables.forEach(([where, table]) => {
    table.rows?.forEach((row, rowIndex) => {
      if (row.length !== table.columns?.length) {
        problems.push(`${where} table row ${rowIndex} has ${row.length} cells for ${table.columns?.length} columns`);
      }
    });
  });
  (study.sections ?? []).forEach((section) => {
    if (section.part && !SECTION_PARTS.includes(section.part)) {
      problems.push(`section "${section.heading}" has unknown part "${section.part}"`);
    }
  });
  study.failedApproaches?.forEach((item, itemIndex) => {
    if (!item.title || !item.description) problems.push(`failedApproaches[${itemIndex}] needs a title and description`);
  });
  study.lessons?.forEach((item, itemIndex) => {
    if (!item.claim) problems.push(`lessons[${itemIndex}] needs a claim`);
  });
  return problems;
};

export const caseStudies = files
  .map(([slug, study]) => {
    const missing = REQUIRED_FIELDS.filter((field) => !study[field]);
    if (missing.length) {
      throw new Error(`Case study "${slug}" is missing required field(s): ${missing.join(", ")}`);
    }
    const problems = findProblems(study);
    if (problems.length) {
      throw new Error(`Case study "${slug}" is malformed: ${problems.join("; ")}`);
    }
    const wordCount = countWords(READABLE_FIELDS.map((field) => collectText(study[field])).join(" "));
    return {
      slug,
      ...study,
      publishedAt: study.date,
      date: formatDate(study.date),
      wordCount,
      readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    };
  })
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
