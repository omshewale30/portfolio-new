// Parses a case study written as markdown (./caseStudies/*.md) into the study object
// the loader validates and the page renders.
//
// Frontmatter (YAML) holds the short structured fields: title, category, date (YYYY-MM-DD; the
// year shown on the page comes from it), resultLine, tags, stats, images, externalLink, role,
// timeline, stack, pinned (true shows the study under "Start here" on /writing). Any other field may also go there, e.g. a resultsTable that needs
// columnGroups, but not in both places.
//
// The body is split by `#` headings, one per part of the page, in any order:
//
//   # Summary                  one paragraph → summary
//   # Context                  first `##` → before (heading = title, one paragraph = description);
//                              further `##` → sections in the context part
//   # Constraints              bullet list → constraints; `## Out of scope` bullet list → outOfScope
//   # What didn't work         each `##` → failedApproaches (heading = title, one paragraph)
//   # Approach                 first `##` → intervention; `## Decisions defended` bullet list →
//                              decisionsDefended; further `##` → sections in the approach part
//   # How it shipped           paragraphs → shipping
//   # Results                  first `##` → after, and a table in it → resultsTable;
//                              `## Where it fell short` one paragraph → resultsNote;
//                              further `##` → sections in the results part
//   # Lessons                  bullet list of `- **Claim.** Detail` → lessons
//   # Limits                   each `##` → sections in the limits part
//   # What I'd do differently  one paragraph → whatIdDoDifferently (items separated by `;`)
//
// Inside a section: paragraphs, one numbered list, one table, and figures written as
// `![alt](src "caption")` on their own line. Tables are GFM pipe tables; a bold first cell
// highlights the row, and a `Table: …` line right after the table is its caption.
// Text is shown as written: inline markdown (other than the lesson claim) is not rendered.
import { load as loadYaml } from "js-yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const IMAGE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"(.*)")?\)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+\.\s+(.*)$/;
const TABLE_SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;
const BOLD_CELL = /^\*\*(.+)\*\*$/;
const LESSON = /^\*\*(.+?)\*\*\s*(.*)$/;

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));

const parseTable = (lines, where) => {
  const [header, separator, ...body] = lines;
  if (!separator || !TABLE_SEPARATOR.test(separator.trim())) {
    throw new Error(`${where}: a table needs a |---| line under its header row`);
  }
  const highlightRows = [];
  const rows = body.map((line, rowIndex) => {
    const cells = splitRow(line);
    const bold = cells[0].match(BOLD_CELL);
    if (bold) {
      cells[0] = bold[1];
      highlightRows.push(rowIndex);
    }
    return cells;
  });
  return { type: "table", table: { columns: splitRow(header), rows, ...(highlightRows.length ? { highlightRows } : {}) } };
};

// Lines → blocks: headings, paragraphs, lists, images and tables.
const tokenize = (body, where) => {
  const blocks = [];
  const lines = body.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,2})\s+(.+?)\s*#*$/);
    if (heading) {
      blocks.push({ type: heading[1].length === 1 ? "part" : "heading", text: heading[2] });
      index += 1;
      continue;
    }
    if (/^#{3,}\s/.test(line)) throw new Error(`${where}: only # and ## headings are supported ("${line}")`);

    const image = line.match(IMAGE);
    if (image) {
      const [, alt, src, caption] = image;
      blocks.push({ type: "image", figure: { src, alt, ...(caption ? { caption } : {}) } });
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) tableLines.push(lines[index++].trim());
      blocks.push(parseTable(tableLines, where));
      continue;
    }

    const listType = BULLET.test(line) ? "bullets" : NUMBERED.test(line) ? "numbered" : null;
    if (listType) {
      const marker = listType === "bullets" ? BULLET : NUMBERED;
      const items = [];
      // An item runs on through indented continuation lines, up to the next marker or blank line.
      while (index < lines.length && lines[index].trim()) {
        const current = lines[index].trim();
        const item = current.match(marker);
        if (item) items.push(item[1]);
        else if (/^\s/.test(lines[index]) && items.length) items[items.length - 1] += ` ${current}`;
        else break;
        index += 1;
      }
      blocks.push({ type: listType, items });
      continue;
    }

    // A paragraph: consecutive plain lines, joined with spaces.
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^(#|\||!\[|[-*]\s|\d+\.\s)/.test(lines[index].trim())) {
      paragraph.push(lines[index++].trim());
    }
    const text = paragraph.join(" ");
    const previous = blocks[blocks.length - 1];
    if (text.startsWith("Table:") && previous?.type === "table" && !previous.table.caption) {
      previous.table = { caption: text.replace(/^Table:\s*/, ""), ...previous.table };
    } else {
      blocks.push({ type: "paragraph", text });
    }
  }
  return blocks;
};

