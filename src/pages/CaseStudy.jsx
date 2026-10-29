import { useCallback, useMemo, useRef, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import { SECTION_PARTS, caseStudies } from "../data/caseStudies";
import { easing, staggerContainer } from "../utils/animations";
import { useReadingProgress } from "../utils/readingProgress";
import { useScrollSpy } from "../utils/scrollSpy";
import { slugifyHeading } from "../utils/text";
import AnalysisSection from "../components/caseStudy/AnalysisSection";
import CountUpValue from "../components/caseStudy/CountUpValue";
import DataTable from "../components/caseStudy/DataTable";
import FigureButton from "../components/caseStudy/FigureButton";
import Lightbox from "../components/caseStudy/Lightbox";
import { TocDetails, TocRail } from "../components/caseStudy/Toc";

// Short studies (context, constraints, approach, results) read fine without a table of contents.
const TOC_MIN_SECTIONS = 5;

const FIXED_IDS = {
  context: "context-and-problem",
  constraints: "constraints",
  failed: "what-didnt-work",
  approach: "the-approach",
  shipping: "how-it-shipped",
  results: "results",
  lessons: "lessons",
  reflection: "what-id-do-differently",
};

const DEFAULT_PART = "approach";

// The page outline: fixed sections in reading order, each followed by the study's own `sections`
// for that part, all with unique anchor ids.
const buildOutline = (study) => {
  const used = new Set(Object.values(FIXED_IDS));
  const byPart = Object.fromEntries(SECTION_PARTS.map((part) => [part, []]));
  (study.sections ?? []).forEach((section) => {
    const base = slugifyHeading(section.heading);
    let id = base;
    for (let suffix = 1; used.has(id); suffix += 1) id = `${base}-${suffix}`;
    used.add(id);
    byPart[section.part ?? DEFAULT_PART].push({ ...section, id });
  });
  const sectionItems = (part) => byPart[part].map((section) => ({ id: section.id, label: section.heading }));

  const items = [
    { id: FIXED_IDS.context, label: "Context and problem" },
    ...sectionItems("context"),
    (study.constraints?.length || study.outOfScope?.length) && { id: FIXED_IDS.constraints, label: "Constraints" },
    study.failedApproaches?.length && { id: FIXED_IDS.failed, label: "What didn't work" },
    { id: FIXED_IDS.approach, label: "The approach" },
    ...sectionItems("approach"),
    study.shipping?.length && { id: FIXED_IDS.shipping, label: study.shippingTitle ?? "How it shipped" },
    { id: FIXED_IDS.results, label: "Results" },
    ...sectionItems("results"),
    study.lessons?.length && { id: FIXED_IDS.lessons, label: "Lessons" },
    ...sectionItems("limits"),
    study.whatIdDoDifferently && { id: FIXED_IDS.reflection, label: "What I'd do differently" },
  ].filter(Boolean);

  return { items, byPart };
};

// "Do a; do b; and do c." → ["Do a", "Do b", "Do c"]
const toListItems = (text) =>
  text
    .split(";")
    .map((item) => item.trim().replace(/^and\s+/i, "").replace(/\.$/, ""))
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));

const revealItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easing } },
};

const BulletList = ({ items, reveal = false }) => {
  const reduceMotion = useReducedMotion();
  const animate = reveal && !reduceMotion;

  return (
    <motion.ul
      className="m-0 flex list-none flex-col gap-3 p-0"
      variants={animate ? staggerContainer : undefined}
      initial={animate ? "hidden" : false}
      whileInView={animate ? "visible" : undefined}
      viewport={{ once: true, margin: "-40px" }}
    >
      {items.map((item) => (
        <motion.li
          key={item.claim ?? item}
          variants={animate ? revealItem : undefined}
          className="case-reveal flex items-start gap-3 text-base leading-relaxed text-[var(--color-text-muted)]"
        >
          <span aria-hidden="true" className="mt-[0.8rem] h-px w-2 flex-shrink-0 bg-[var(--color-text-meta)]" />
          {typeof item === "string" ? (
            <span>{item}</span>
          ) : (
            <span>
              <strong className="font-medium text-[var(--color-text-primary)]">{item.claim}</strong>
              {item.detail ? ` ${item.detail}` : null}
            </span>
          )}
        </motion.li>
      ))}
    </motion.ul>
  );
};

BulletList.propTypes = {
  // Strings, or lessons: a claim shown in bold, then its supporting detail.
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ claim: PropTypes.string.isRequired, detail: PropTypes.string }),
    ]),
  ).isRequired,
  reveal: PropTypes.bool,
};

