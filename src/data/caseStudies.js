// Case studies are authored one per file in ./caseStudies/, either as *.js (default export) or
// as *.md (frontmatter + body, see ./caseStudyMarkdown.js for the format), with the slug taken
// from the filename — this module loads them at build time, checks the fields every page relies
// on, and orders them newest first.
//
// The detail page reads top to bottom as: title + resultLine, summary, stats,
// context (before), constraints, failedApproaches, approach (intervention),
// shipping, results (after), lessons, limits, whatIdDoDifferently.
//
// Optional fields the detail page renders when present: resultLine, role, timeline,
// stack (string[]), outOfScope (string[]), failedApproaches ({title, description}[]),
// shipping (string[], paragraphs), resultsTable (same shape as sections[].table),
// resultsNote, lessons ({claim, detail?}[]), sections[].part (one of SECTION_PARTS,
// default "approach"), sections[].list (string[], numbered), sections[].table.columnGroups.
import { WORDS_PER_MINUTE, countWords } from "../utils/text";
import { parseCaseStudyMarkdown } from "./caseStudyMarkdown";

const scriptFiles = import.meta.glob("./caseStudies/*.js", {
  import: "default",
  eager: true,
});
const markdownFiles = import.meta.glob("./caseStudies/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const slugOf = (path) => path.replace(/^.*\/([^/]+)\.(js|md)$/, "$1");

const files = [
  ...Object.entries(scriptFiles).map(([path, study]) => [slugOf(path), study]),
  ...Object.entries(markdownFiles).map(([path, raw]) => [slugOf(path), parseCaseStudyMarkdown(raw, slugOf(path))]),
];

const REQUIRED_FIELDS = ["title", "category", "year", "summary", "before", "intervention", "after", "tags", "images"];

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

const duplicate = files.find(([slug], index) => files.findIndex(([other]) => other === slug) !== index);
if (duplicate) throw new Error(`Case study "${duplicate[0]}" exists as both .js and .md; keep one`);

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
      wordCount,
      readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
    };
  })
  .sort((a, b) => Number(b.year) - Number(a.year) || a.slug.localeCompare(b.slug));
