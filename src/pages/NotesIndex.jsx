import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { notes } from "../data/notes";

const NotesIndex = () => {
  const essays = notes.filter((n) => n.tier === "essay");
  const shortNotes = notes.filter((n) => n.tier === "note");

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
          <div className="surface-card max-w-xl p-8">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
              Coming soon
            </p>
            <p className="mt-3 mb-0 text-base leading-relaxed text-[var(--color-text-muted)]">
              Notes are being written. Check back soon, or{" "}
              <Link to="/work/redesign-dont-redecorate" className="text-[var(--color-primary)]">
                read the research paper case study
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {essays.length ? (
              <section>
                <p className="eyebrow-label mb-5">{"// Essays"}</p>
                <div className="flex flex-col gap-6">
                  {essays.map((note) => (
                    <Link
                      key={note.slug}
                      to={`/notes/${note.slug}`}
                      className="surface-card block p-6 no-underline transition-colors hover:border-[var(--color-border-focus)]"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                        {note.date}
                      </span>
                      <h2 className="font-display mt-2 text-2xl text-[var(--color-text-primary)]">
                        {note.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                        {note.excerpt}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                        Read
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {shortNotes.length ? (
              <section>
                <p className="eyebrow-label mb-5">{"// Notes"}</p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {shortNotes.map((note) => (
                    <li key={note.slug}>
                      <Link
                        to={`/notes/${note.slug}`}
                        className="flex items-center justify-between gap-4 border-b border-[var(--color-border-muted)] py-3 no-underline transition-colors hover:text-[var(--color-primary)]"
                      >
                        <span className="text-sm text-[var(--color-text-primary)]">{note.title}</span>
                        <span className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
                          {note.date}
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