// Children sit in the reading column; a `.case-breakout` child (a table) spans the full width.
const PageSection = ({ id, eyebrow, title, className = "mt-20", children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className={`case-flow scroll-mt-28 ${className}`}>
    <header className="text-center">
      {eyebrow ? <p className="eyebrow-label eyebrow-pill mb-3">{eyebrow}</p> : null}
      <h2
        id={`${id}-heading`}
        className="m-0 text-balance font-display text-2xl text-[var(--color-text-primary)] md:text-3xl"
      >
        {title}
      </h2>
    </header>
    {children}
  </section>
);

PageSection.propTypes = {
  id: PropTypes.string.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// A section's opening beat: the study's before / intervention / after, as an h3 and its paragraph.
// The result is set in a card, as the end of the story.
const StoryLead = ({ part, card = false }) => (
  <div
    className={`mt-6 ${
      card ? "rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 md:p-6" : ""
    }`}
  >
    <h3 className="m-0 font-display text-xl leading-snug text-[var(--color-text-primary)] md:text-2xl">{part.title}</h3>
    <p className="mb-0 mt-3 text-base leading-relaxed text-[var(--color-text-muted)]">{part.description}</p>
  </div>
);

StoryLead.propTypes = {
  part: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  card: PropTypes.bool,
};

const SubHeading = ({ children }) => <h3 className="eyebrow-label m-0 mb-4 mt-10">{children}</h3>;

SubHeading.propTypes = {
  children: PropTypes.node.isRequired,
};

const Paragraphs = ({ items }) => (
  <div className="mt-6 flex flex-col gap-4">
    {items.map((paragraph) => (
      <p key={paragraph} className="m-0 text-base leading-relaxed text-[var(--color-text-muted)]">
        {paragraph}
      </p>
    ))}
  </div>
);

Paragraphs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const GLANCE_COLUMNS = { 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5" };

const GlanceStrip = ({ study }) => {
  const facts = [
    { label: "Category", value: study.category },
    { label: "Year", value: study.year },
    study.role && { label: "Role", value: study.role },
    study.timeline && { label: "Timeline", value: study.timeline },
    { label: "Reading time", value: `${study.readingMinutes} min` },
  ].filter(Boolean);
  const chipRows = [
    { label: "Tags", items: study.tags },
    study.stack?.length && { label: "Stack", items: study.stack },
  ].filter(Boolean);

  return (
    <dl
      className={`m-0 mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-border-subtle)] ${
        GLANCE_COLUMNS[facts.length] ?? "sm:grid-cols-4"
      }`}
    >
      {facts.map((fact, index) => (
        <div
          key={fact.label}
          className={`bg-[var(--color-bg-surface)] px-3 py-4 text-center ${
            index === facts.length - 1 && facts.length % 2 ? "max-sm:col-span-2" : ""
          }`}
        >
          <dt className="eyebrow-label">{fact.label}</dt>
          <dd className="m-0 mt-1.5 text-sm text-[var(--color-text-primary)]">{fact.value}</dd>
        </div>
      ))}
      {chipRows.map((row) => (
        <div key={row.label} className="col-span-full bg-[var(--color-bg-surface)] px-4 py-4 text-center">
          <dt className="eyebrow-label">{row.label}</dt>
          <dd className="m-0 mt-3">
            <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
              {row.items.map((item) => (
                <li key={item} className="ai-badge">
                  {item}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
};

GlanceStrip.propTypes = {
  study: PropTypes.shape({
    category: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    readingMinutes: PropTypes.number.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    role: PropTypes.string,
    timeline: PropTypes.string,
    stack: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const VisualSlot = ({ label, className = "min-h-48 p-8" }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-surface)] text-center ${className}`}
  >
    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">Visual slot</span>
    {label ? <p className="mb-0 mt-2 text-sm text-[var(--color-text-subtle)]">{label}</p> : null}
  </div>
);

VisualSlot.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};

const imagePropType = PropTypes.shape({
  src: PropTypes.string,
  alt: PropTypes.string,
  label: PropTypes.string,
});

// images[0] as the hero at full column width; any further images as a gallery beneath it.
// All of them step together in the lightbox.
const HeroMedia = ({ images, onOpenFigure }) => {
  const [hero, ...gallery] = images;
  const viewable = images.filter((image) => image.src);
  const open = (image) => (event) => onOpenFigure(viewable, viewable.indexOf(image), event.currentTarget);

  return (
    <div className="mt-10">
      <figure className="m-0">
        {hero?.src ? (
          <FigureButton figure={hero} onOpen={open(hero)} imageClassName="max-h-[36rem] w-auto max-w-full" />
        ) : (
          <VisualSlot label={hero?.label} />
        )}
        {hero?.src && hero.label ? (
          <figcaption className="mt-3 text-center font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
            {hero.label}
          </figcaption>
        ) : null}
      </figure>

      {gallery.length ? (
        <ul aria-label="More images" className="m-0 mt-6 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3">
          {gallery.map((image, index) => (
            <li key={image.src ?? `slot-${index}`}>
              <figure className="m-0">
                {image.src ? (
                  <FigureButton figure={image} onOpen={open(image)} imageClassName="aspect-[4/3] w-full object-contain" />
                ) : (
                  <VisualSlot label={image.label} className="aspect-[4/3] p-4" />
                )}
                {image.src && image.label ? (
                  <figcaption className="mt-2 text-center text-xs leading-relaxed text-[var(--color-text-subtle)]">
                    {image.label}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

HeroMedia.propTypes = {
  images: PropTypes.arrayOf(imagePropType).isRequired,
  onOpenFigure: PropTypes.func.isRequired,
};

const StatsRow = ({ stats }) => (
  <dl className="m-0 mt-10 flex flex-wrap justify-center gap-4">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="flex min-w-0 basis-[calc(50%-0.5rem)] flex-col-reverse justify-end rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 text-center sm:flex-1 sm:basis-0"
      >
        <dt className="mt-2 font-mono text-xs uppercase leading-relaxed tracking-[0.06em] text-[var(--color-text-meta)]">
          {stat.label}
        </dt>
        <dd className="m-0 font-display text-3xl text-[var(--color-text-primary)]">
          <CountUpValue value={stat.value} />
        </dd>
      </div>
    ))}
  </dl>
);

StatsRow.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

const PagerLink = ({ study, direction }) => {
  const isNext = direction === "next";
  return (
    <Link
      to={`/work/${study.slug}`}
      className={`note-interactive group flex flex-col rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 no-underline transition-colors hover:border-[var(--color-border-hover)] ${
        isNext ? "sm:col-start-2 sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="eyebrow-label inline-flex items-center gap-2">
        {isNext ? null : <ArrowLeft size={14} aria-hidden="true" />}
        {isNext ? "Next case study" : "Previous case study"}
        {isNext ? <ArrowRight size={14} aria-hidden="true" /> : null}
      </span>
      <span className="mt-2 font-display text-xl leading-snug text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {study.title}
      </span>
      <span className="mt-1 text-sm text-[var(--color-text-subtle)]">
        {study.category} · {study.year}
      </span>
    </Link>
  );
};

PagerLink.propTypes = {
  study: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
  }).isRequired,
  direction: PropTypes.oneOf(["previous", "next"]).isRequired,
};

const CaseStudy = () => {
  const { slug } = useParams();
  const index = caseStudies.findIndex((s) => s.slug === slug);
  const study = caseStudies[index];
  const previous = caseStudies[index - 1];
  const next = index >= 0 ? caseStudies[index + 1] : undefined;

  const outline = useMemo(() => (study ? buildOutline(study) : { items: [], byPart: {} }), [study]);
  const showToc = outline.items.length >= TOC_MIN_SECTIONS;

  const articleRef = useRef(null);
  const readingProgress = useReadingProgress(articleRef, { enabled: Boolean(study), resetKey: slug });
  const activeId = useScrollSpy(
    outline.items.map((item) => item.id),
    { enabled: showToc },
  );

  const [lightbox, setLightbox] = useState(null);
  // The trigger is passed in, not read from document.activeElement: Safari doesn't focus buttons on click.
  const openFigure = useCallback(
    (figures, figureIndex, opener) => setLightbox({ figures, index: figureIndex, opener }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const stepLightbox = useCallback(
    (delta) =>
      setLightbox((current) =>
        current && { ...current, index: (current.index + delta + current.figures.length) % current.figures.length },
      ),
    [],
  );

  if (!study) return <Navigate to="/writing" replace />;

  const reflectionItems = study.whatIdDoDifferently ? toListItems(study.whatIdDoDifferently) : [];
  const renderSections = (part) =>
    outline.byPart[part].map((section) => (
      <AnalysisSection key={section.id} section={section} onOpenFigure={openFigure} className="mt-20" />
    ));

  return (
    <main className="bg-[var(--color-bg-base)]">
      <progress className="note-reading-progress" aria-label="Reading progress" max="100" value={readingProgress} />

      <div className="section-shell page-shell">
        <div className={showToc ? "lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-10" : undefined}>
          {showToc ? (
            <aside className="hidden lg:block">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto p-1.5">
                <TocRail items={outline.items} activeId={activeId} />
              </div>
            </aside>
          ) : null}

          <article key={study.slug} ref={articleRef} aria-labelledby="case-study-title" className="case-flow">
            <Link to="/writing" className="note-back-link note-interactive justify-self-start">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to writing
            </Link>

            {/* ── Header ── */}
            <header className="text-center">
              <p className="eyebrow-label eyebrow-pill mb-3">{`Case study ${index + 1} of ${caseStudies.length}`}</p>
              <h1
                id="case-study-title"
                className="m-0 text-balance font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl"
              >
                {study.title}
              </h1>
              {study.resultLine ? (
                <p className="mx-auto mb-0 mt-5 max-w-[40rem] text-balance font-display text-xl leading-snug text-[var(--color-text-primary)] md:text-2xl">
                  {study.resultLine}
                </p>
              ) : null}
              <p className="mx-auto mb-0 mt-5 max-w-[40rem] text-pretty text-lg leading-relaxed text-[var(--color-text-muted)]">
                {study.summary}
              </p>
              {study.externalLink ? (
                <a
                  href={study.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary note-interactive mt-7 inline-flex items-center gap-2 no-underline"
                >
                  View live
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </header>

            <GlanceStrip study={study} />
            {study.stats?.length ? <StatsRow stats={study.stats} /> : null}
            <HeroMedia images={study.images} onOpenFigure={openFigure} />
            {showToc ? <TocDetails items={outline.items} /> : null}

            {/* ── Context → constraints → what didn't work ── */}
            <PageSection id={FIXED_IDS.context} title="Context and problem">
              <StoryLead part={study.before} />
            </PageSection>
            {renderSections("context")}

            {study.constraints?.length || study.outOfScope?.length ? (
              <PageSection id={FIXED_IDS.constraints} title="Constraints">
                {study.constraints?.length ? (
                  <div className="mt-6">
                    <BulletList items={study.constraints} reveal />
                  </div>
                ) : null}
                {study.outOfScope?.length ? (
                  <div className={study.constraints?.length ? undefined : "mt-6"}>
                    <SubHeading>Out of scope</SubHeading>
                    <BulletList items={study.outOfScope} reveal />
                  </div>
                ) : null}
              </PageSection>
            ) : null}

            {study.failedApproaches?.length ? (
              <PageSection id={FIXED_IDS.failed} title="What didn't work">
                {study.failedApproaches.map((approach) => (
                  <StoryLead key={approach.title} part={approach} />
                ))}
              </PageSection>
            ) : null}

            {/* ── The approach → how it shipped ── */}
            <PageSection id={FIXED_IDS.approach} title="The approach">
              <StoryLead part={study.intervention} />
              {study.decisionsDefended?.length ? (
                <div>
                  <SubHeading>Decisions defended</SubHeading>
                  <BulletList items={study.decisionsDefended} reveal />
                </div>
              ) : null}
            </PageSection>
            {renderSections("approach")}

            {study.shipping?.length ? (
              <PageSection id={FIXED_IDS.shipping} title={study.shippingTitle ?? "How it shipped"}>
                <Paragraphs items={study.shipping} />
              </PageSection>
            ) : null}

            {/* ── Results → lessons → limits ── */}
            <PageSection id={FIXED_IDS.results} title="Results">
              <StoryLead part={study.after} card />
              {study.resultsTable ? <DataTable table={study.resultsTable} /> : null}
              {study.resultsNote ? (
                <div className="mt-8 border-l-2 border-[var(--color-border-hover)] pl-5">
                  <p className="eyebrow-label m-0">Where it fell short</p>
                  <p className="mb-0 mt-2 text-base leading-relaxed text-[var(--color-text-muted)]">{study.resultsNote}</p>
                </div>
              ) : null}
            </PageSection>
            {renderSections("results")}

            {study.lessons?.length ? (
              <PageSection id={FIXED_IDS.lessons} title="Lessons">
                <div className="mt-6">
                  <BulletList items={study.lessons} reveal />
                </div>
              </PageSection>
            ) : null}

            {renderSections("limits")}

            {study.whatIdDoDifferently ? (
              <PageSection id={FIXED_IDS.reflection} title="What I'd do differently">
                <div className="mt-6">
                  {reflectionItems.length > 1 ? (
                    <BulletList items={reflectionItems} />
                  ) : (
                    <p className="m-0 text-base leading-relaxed text-[var(--color-text-muted)]">{study.whatIdDoDifferently}</p>
                  )}
                </div>
              </PageSection>
            ) : null}

            {/* ── Previous / next ── */}
            {previous || next ? (
              <nav aria-label="More case studies" className="mt-20 grid gap-4 sm:grid-cols-2">
                {previous ? <PagerLink study={previous} direction="previous" /> : null}
                {next ? <PagerLink study={next} direction="next" /> : null}
              </nav>
            ) : null}

            <div className="mt-10 text-center">
              <Link to="/writing" className="btn-ghost note-interactive inline-flex items-center gap-2 no-underline">
                Browse all writing
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>

      {lightbox ? (
        <Lightbox
          figures={lightbox.figures}
          index={lightbox.index}
          opener={lightbox.opener}
          onClose={closeLightbox}
          onStep={stepLightbox}
        />
      ) : null}
    </main>
  );
};

export default CaseStudy;
