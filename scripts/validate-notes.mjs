import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const notesDirectory = path.join(projectRoot, "src/data/notes");
const cssPath = path.join(projectRoot, "src/index.css");
const requiredFields = ["tier", "title", "summary", "tags", "date"];
const allowedTiers = new Set(["essay", "note"]);
const failures = [];

const parseNote = (raw, filename) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    failures.push(`${filename}: missing valid YAML frontmatter`);
    return null;
  }

  return { data: loadYaml(match[1]) || {}, body: match[2].trim() };
};

const validateHeadings = (body, filename) => {
  let previousLevel = 1;
  let insideFence = false;

  body.split(/\r?\n/).forEach((line, index) => {
    if (/^(```|~~~)/.test(line.trim())) {
      insideFence = !insideFence;
      return;
    }
    if (insideFence) return;

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!match) return;

    const level = match[1].length;
    if (level === 1) failures.push(`${filename}:${index + 1}: note bodies must not contain h1 headings`);
    if (level > previousLevel + 1) {
      failures.push(`${filename}:${index + 1}: heading jumps from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  });
};

const validateImages = (body, filename) => {
  for (const match of body.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
    if (!match[1].trim()) failures.push(`${filename}: Markdown images require descriptive alt text`);
  }
};

const noteFiles = fs.readdirSync(notesDirectory).filter((filename) => filename.endsWith(".md"));

noteFiles.forEach((filename) => {
  const parsed = parseNote(fs.readFileSync(path.join(notesDirectory, filename), "utf8"), filename);
  if (!parsed) return;

  const { data, body } = parsed;
  requiredFields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      failures.push(`${filename}: missing required frontmatter field "${field}"`);
    }
  });

  if (!allowedTiers.has(data.tier)) failures.push(`${filename}: tier must be "essay" or "note"`);
  if (!Array.isArray(data.tags) || data.tags.length === 0) failures.push(`${filename}: tags must be a non-empty array`);
  validateHeadings(body, filename);
  validateImages(body, filename);
});

const hexToRgb = (hex) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
const luminance = (rgb) => {
  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
};
const contrast = (foreground, background) => {
  const first = luminance(hexToRgb(foreground));
  const second = luminance(hexToRgb(background));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};
const token = (block, name) => block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

const css = fs.readFileSync(cssPath, "utf8");
const darkBlock = css.match(/:root\s*{([\s\S]*?)\n}/)?.[1] || "";
const lightBlock = css.match(/:root\[data-theme="light"\]\s*{([\s\S]*?)\n}/)?.[1] || "";
const contrastPairs = [
  ["color-text-primary", "color-bg-base"],
  ["color-text-muted", "color-bg-base"],
  ["color-text-subtle", "color-bg-base"],
  ["color-text-meta", "color-bg-base"],
  ["color-primary", "color-bg-base"],
  ["color-primary-hover", "color-bg-base"],
  ["color-text-primary", "color-bg-surface"],
  ["color-text-muted", "color-bg-surface"],
  ["color-text-subtle", "color-bg-surface"],
  ["color-text-meta", "color-bg-surface"],
  ["color-primary", "color-bg-surface"],
  ["color-primary-hover", "color-bg-surface"],
  ["color-text-primary", "color-bg-elevated"],
  ["color-text-muted", "color-bg-elevated"],
  ["color-text-subtle", "color-bg-elevated"],
  ["color-text-meta", "color-bg-elevated"],
  ["color-primary", "color-bg-elevated"],
  ["color-bg-base", "color-primary"],
  ["color-bg-base", "color-primary-hover"],
];

for (const [theme, block] of [["dark", darkBlock], ["light", lightBlock]]) {
  contrastPairs.forEach(([foregroundName, backgroundName]) => {
    const foreground = token(block, foregroundName);
    const background = token(block, backgroundName);
    if (!foreground || !background) {
      failures.push(`${theme}: unable to read ${foregroundName}/${backgroundName} contrast tokens`);
      return;
    }

    const ratio = contrast(foreground, background);
    if (ratio < 4.5) {
      failures.push(`${theme}: ${foregroundName}/${backgroundName} is ${ratio.toFixed(2)}:1; expected at least 4.5:1`);
    }
  });
}

if (failures.length) {
  throw new Error(`Notes validation failed:\n- ${failures.join("\n- ")}`);
}

console.log(`Validated ${noteFiles.length} note${noteFiles.length === 1 ? "" : "s"} and both theme contrast sets.`);
