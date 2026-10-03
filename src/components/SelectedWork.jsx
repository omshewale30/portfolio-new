import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { caseStudies } from "../data/caseStudies";
import { cardReveal, revealOnView, staggerContainer } from "../utils/animations";
import SectionHeading from "./SectionHeading";

const pad = (n) => String(n).padStart(2, "0");

const SelectedWork = () => (
  <section id="selected-work" className="relative scroll-mt-20">
    <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-6 px-4 pb-20 pt-20 sm:px-6 lg:px-12 lg:pb-[88px] lg:pt-24">
      <SectionHeading
        eyebrow="Selected work"
        title="Systems built, then measured."
        lede="Measure the work removed, not the words generated."
        action={
          <Link to="/projects" className="btn-ghost">
            Archive
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <motion.div
        className="grid gap-4 md:grid-cols-2"
        variants={staggerContainer}
        {...revealOnView}
      >
        {caseStudies.map((study, index) => {
          const image = study.images[0];
          return (
            <motion.article key={study.slug} variants={cardReveal}>
              <Link
                to={`/work/${study.slug}`}
                className="group surface-hover flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
              >
                <div className="relative h-[220px] border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
                  {image?.src ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="figure-img absolute inset-0 h-full w-full object-contain px-[18px] pb-[18px] pt-10"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-[var(--color-text-meta)]">
                      {image?.label}
                    </span>
                  )}
                  {/* Hover preview: the summary and headline numbers */}
                  <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-[var(--color-bg-surface)] p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.96] group-focus-visible:opacity-[0.96]">
                    <p className="m-0 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{study.summary}</p>
                    <span className="flex gap-6">
                      {study.stats.slice(0, 2).map((stat) => (
                        <span key={stat.label} className="flex flex-col">
                          <span className="text-xl text-[var(--color-text-primary)]">{stat.value}</span>
                          <span className="text-[11px] text-[var(--color-text-subtle)]">{stat.label}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <span className="absolute left-4 top-3.5 font-mono text-[11px] text-[var(--color-text-meta)]">
                    [{pad(index + 1)}] {study.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-5 py-[18px]">
                  <h3 className="m-0 mr-auto text-lg font-normal tracking-[-0.015em] text-[var(--color-text-muted)] sm:text-xl">
                    {study.title}
                  </h3>
                  <span className="font-mono text-[11px] text-[var(--color-text-meta)]">{study.year}</span>
                  <ArrowUpRight size={16} className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
                </div>
                {/* Touch screens have no hover, so the summary sits under the title there. */}
                <p className="m-0 hidden px-5 pb-5 text-sm leading-relaxed text-[var(--color-text-subtle)] pointer-coarse:line-clamp-3">
                  {study.summary}
                </p>
              </Link>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default SelectedWork;
