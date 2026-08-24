import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { notes } from "../data/notes";
import { usePageMetadata } from "../utils/seo";

const NotesIndex = () => {
  const essays = notes.filter((n) => n.tier === "essay");
  const shortNotes = notes.filter((n) => n.tier === "note");

  usePageMetadata({
    title: "Notes — Om Shewale",
    description: "Longer essays and shorter working notes on building and evaluating AI systems.",
    path: "/notes",
  });

  return (
    <main className="bg-[var(--color-bg-base)]">
      <div className="section-shell">
        <header className="max-w-2xl">
          <p className="eyebrow-label mb-3">{"// Notes"}</p>
          <h1 className="font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
            Notes
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
            Longer essays and shorter working notes on building and evaluating AI systems.
          </p>
        </header>

        <div className="divider-warm my-10" />

        {notes.length === 0 ? (
          <div className="surface-card notes-empty-card max-w-xl">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
              Coming soon
            </p>
            <p className="mt-3 mb-0 text-base leading-relaxed text-[var(--color-text-muted)]">
              Notes are being written. Check back soon, or{" "}
              <Link to="/work/redesign-dont-redecorate" className="note-interactive text-[var(--color-primary)]">
                read the research paper case study
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {essays.length ? (
              <section>
                <h2 id="essays-heading" className="eyebrow-label mb-5">{"// Essays"}</h2>
                <div className="flex flex-col gap-6">
                  {essays.map((note) => (
                    <Link
                      key={note.slug}
                      to={`/notes/${note.slug}`}
                      className="surface-card notes-essay-card note-interactive block no-underline transition-colors hover:border-[var(--color-primary)]"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                        <span className="note-tier-badge">Essay</span>
                        <time dateTime={note.publishedAt}>{note.date}</time>
                        <span aria-hidden="true">·</span>
                        <span>{note.readingMinutes} min read</span>
                      </div>
                      <h3 className="font-display mt-3 text-2xl text-[var(--color-text-primary)]">
                        {note.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">
                        {note.excerpt}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        {note.tags.length ? (
                          <ul className="note-tag-list note-tag-list-compact" aria-label={`Topics for ${note.title}`}>
                            {note.tags.map((tag) => <li key={tag}>{tag}</li>)}
                          </ul>
                        ) : <span />}
                        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                          Read essay
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {shortNotes.length ? (
              <section>
                <h2 id="short-notes-heading" className="eyebrow-label mb-5">{"// Notes"}</h2>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {shortNotes.map((note) => (
                    <li key={note.slug}>
                      <Link
                        to={`/notes/${note.slug}`}
                        className="note-interactive flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border-muted)] py-3 no-underline transition-colors hover:text-[var(--color-primary)]"
                      >
                        <span className="text-base text-[var(--color-text-primary)]">{note.title}</span>
                        <span className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
                          <time dateTime={note.publishedAt}>{note.date}</time> · {note.readingMinutes} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotesIndex;