// Blocks → { part: { intro: blocks before the first ##, groups: [{ heading, blocks }] } }.
const groupByPart = (blocks, where) => {
  const parts = new Map();
  let current = null;
  blocks.forEach((block) => {
    if (block.type === "part") {
      const key = block.text.toLowerCase().replace(/’/g, "'");
      if (parts.has(key)) throw new Error(`${where}: "# ${block.text}" appears twice`);
      current = { name: block.text, intro: [], groups: [] };
      parts.set(key, current);
    } else if (!current) {
      throw new Error(`${where}: text before the first # heading`);
    } else if (block.type === "heading") {
      current.groups.push({ heading: block.text, blocks: [] });
    } else {
      (current.groups.at(-1)?.blocks ?? current.intro).push(block);
    }
  });
  return parts;
};

// Takes the blocks of the given types out of a block list; anything left over is an error,
// so no text the author wrote is silently dropped.
const take = (blocks, allowed, where) => {
  const leftover = blocks.find((block) => !allowed.includes(block.type));
  if (leftover) {
    throw new Error(`${where}: unexpected ${leftover.type} here (allowed: ${allowed.join(", ") || "nothing"})`);
  }
  const ofType = (type) => blocks.filter((block) => block.type === type);
  return {
    paragraphs: ofType("paragraph").map((block) => block.text),
    bullets: ofType("bullets").flatMap((block) => block.items),
    numbered: ofType("numbered").flatMap((block) => block.items),
    tables: ofType("table").map((block) => block.table),
    figures: ofType("image").map((block) => block.figure),
  };
};

const oneParagraph = (blocks, where) => {
  const { paragraphs } = take(blocks, ["paragraph"], where);
  if (paragraphs.length !== 1) throw new Error(`${where}: expected one paragraph, found ${paragraphs.length}`);
  return paragraphs[0];
};

const onlyOne = (items, what, where) => {
  if (items.length > 1) throw new Error(`${where}: only one ${what} is supported, found ${items.length}`);
  return items[0];
};

const toStoryPart = (group, where) => ({ title: group.heading, description: oneParagraph(group.blocks, where) });

const toSection = (group, part, where) => {
  const { paragraphs, numbered, tables, figures } = take(group.blocks, ["paragraph", "numbered", "table", "image"], where);
  const table = onlyOne(tables, "table", where);
  return {
    heading: group.heading,
    part,
    ...(paragraphs.length ? { paragraphs } : {}),
    ...(numbered.length ? { list: numbered } : {}),
    ...(table ? { table } : {}),
    ...(figures.length ? { figures } : {}),
  };
};

const named = (groups, name) => groups.find((group) => group.heading.toLowerCase() === name);
const without = (groups, ...names) => groups.filter((group) => !names.includes(group.heading.toLowerCase()));

