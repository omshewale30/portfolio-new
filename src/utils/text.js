// Text helpers shared by the notes and case study loaders.
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
