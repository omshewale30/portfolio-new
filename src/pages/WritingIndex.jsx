import PropTypes from "prop-types";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { WRITING_KINDS, startHere, writing } from "../data/writing";
import { cardReveal, revealOnView, staggerContainer } from "../utils/animations";
import { usePageMetadata } from "../utils/seo";
import SectionHeading from "../components/SectionHeading";

const ALL = "all";

const kindLabel = (kind) => WRITING_KINDS.find((item) => item.id === kind)?.label ?? kind;

const chipClass = (active) =>
  `note-interactive min-h-9 rounded-[7px] border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.06em] transition-colors ${
    active
      ? "border-[var(--color-border-focus)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
      : "border-[var(--color-border-subtle)] text-[var(--color-text-subtle)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
  }`;

// Pinned case studies as cards: the result line is the reason to click.
const StartHere = () => (
  <section aria-labelledby="start-here-heading" className="mb-16">
    <h2 id="start-here-heading" className="eyebrow-label eyebrow-pill mb-4">Start here</h2>
    <motion.div className="grid gap-4 md:grid-cols-3" variants={staggerContainer} {...revealOnView}>
      {startHere.map((study) => (
        <motion.div key={study.slug} variants={cardReveal}>
          <Link
            to={`/work/${study.slug}`}
            className="group surface-hover flex h-full flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
              {study.category}
            </span>
            <h3 className="font-display m-0 text-xl leading-snug text-[var(--color-text-primary)]">{study.title}</h3>
            {study.resultLine ? (
              <p className="m-0 flex-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{study.resultLine}</p>
            ) : null}
            <span className="mt-auto flex items-center pt-2 font-mono text-[11px] text-[var(--color-text-meta)]">
              {study.readingMinutes} min read
              <ArrowUpRight size={14} className="ml-auto text-[var(--color-text-subtle)]" aria-hidden="true" />
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

const WritingRow = ({ item }) => (
  <li>
    <Link
      to={item.href}
      className="note-interactive group grid gap-x-6 gap-y-1 border-b border-[var(--color-border-subtle)] py-4 no-underline transition-colors hover:border-[var(--color-border-hover)] sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
    >
      <time dateTime={item.publishedAt} className="font-mono text-xs text-[var(--color-text-meta)] sm:pt-1">
        {item.date}
      </time>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-base text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
          {item.title}
        </span>
        {item.summary ? (
          <span className="line-clamp-2 text-sm leading-relaxed text-[var(--color-text-subtle)]">{item.summary}</span>
        ) : null}
      </span>
      <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-meta)] sm:flex-col sm:items-end sm:gap-1 sm:pt-1">
        <span className="ai-badge normal-case tracking-normal">{kindLabel(item.kind)}</span>
        <span>{item.readingMinutes} min</span>
      </span>
    </Link>
  </li>
);

WritingRow.propTypes = {
  item: PropTypes.shape({
    kind: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    publishedAt: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    readingMinutes: PropTypes.number.isRequired,
  }).isRequired,
};

const WritingIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  usePageMetadata({
    title: "Writing — Om Shewale",
    description: "Case studies, essays and notes on building and evaluating AI systems.",
    path: "/writing",
  });

  // A chip only for kinds that have something in them.
  const kinds = WRITING_KINDS.filter((kind) => writing.some((item) => item.kind === kind.id));
  const requested = searchParams.get("type");
  const activeKind = kinds.some((kind) => kind.id === requested) ? requested : ALL;
  const visible = activeKind === ALL ? writing : writing.filter((item) => item.kind === activeKind);

  const years = [];
  visible.forEach((item) => {
    const year = item.publishedAt.slice(0, 4);
    const group = years.find((entry) => entry.year === year);
    if (group) group.items.push(item);
    else years.push({ year, items: [item] });
  });

  const choose = (kindId) => setSearchParams(kindId === ALL ? {} : { type: kindId }, { replace: true });

  return (
    <main className="bg-[var(--color-bg-base)]">
      <div className="section-shell page-shell">
        <SectionHeading
          as="h1"
          eyebrow="Writing"
          title="Case studies, essays and notes."
          lede="On building and evaluating AI systems."
          className="mb-12 md:mb-14"
        />

        {startHere.length ? <StartHere /> : null}

        <section aria-labelledby="all-writing-heading">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <h2 id="all-writing-heading" className="eyebrow-label eyebrow-pill m-0 mr-auto">All writing</h2>
            {kinds.length > 1 ? (
              <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
                {[{ id: ALL, plural: "All" }, ...kinds].map((kind) => (
                  <button
                    key={kind.id}
                    type="button"
                    aria-pressed={activeKind === kind.id}
                    onClick={() => choose(kind.id)}
                    className={chipClass(activeKind === kind.id)}
                  >
                    {kind.plural}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-10">
            {years.map(({ year, items }) => (
              <section key={year} aria-labelledby={`year-${year}`}>
                <h3 id={`year-${year}`} className="font-display m-0 mb-2 text-2xl text-[var(--color-text-primary)]">
                  {year}
                </h3>
                <ul className="m-0 list-none p-0">
                  {items.map((item) => <WritingRow key={item.href} item={item} />)}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default WritingIndex;
