import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(projectRoot, "dist");
const notesDirectory = path.join(projectRoot, "src/data/notes");
const baseHtml = fs.readFileSync(path.join(distDirectory, "index.html"), "utf8");
const siteUrl = "https://omshewale.me";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const setMeta = (html, attribute, name, content) => {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${name}["'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${name}" content="${escaped}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
};

const setCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
};

const renderHead = ({ title, description, path: routePath, image, type, publishedAt, tags = [] }) => {
  const url = `${siteUrl}${routePath}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:image", imageUrl);
  html = setMeta(html, "property", "og:type", type);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setMeta(html, "name", "twitter:image", imageUrl);
  html = setCanonical(html, url);

  if (publishedAt) html = setMeta(html, "property", "article:published_time", publishedAt);
  if (tags.length) {
    const tagsMarkup = tags
      .map((tag) => `    <meta property="article:tag" content="${escapeHtml(tag)}" />`)
      .join("\n");
    html = html.replace("</head>", `${tagsMarkup}\n  </head>`);
  }

  return html;
};

const writeRoute = (routePath, html) => {
  const outputDirectory = path.join(distDirectory, routePath.replace(/^\//, ""));
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "index.html"), html);
};

const notesIndexHtml = renderHead({
  title: "Notes — Om Shewale",
  description: "Longer essays and shorter working notes on building and evaluating AI systems.",
  path: "/notes",
  image: "/assets/Hero.webp",
  type: "website",
});
writeRoute("/notes", notesIndexHtml);

const noteFiles = fs.readdirSync(notesDirectory).filter((filename) => filename.endsWith(".md"));

noteFiles.forEach((filename) => {
  const raw = fs.readFileSync(path.join(notesDirectory, filename), "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return;

  const data = loadYaml(match[1]) || {};
  const slug = filename.replace(/\.md$/, "");
  const publishedAt = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  const html = renderHead({
    title: `${data.title} — Om Shewale`,
    description: data.summary,
    path: `/notes/${slug}`,
    image: data.image || "/assets/Hero.webp",
    type: "article",
    publishedAt,
    tags: Array.isArray(data.tags) ? data.tags : [],
  });

  writeRoute(`/notes/${slug}`, html);
});

console.log(`Generated static metadata for /notes and ${noteFiles.length} note route${noteFiles.length === 1 ? "" : "s"}.`);
