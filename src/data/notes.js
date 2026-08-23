// tier: "essay" (long-form, .prose-essay styling) | "note" (short, compact/dated)
// Notes are authored as markdown files with frontmatter in ./notes/*.md — this
// module loads them at build time and shapes them into what the note pages expect.
import { load as loadYaml } from "js-yaml";

const files = import.meta.glob("./notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

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
  .map(({ slug, data, body }) => ({
    slug,
    tier: data.tier,
    title: data.title,
    excerpt: data.summary,
    date: formatDate(data.date),
    body,
  }));