// Each part's reader returns the fields it fills, plus the long-form sections it holds.
const PARTS = {
  summary: (part, where) => ({ summary: oneParagraph(part.intro, where) }),

  context: (part, where) => {
    take(part.intro, [], where);
    const [opening, ...rest] = part.groups;
    if (!opening) throw new Error(`${where}: needs a ## heading for the problem`);
    return {
      before: toStoryPart(opening, `${where} › ${opening.heading}`),
      sections: rest.map((group) => toSection(group, "context", `${where} › ${group.heading}`)),
    };
  },

  constraints: (part, where) => {
    const outOfScope = named(part.groups, "out of scope");
    take(without(part.groups, "out of scope").flatMap((group) => group.blocks), [], `${where} (only "## Out of scope" is allowed)`);
    return {
      constraints: take(part.intro, ["bullets"], where).bullets,
      ...(outOfScope ? { outOfScope: take(outOfScope.blocks, ["bullets"], `${where} › Out of scope`).bullets } : {}),
    };
  },

  "what didn't work": (part, where) => {
    take(part.intro, [], where);
    return { failedApproaches: part.groups.map((group) => toStoryPart(group, `${where} › ${group.heading}`)) };
  },

  approach: (part, where) => {
    take(part.intro, [], where);
    const decisions = named(part.groups, "decisions defended");
    const [opening, ...rest] = without(part.groups, "decisions defended");
    if (!opening) throw new Error(`${where}: needs a ## heading for the approach`);
    return {
      intervention: toStoryPart(opening, `${where} › ${opening.heading}`),
      ...(decisions ? { decisionsDefended: take(decisions.blocks, ["bullets"], `${where} › Decisions defended`).bullets } : {}),
      sections: rest.map((group) => toSection(group, "approach", `${where} › ${group.heading}`)),
    };
  },

  "how it shipped": (part, where) => {
    take(part.groups.flatMap((group) => group.blocks), [], `${where} (no ## headings here)`);
    return { shipping: take(part.intro, ["paragraph"], where).paragraphs };
  },

  results: (part, where) => {
    take(part.intro, [], where);
    const note = named(part.groups, "where it fell short");
    const [opening, ...rest] = without(part.groups, "where it fell short");
    if (!opening) throw new Error(`${where}: needs a ## heading for the result`);
    const openingWhere = `${where} › ${opening.heading}`;
    const { tables } = take(opening.blocks, ["paragraph", "table"], openingWhere);
    const resultsTable = onlyOne(tables, "table", openingWhere);
    return {
      after: toStoryPart({ ...opening, blocks: opening.blocks.filter((block) => block.type !== "table") }, openingWhere),
      ...(resultsTable ? { resultsTable } : {}),
      ...(note ? { resultsNote: oneParagraph(note.blocks, `${where} › Where it fell short`) } : {}),
      sections: rest.map((group) => toSection(group, "results", `${where} › ${group.heading}`)),
    };
  },

  lessons: (part, where) => {
    take(part.groups.flatMap((group) => group.blocks), [], `${where} (write lessons as a bullet list)`);
    return {
      lessons: take(part.intro, ["bullets"], where).bullets.map((item) => {
        const match = item.match(LESSON);
        if (!match) throw new Error(`${where}: each lesson must start with a **bold claim** ("${item.slice(0, 40)}…")`);
        return { claim: match[1], ...(match[2] ? { detail: match[2] } : {}) };
      }),
    };
  },

  limits: (part, where) => {
    take(part.intro, [], where);
    return { sections: part.groups.map((group) => toSection(group, "limits", `${where} › ${group.heading}`)) };
  },

  "what i'd do differently": (part, where) => ({ whatIdDoDifferently: oneParagraph(part.intro, where) }),
};

// Sections appear on the page grouped by part, so their order across parts doesn't matter.
export const parseCaseStudyMarkdown = (raw, slug) => {
  const match = raw.match(FRONTMATTER);
  if (!match) throw new Error(`Case study "${slug}.md" needs YAML frontmatter between --- lines`);
  const [, frontmatter, body] = match;
  const data = loadYaml(frontmatter) ?? {};
  if (data.year !== undefined) throw new Error(`Case study "${slug}.md": remove year; it comes from date`);
  // YAML reads an unquoted 2026-03-01 as a Date; the page wants the ISO string.
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  if (data.date !== undefined) {
    data.date = String(data.date);
    data.year = data.date.slice(0, 4);
  }

  const fields = {};
  const sections = [];
  groupByPart(tokenize(body, `${slug}.md`), `${slug}.md`).forEach((part, key) => {
    const where = `${slug}.md › # ${part.name}`;
    const read = PARTS[key];
    if (!read) throw new Error(`${where}: unknown part (use: ${Object.keys(PARTS).join(", ")})`);
    const { sections: partSections = [], ...partFields } = read(part, where);
    Object.assign(fields, partFields);
    sections.push(...partSections);
  });

  const clash = Object.keys(fields).filter((field) => field in data);
  if (clash.length) throw new Error(`Case study "${slug}.md" sets ${clash.join(", ")} in both frontmatter and body`);
  return { ...data, ...fields, ...(sections.length ? { sections } : {}) };
};
