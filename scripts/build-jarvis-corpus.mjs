// Turns the site's content (src/data) into one Markdown document per page or entity,
// the corpus Jarvis retrieves from. Imports the plain data modules directly: the
// caseStudies.js / notes.js aggregators use import.meta.glob, which only runs under Vite.
//
// CLI: node scripts/build-jarvis-corpus.mjs [outDir]  — writes the corpus for review
// (default .jarvis-corpus/). scripts/sync-jarvis-corpus.mjs uploads it.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load as loadYaml } from "js-yaml";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(projectRoot, "src/data");
const siteUrl = "https://www.omshewale.com";

const importData = (relativePath) => import(pathToFileURL(path.join(dataDirectory, relativePath)).href);

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const present = (value) =>
  value !== null && value !== undefined && !(typeof value === "string" && !value.trim()) &&
  !(Array.isArray(value) && value.length === 0);

const bullets = (items) => items.filter(present).map((item) => `- ${item}`).join("\n");

const field = (label, value) => (present(value) ? `${label}: ${Array.isArray(value) ? value.join(", ") : value}` : null);

const markdownTable = ({ caption, columns, rows }) => {
  const escapeCell = (cell) => String(cell).replaceAll("|", "\\|");
  const lines = [
    `| ${columns.map(escapeCell).join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`),
  ];
  return [caption, lines.join("\n")].filter(present).join("\n\n");
};

const section = (heading, body) => (present(body) ? `## ${heading}\n\n${body}` : null);

// Every document opens with where it lives on the site, so Jarvis can send visitors there.
// maxChunkTokens overrides file search's default 800-token chunks for a document that must stay whole.
const makeDocument = ({ id, title, url, type, meta = [], body = [], maxChunkTokens }) => {
  const header = [
    `# ${title}`,
    [`Source: Om Shewale's portfolio website (${siteUrl})`, `Page: ${url}`, `Content type: ${type}`, ...meta]
      .filter(present)
      .join("\n"),
  ];
  const content = `${[...header, ...body.filter(present)].join("\n\n")}\n`;
  return {
    id,
    filename: `${id}.md`,
    title,
    url,
    content,
    maxChunkTokens,
    hash: createHash("sha256").update(`${maxChunkTokens ?? ""}\n${content}`).digest("hex"),
  };
};

const caseStudyDocument = (slug, study) => {
  const beforeAfter = (label, part) =>
    part ? section(`${label}: ${part.title}`, part.description) : null;

  const studySections = (study.sections || []).map((part) =>
    section(
      part.heading,
      [
        ...(part.paragraphs || []),
        part.list ? part.list.map((item, index) => `${index + 1}. ${item}`).join("\n") : null,
        part.table ? markdownTable(part.table) : null,
        ...(part.figures || []).map((figure) => (figure.caption ? `Figure: ${figure.caption}` : null)),
      ]
        .filter(present)
        .join("\n\n"),
    ),
  );

  return makeDocument({
    id: `site-work-${slug}`,
    title: `Case study: ${study.title}`,
    url: `${siteUrl}/work/${slug}`,
    type: "Case study",
    meta: [
      field("Category", study.category),
      field("Year", study.year),
      field("Role", study.role),
      field("Timeline", study.timeline),
      field("Stack", study.stack),
      field("Tags", study.tags),
      field("External link", study.externalLink),
    ],
    body: [
      section("Summary", study.summary),
      section("Key stats", bullets((study.stats || []).map((stat) => `${stat.label}: ${stat.value}`))),
      beforeAfter("Before", study.before),
      beforeAfter("Intervention", study.intervention),
      beforeAfter("After", study.after),
      section("Key takeaways", bullets(study.keyTakeaways || [])),
      ...studySections,
      section("Constraints", bullets(study.constraints || [])),
      section("Decisions defended", bullets(study.decisionsDefended || [])),
      section("What I'd do differently", study.whatIdDoDifferently),
    ],
  });
};

const parseNote = (slug, raw) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = match ? loadYaml(match[1]) || {} : {};
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  return { slug, data, date, body: (match ? match[2] : raw).trim(), url: `${siteUrl}/notes/${slug}` };
};

const noteDocument = ({ slug, data, date, body, url }) =>
  makeDocument({
    id: `site-notes-${slug}`,
    title: `${data.tier === "essay" ? "Essay" : "Note"}: ${data.title}`,
    url,
    type: data.tier === "essay" ? "Essay by Om" : "Note by Om",
    meta: [field("Published", date), field("Tags", data.tags)],
    body: [section("Summary", data.summary), body],
  });

// Shortens a slug at a word boundary; filenames surface as citation chips in the chat.
const shortSlug = (value, maxLength = 60) => {
  const slug = slugify(value);
  return slug.length <= maxLength ? slug : slug.slice(0, maxLength + 1).replace(/-[^-]*$/, "");
};

