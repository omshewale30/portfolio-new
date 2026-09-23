import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import PropTypes from "prop-types";
import { caseStudies } from "../data/caseStudies";

const CaseStudyTable = ({ table }) => (
  <figure className="m-0 mt-8">
    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)]">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead className="bg-[var(--color-bg-elevated)]">
          <tr>
            {table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap px-4 py-3 font-mono text-xs font-normal uppercase tracking-[0.06em] text-[var(--color-text-meta)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => {
            const highlighted = table.highlightRows?.includes(rowIndex);
            return (
              <tr
                key={row[0]}
                className={`border-t border-[var(--color-border-muted)] ${
                  highlighted ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row" className="whitespace-nowrap px-4 py-3 font-medium">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex} className="whitespace-nowrap px-4 py-3 tabular-nums">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {table.caption ? (
      <figcaption className="mt-3 text-xs leading-relaxed text-[var(--color-text-subtle)]">{table.caption}</figcaption>
    ) : null}
  </figure>
);

CaseStudyTable.propTypes = {
  table: PropTypes.shape({
    caption: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    highlightRows: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

const CaseStudySection = ({ section }) => (
  <section>
    {section.eyebrow ? <p className="eyebrow-label mb-3">{`// ${section.eyebrow}`}</p> : null}
    <h2 className="max-w-3xl font-display text-2xl text-[var(--color-text-primary)] md:text-3xl">
      {section.heading}
    </h2>
    <div className="mt-4 flex max-w-3xl flex-col gap-4">
      {section.paragraphs?.map((paragraph, index) => (
        <p key={index} className="m-0 text-base leading-relaxed text-[var(--color-text-muted)]">
          {paragraph}
        </p>
      ))}
    </div>
    {section.table ? <CaseStudyTable table={section.table} /> : null}
    {section.figures?.length ? (
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {section.figures.map((figure) => (
          <figure key={figure.src} className="m-0">
            <a href={figure.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full size: ${figure.alt}`}>
              <img
                src={figure.src}
                alt={figure.alt}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-[var(--color-border-subtle)] bg-white"
              />
            </a>
            {figure.caption ? (
              <figcaption className="mt-3 text-sm leading-relaxed text-[var(--color-text-subtle)]">
                {figure.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    ) : null}
  </section>
);

CaseStudySection.propTypes = {
  section: PropTypes.shape({
    eyebrow: PropTypes.string,
    heading: PropTypes.string.isRequired,
    paragraphs: PropTypes.arrayOf(PropTypes.string),
    table: PropTypes.object,
    figures: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        caption: PropTypes.string,
      }),
    ),
  }).isRequired,
};

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

        {/* ── Long-form analysis (optional) ── */}
        {study.sections?.length ? (
          <div className="mt-16">
            <div className="divider-warm mb-12" />
            <p className="eyebrow-label mb-10">{"// The analysis"}</p>
            <div className="flex flex-col gap-16">
              {study.sections.map((section) => (
                <CaseStudySection key={section.heading} section={section} />
              ))}
            </div>
          </div>
        ) : null}

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
