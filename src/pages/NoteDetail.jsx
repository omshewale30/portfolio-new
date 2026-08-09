import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { notes } from "../data/notes";

const NoteDetail = () => {
  const { slug } = useParams();
  const note = notes.find((n) => n.slug === slug);

  if (!note) return <Navigate to="/notes" replace />;

  return (
    <main className="bg-[var(--color-bg-base)]">
      <div className="section-shell max-w-3xl">
        <Link
          to="/notes"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)] no-underline transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to notes
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
          {note.date}
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
          {note.title}
        </h1>

        <div
          className={note.tier === "essay" ? "prose-essay mt-8 text-[var(--color-text-muted)]" : "mt-8 text-base leading-relaxed text-[var(--color-text-muted)]"}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {note.body}
        </div>
      </div>
    </main>
  );
};

export default NoteDetail;
