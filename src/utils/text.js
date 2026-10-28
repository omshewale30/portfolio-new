// Text and date helpers shared by the notes and case study loaders.
export const WORDS_PER_MINUTE = 220;

export const slugifyHeading = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

// YAML reads an unquoted 2026-03-01 as a Date; everything downstream wants the ISO string.
export const normalizeDate = (date) =>
  date instanceof Date ? date.toISOString().slice(0, 10) : String(date);

export const formatDate = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const countWords = (body) =>
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
