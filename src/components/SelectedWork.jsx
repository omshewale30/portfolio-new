import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { caseStudies } from "../data/caseStudies";
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations";

const SelectedWork = () => (
  <section id="selected-work" className="relative scroll-mt-24">
    <div className="section-shell">
      <motion.header
        className="mb-12 max-w-3xl"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <p className="eyebrow-label mb-3">{"// Selected work"}</p>
        <h2 className="font-display text-4xl leading-tight text-[var(--color-text-primary)] md:text-5xl">
          Systems built, then measured.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
          Each case study starts with the operating problem, shows the intervention, and ends with the evidence.
        </p>
      </motion.header>

      <motion.div
        className="grid gap-6 md:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {caseStudies.map((study, index) => {
          const image = study.images[0];
          return (
            <motion.article
              key={study.slug}
              className="group flex h-full flex-col overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)]"
              variants={cardReveal}
            >
              <div className="relative border-b border-[var(--color-border-strong)]">
                <div className="flex items-center justify-between px-5 py-3 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                  <span className="text-[var(--color-primary)]">Exp. {String(index + 1).padStart(2, "0")}</span>
                  <span>{study.category}</span>
                </div>
                {image?.src ? (
                  // Diagrams and charts are drawn on white, so the plate stays white in both themes.
                  <div className="flex h-48 items-center justify-center border-t border-[var(--color-border-subtle)] bg-white p-4">
                    <img src={image.src} alt={image.alt} className="max-h-full w-auto max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="mx-5 mb-5 mt-3 border border-dashed border-[var(--color-border-focus)] bg-[var(--color-bg-base)] p-4">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                      Visual slot
                    </span>
                    <p className="mb-0 mt-2 text-sm text-[var(--color-text-subtle)]">{image?.label}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                    {study.year}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-primary)]">
                    {study.stats[0].value} · {study.stats[0].label}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-3xl leading-tight text-[var(--color-text-primary)]">
                  {study.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {study.summary}
                </p>

                <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-[var(--color-border-subtle)] py-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                      Before
                    </span>
                    <p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--color-text-subtle)]">
                      {study.before.title}
                    </p>
                  </div>
                  <span aria-hidden="true" className="text-[var(--color-accent)]">
                    →
                  </span>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                      After
                    </span>
                    <p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--color-text-subtle)]">
                      {study.after.title}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="ai-badge">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/work/${study.slug}`}
                  className="mt-auto inline-flex items-center justify-between border-t border-[var(--color-border-muted)] pt-4 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)] no-underline transition-colors hover:text-[var(--color-primary-hover)]"
                >
                  Read case study
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <div className="mt-10">
        <Link to="/projects" className="btn-ghost inline-flex items-center gap-2 no-underline">
          Browse the full project archive
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);

export default SelectedWork;
