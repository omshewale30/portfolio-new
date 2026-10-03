import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { notes } from "../data/notes";

const noteTypeLabel = (tier) => (tier === "essay" ? "essay" : "note");

// Latest essay card. Hovering (or focusing) it unfolds the opening paragraph.
const RecentNotes = () => {
  const [featuredNote, ...olderNotes] = notes.slice(0, 3);
  if (!featuredNote) return null;

  return (
    <section id="recent-notes" aria-label="Latest note" className="flex flex-1 flex-col gap-2">
      <Link
        to={`/notes/${featuredNote.slug}`}
        className="group surface-hover flex flex-1 flex-col gap-3.5 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)] sm:p-7"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
          Latest {noteTypeLabel(featuredNote.tier)} ·{" "}
          <time dateTime={featuredNote.publishedAt}>{featuredNote.date}</time>
        </span>
        <h2 className="m-0 text-xl font-normal leading-tight tracking-[-0.015em] text-[var(--color-text-muted)] sm:text-2xl">
          {featuredNote.title}
        </h2>
        {featuredNote.excerpt ? (
          <p className="m-0 text-sm text-[var(--color-text-subtle)]">{featuredNote.excerpt}</p>
        ) : null}
        {featuredNote.opening ? (
          <span className="block max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-[450ms] ease-out group-hover:max-h-[200px] group-hover:opacity-100 group-focus-visible:max-h-[200px] group-focus-visible:opacity-100">
            <span className="block text-sm leading-[1.65] text-[var(--color-text-muted)]">{featuredNote.opening}</span>
          </span>
        ) : null}
        <span className="mt-auto flex items-center font-mono text-[11px] text-[var(--color-text-meta)]">
          {featuredNote.readingMinutes} min read
          <ArrowUpRight size={14} className="ml-auto text-[var(--color-text-subtle)]" aria-hidden="true" />
        </span>
      </Link>

      {olderNotes.length ? (
        <ul className="m-0 flex list-none flex-col p-0">
          {olderNotes.map((note) => (
            <li key={note.slug}>
              <Link
                to={`/notes/${note.slug}`}
                className="flex items-baseline gap-3 border-b border-[var(--color-border-subtle)] px-1 py-3 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <span className="mr-auto">{note.title}</span>
                <time dateTime={note.publishedAt} className="shrink-0 font-mono text-[11px] text-[var(--color-text-meta)]">
                  {note.date}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link to="/notes" className="self-start px-1 pt-1 font-mono text-[11px] text-[var(--color-text-meta)] transition-colors hover:text-[var(--color-text-primary)]">
        all notes →
      </Link>
    </section>
  );
};

export default RecentNotes;
