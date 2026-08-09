import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { caseStudies } from "../data/caseStudies";

const CaseStudy = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) return <Navigate to="/projects" replace />;

  const image = study.images?.[0];

  return (
    <main className="bg-[var(--color-bg-base)]">
      <div className="section-shell">
        {/* ── Back nav ── */}
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)] transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to projects
        </button>

        {/* ── Header ── */}
        <header className="max-w-3xl">
          <p className="eyebrow-label mb-3">
            {"// "}
            {study.category} · {study.year}
          </p>
          <h1 className="font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
            {study.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-text-muted)]">{study.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {study.tags.map((tag) => (
              <span key={tag} className="ai-badge">
                {tag}
              </span>
            ))}
          </div>

          {study.externalLink ? (
            <a
              href={study.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-7 inline-flex items-center gap-2 no-underline"
            >
              View live
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : null}
        </header>

        <div className="divider-warm my-10" />

        {/* ── Stats ── */}
        {study.stats?.length ? (
          <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {study.stats.map((stat) => (
              <div key={stat.label} className="surface-card p-5">
                <strong className="font-display block text-3xl font-normal text-[var(--color-primary)]">
                  {stat.value}
                </strong>
                <span className="mt-2 block font-mono text-xs uppercase leading-relaxed tracking-[0.06em] text-[var(--color-text-meta)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-10">
            {/* ── Problem (before) ── */}
            <section>
              <p className="eyebrow-label mb-3">{"// The problem"}</p>
              <h2 className="font-display text-2xl text-[var(--color-text-primary)] md:text-3xl">
                {study.before.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
                {study.before.description}
              </p>
            </section>

            {/* ── Constraints ── */}
            {study.constraints?.length ? (
              <section>
                <p className="eyebrow-label mb-3">{"// Constraints"}</p>
                <ul className="m-0 list-none space-y-2 p-0">
                  {study.constraints.map((constraint) => (
                    <li
                      key={constraint}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]"
                    >
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                      {constraint}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* ── Intervention / Architecture ── */}
            <section>
              <p className="eyebrow-label mb-3">{"// The intervention"}</p>
              <h2 className="font-display text-2xl text-[var(--color-text-primary)] md:text-3xl">
                {study.intervention.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
                {study.intervention.description}
              </p>
            </section>

            {/* ── Decisions defended ── */}
            {study.decisionsDefended?.length ? (
              <section>
                <p className="eyebrow-label mb-3">{"// Decisions defended"}</p>
                <ul className="m-0 list-none space-y-2 p-0">
                  {study.decisionsDefended.map((decision) => (
                    <li
                      key={decision}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]"
                    >
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                      {decision}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* ── What I'd do differently ── */}
            {study.whatIdDoDifferently ? (
              <section>
                <p className="eyebrow-label mb-3">{"// What I'd do differently"}</p>
                <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
                  {study.whatIdDoDifferently}
                </p>
              </section>
            ) : null}

            {/* ── Measured result (after) ── */}
            <section className="surface-card p-6">
              <p className="eyebrow-label mb-3">{"// Measured result"}</p>
              <h2 className="font-display text-2xl text-[var(--color-text-primary)] md:text-3xl">
                {study.after.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)]">
                {study.after.description}
              </p>
            </section>
          </div>

          {/* ── Image slot ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {image?.src ? (
              <img
                src={image.src}
                alt={image.alt}
                className="w-full rounded-2xl border border-[var(--color-border-subtle)] object-cover"
              />
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-focus)] bg-[var(--color-bg-surface)] p-8 text-center">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                  Visual slot
                </span>
                <p className="mb-0 mt-2 text-sm text-[var(--color-text-subtle)]">{image?.label}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-14">
          <Link to="/projects" className="btn-ghost inline-flex items-center gap-2 no-underline">
            Browse the full project archive
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CaseStudy;
