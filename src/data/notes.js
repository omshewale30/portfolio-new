// tier: "essay" (long-form, .prose-essay styling) | "note" (short, compact/dated)
// Notes are authored as markdown files with frontmatter in ./notes/*.md — this
// module loads them at build time and shapes them into what the note pages expect.
import { load as loadYaml } from "js-yaml";

const files = import.meta.glob("./notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const WORDS_PER_MINUTE = 220;

const parseNote = (raw) => {
  const match = raw.match(FRONTMATTER);
  if (!match) return { data: {}, body: raw.trim() };
  const [, frontmatter, body] = match;
  return { data: loadYaml(frontmatter) ?? {}, body: body.trim() };
};

const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const normalizeDate = (date) =>
  date instanceof Date ? date.toISOString().slice(0, 10) : String(date);

const headingText = (markdown) =>
  markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();

const slugifyHeading = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const extractHeadings = (body) => {
  const occurrences = new Map();
  let insideFence = false;

  return body.split("\n").flatMap((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      return [];
    }
    if (insideFence) return [];

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!match) return [];

    const text = headingText(match[2]);
    const baseId = slugifyHeading(text);
    const occurrence = occurrences.get(baseId) ?? 0;
    occurrences.set(baseId, occurrence + 1);

    return [{
      level: match[1].length,
      text,
      id: occurrence ? `${baseId}-${occurrence}` : baseId,
      line: index + 1,
    }];
  });
};

const countWords = (body) =>
  body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#>*_~()-]/g, " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const REQUIRED_FIELDS = ["tier", "title", "date"];

export const notes = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.replace(/^.*\/([^/]+)\.md$/, "$1");
    const { data, body } = parseNote(raw);
    const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
    if (missing.length) {
      throw new Error(`Note "${slug}" is missing required frontmatter field(s): ${missing.join(", ")}`);
    }
    return { slug, data, body };
  })
  .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
  .map(({ slug, data, body }) => {
    const publishedAt = normalizeDate(data.date);
    const wordCount = countWords(body);

    return {
      slug,
      tier: data.tier,
      title: data.title,
      excerpt: data.summary,
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: data.image || "/assets/Hero.webp",
      publishedAt,
      date: formatDate(publishedAt),
      wordCount,
      readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
      headings: extractHeadings(body),
      body,
    };
  });
