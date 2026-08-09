import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { caseStudies } from "../data/caseStudies";
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations";

const SelectedWork = () => (
  <section id="selected-work" className="relative bg-[var(--color-bg-base)] scroll-mt-24">
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
          Three workflows, redesigned.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-muted)]">
          Each case study starts with the operating problem, shows the intervention, and ends with the evidence.
        </p>
      </motion.header>

      <motion.div
        className="grid gap-6 lg:grid-cols-3"
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
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
              variants={cardReveal}
            >
              <div className="relative flex min-h-48 flex-col justify-between overflow-hidden border-b border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)] p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(200,168,130,0.18),transparent_45%),linear-gradient(135deg,transparent,rgba(200,168,130,0.04))]" />
                <div className="relative z-10 flex items-center justify-between font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                  <span>[{String(index + 1).padStart(2, "0")}]</span>
                  <span>{study.category}</span>
                </div>
                {image?.src ? (
                  <>
                    <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg-elevated)] via-transparent to-[var(--color-bg-elevated)]/40" />
                  </>
                ) : (
                  <div className="relative z-10 mt-8 rounded-xl border border-dashed border-[var(--color-border-focus)] bg-[var(--color-bg-base)]/40 p-4">
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

                <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-[var(--color-border-muted)] py-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                      Before
                    </span>
                    <p className="mb-0 mt-1 text-xs leading-relaxed text-[var(--color-text-subtle)]">
                      {study.before.title}
                    </p>
                  </div>
                  <span aria-hidden="true" className="text-[var(--color-primary)]">
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
