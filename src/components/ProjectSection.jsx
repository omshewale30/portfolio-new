import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { cardReveal, easing, revealOnView, staggerContainer } from "../utils/animations"
import { caseStudies } from "../data/caseStudies"
import { supportingProjects, archivedProjects } from "../data/projects"
import SectionHeading from "./SectionHeading"

const ProjectsSection = () => {
  const [showArchive, setShowArchive] = useState(false)

  return (
    <main id="projects" className="bg-[var(--color-bg-base)]">
      <div className="section-shell page-shell">
        <SectionHeading as="h1" eyebrow="Projects" title="What I’ve built." className="mb-12 md:mb-14" />

        {/* ── Tier 1: Flagships ── */}
        <section aria-labelledby="flagships-heading" className="mb-16">
          <h2 id="flagships-heading" className="eyebrow-label eyebrow-pill mb-4">Flagship case studies</h2>
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            variants={staggerContainer}
            {...revealOnView}
          >
            {caseStudies.map((study) => (
              <motion.div key={study.slug} variants={cardReveal}>
                <Link
                  to={`/work/${study.slug}`}
                  className="group surface-hover flex h-full flex-col rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)]"
                >
                  <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                    <span>{study.category}</span>
                    <span>{study.year}</span>
                  </div>
                  <h3 className="font-display mb-3 text-2xl leading-snug text-[var(--color-text-primary)]">
                    {study.title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-7 text-[var(--color-text-muted)]">{study.summary}</p>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {study.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="ai-badge">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)] transition-colors group-hover:text-[var(--color-text-primary)]">
                    Read case study
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Tier 2: Supporting projects ── */}
        <section aria-labelledby="supporting-heading" className="mb-16">
          <h2 id="supporting-heading" className="eyebrow-label eyebrow-pill mb-4">Supporting projects</h2>
          <motion.div
            className="flex flex-col gap-3"
            variants={staggerContainer}
            {...revealOnView}
          >
            {supportingProjects.map((project) => (
              <motion.a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                variants={cardReveal}
                className="project-preview-row group flex flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 no-underline sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-display project-row-hover mb-1.5 text-lg text-[var(--color-text-primary)]">
                    {project.title}
                  </h3>
                  <p className="mb-2.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-subtle)]">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="ai-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-mono inline-flex shrink-0 items-center gap-2 self-start text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)] transition-colors group-hover:text-[var(--color-text-primary)] sm:self-center">
                  {project.linkText}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </motion.a>
            ))}
          </motion.div>
        </section>

        {/* ── Tier 3: Archive ── */}
        <section aria-labelledby="archive-heading">
          <h2 id="archive-heading" className="m-0 mb-4">
            <button
              type="button"
              onClick={() => setShowArchive((prev) => !prev)}
              aria-expanded={showArchive}
              aria-controls="project-archive"
              className="eyebrow-label eyebrow-pill"
            >
              {showArchive ? "Hide" : "Show"} all projects ({archivedProjects.length})
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`transition-transform duration-300 ${showArchive ? "rotate-180" : ""}`}
              />
            </button>
          </h2>

          <AnimatePresence initial={false}>
            {showArchive ? (
              <motion.div
                id="project-archive"
                key="archive"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: easing }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto rounded-[10px] border border-[var(--color-border-subtle)]">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Archived projects</caption>
                    <tbody>
                      {archivedProjects.map((project, i) => (
                        <tr
                          key={project.title}
                          className={i % 2 === 0 ? "bg-[var(--color-bg-surface)]" : "bg-[var(--color-bg-base)]"}
                        >
                          <td className="px-5 py-3 align-top">
                            <p className="font-display m-0 text-base text-[var(--color-text-primary)]">{project.title}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="font-mono text-xs uppercase tracking-[0.05em] text-[var(--color-text-meta)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right align-top">
                            {project.link ? (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono inline-flex items-center gap-1.5 whitespace-nowrap text-xs uppercase tracking-[0.06em] text-[var(--color-text-subtle)] no-underline transition-colors hover:text-[var(--color-text-primary)]"
                              >
                                {project.linkText || "View"}
                                <ArrowUpRight size={12} aria-hidden="true" />
                              </a>
                            ) : (
                              <span className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </main>
  )
}

export default ProjectsSection
