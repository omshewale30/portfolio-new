import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { notes } from "../data/notes";

const noteTypeLabel = (tier) => (tier === "essay" ? "Essay" : "Note");

const RecentNotes = () => {
  const recentNotes = notes.slice(0, 3);
  const featuredNote = recentNotes[0];
  const followUpNotes = recentNotes.slice(1);

  if (!featuredNote) return null;

  return (
    <section
      id="recent-notes"
      aria-labelledby="recent-notes-heading"
      className="relative border-y border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]"
    >
      <div className="section-shell">
        <header className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow-label mb-3">{"// Recent notes"}</p>
            <h2 id="recent-notes-heading" className="font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
              What I’m thinking about.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
              Essays and working notes on building and evaluating AI systems.
            </p>
          </div>

          <Link to="/notes" className="btn-ghost note-interactive inline-flex min-h-11 items-center gap-2 self-start no-underline md:self-auto">
            View all notes
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <div className={followUpNotes.length ? "grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]" : "max-w-3xl"}>
          <article className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
            <Link
              to={`/notes/${featuredNote.slug}`}
              className="note-interactive group flex h-full flex-col p-6 no-underline transition-colors hover:border-[var(--color-primary)] md:p-8"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                <span className="note-tier-badge">Latest {noteTypeLabel(featuredNote.tier)}</span>
                <time dateTime={featuredNote.publishedAt}>{featuredNote.date}</time>
                <span aria-hidden="true">·</span>
                <span>{featuredNote.readingMinutes} min read</span>
              </div>

              <h3 className="mt-6 font-display text-3xl leading-tight text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-primary)] md:text-4xl">
                {featuredNote.title}
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                {featuredNote.excerpt}
              </p>

              {featuredNote.tags.length ? (
                <ul className="note-tag-list" aria-label={`Topics for ${featuredNote.title}`}>
                  {featuredNote.tags.slice(0, 3).map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              ) : null}

              <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                Read {noteTypeLabel(featuredNote.tier).toLowerCase()}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </article>

          {followUpNotes.length ? (
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
              <p className="px-3 pb-2 pt-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                More from notes
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {followUpNotes.map((note) => (
                  <li key={note.slug}>
                    <article>
                      <Link
                        to={`/notes/${note.slug}`}
                        className="note-interactive group flex min-h-28 flex-col justify-between rounded-xl border border-transparent p-4 no-underline transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-base)]"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.07em] text-[var(--color-text-meta)]">
                          <span>{noteTypeLabel(note.tier)}</span>
                          <time dateTime={note.publishedAt}>{note.date}</time>
                          <span aria-hidden="true">·</span>
                          <span>{note.readingMinutes} min read</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl leading-tight text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
                          {note.title}
                        </h3>
                        <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                          Read note
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </span>
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default RecentNotes;