const experienceDocument = (role) =>
  makeDocument({
    id: `site-experience-${shortSlug(`${role.title} ${role.company}`)}`,
    title: `Experience: ${role.title} at ${role.company}`,
    url: `${siteUrl}/experience`,
    type: "Work experience",
    meta: [
      field("Role", role.title),
      field("Organization", role.company),
      field("Location", role.location),
      field("Dates", role.current ? `${role.duration} (current role)` : role.duration),
      field("Technologies", role.technologies),
    ],
    body: [
      section("Summary", role.summary || role.short),
      section("Contributions", bullets(role.contributions || [])),
    ],
  });

const projectDocument = (project) =>
  makeDocument({
    id: `site-projects-${slugify(project.title)}`,
    title: `Project: ${project.title}`,
    url: `${siteUrl}/projects`,
    type: "Project",
    meta: [
      field("Tags", project.tags),
      field("AI features", project.aiBadges),
      field(project.linkText || "Link", project.link),
    ],
    body: [project.description],
  });

const educationDocument = (educationDetails) =>
  makeDocument({
    id: "site-education",
    title: "Education",
    url: `${siteUrl}/experience`,
    type: "Education",
    body: educationDetails.map((edu) =>
      section(
        `${edu.degree}, ${edu.institution}`,
        [field("Years", edu.years), field("Graduated", edu.graduated), field("GPA", edu.gpa), edu.description].filter(present).join("\n"),
      ),
    ),
  });

const highlightsDocument = (proofStats) =>
  makeDocument({
    id: "site-highlights",
    title: "Headline results",
    url: siteUrl,
    type: "Home page highlights",
    body: [
      bullets(proofStats.map((stat) => `${stat.value} ${stat.label} (details: ${siteUrl}${stat.href})`)),
    ],
  });

const firstSentence = (text) => text.split(/(?<=\.)\s/)[0];

// One catalogue of everything on the site, so broad questions ("what has Om built?") retrieve
// a single complete chunk instead of whichever four entity documents happen to rank highest.
const overviewDocument = ({ caseStudies, projects, notes, experienceDetails }) =>
  makeDocument({
    id: "site-overview",
    title: "Site overview: everything on omshewale.com",
    url: siteUrl,
    type: "Overview of all case studies, projects, notes, and roles",
    maxChunkTokens: 1600,
    body: [
      section(
        "Flagship projects (each has a full case study)",
        bullets(caseStudies.map(({ slug, study }) => `${study.title} (${study.year}): ${firstSentence(study.summary)} ${siteUrl}/work/${slug}`)),
      ),
      section("Other projects", bullets(projects.map((project) => `${project.title}: ${firstSentence(project.description)}`))),
      section("Roles", bullets(experienceDetails.map((role) => `${role.title}, ${role.company} (${role.duration})`))),
      section("Notes and essays", bullets(notes.map(({ data, url }) => `${data.title}: ${data.summary ?? ""} ${url}`))),
    ],
  });

export const buildCorpus = async () => {
  const [{ projects }, { experienceDetails }, { proofStats }, { educationDetails }] = await Promise.all([
    importData("projects.js"),
    importData("experience.js"),
    importData("stats.js"),
    importData("education.js"),
  ]);

  const caseStudyFiles = fs.readdirSync(path.join(dataDirectory, "caseStudies")).filter((file) => file.endsWith(".js"));
  const caseStudies = await Promise.all(
    caseStudyFiles.map(async (file) => ({
      slug: file.replace(/\.js$/, ""),
      study: (await importData(`caseStudies/${file}`)).default,
    })),
  );

  const noteFiles = fs.readdirSync(path.join(dataDirectory, "notes")).filter((file) => file.endsWith(".md"));
  const notes = noteFiles.map((file) =>
    parseNote(file.replace(/\.md$/, ""), fs.readFileSync(path.join(dataDirectory, "notes", file), "utf8")),
  );

  const documents = [
    overviewDocument({ caseStudies, projects, notes, experienceDetails }),
    highlightsDocument(proofStats),
    educationDocument(educationDetails),
    ...experienceDetails.map(experienceDocument),
    ...projects.map(projectDocument),
    ...caseStudies.map(({ slug, study }) => caseStudyDocument(slug, study)),
    ...notes.map(noteDocument),
  ];

  const seen = new Set();
  for (const document of documents) {
    if (seen.has(document.id)) throw new Error(`Duplicate Jarvis corpus document id: ${document.id}`);
    seen.add(document.id);
  }
  return documents;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDirectory = path.resolve(projectRoot, process.argv[2] || ".jarvis-corpus");
  const documents = await buildCorpus();
  fs.mkdirSync(outDirectory, { recursive: true });
  // Clear only previous corpus output, so pointing this at an existing folder is safe.
  fs.readdirSync(outDirectory)
    .filter((file) => file.startsWith("site-") && file.endsWith(".md"))
    .forEach((file) => fs.rmSync(path.join(outDirectory, file)));
  documents.forEach((document) => fs.writeFileSync(path.join(outDirectory, document.filename), document.content));
  console.log(`Wrote ${documents.length} Jarvis corpus documents to ${path.relative(projectRoot, outDirectory)}/`);
}
