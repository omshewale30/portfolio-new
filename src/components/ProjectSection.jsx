"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations"
import { caseStudies } from "../data/caseStudies"
import { supportingProjects, archivedProjects } from "../data/projects"

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ProjectsSection = () => {
  const [showArchive, setShowArchive] = useState(false)

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-[var(--color-bg-base)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(200, 168, 130, 0.08) 0%, transparent 44%), radial-gradient(circle at 80% 76%, rgba(200, 168, 130, 0.06) 0%, transparent 46%), radial-gradient(circle at 45% 56%, rgba(200, 168, 130, 0.04) 0%, transparent 52%)",
        }}
      />

      <div className="section-shell relative z-10">
        <motion.div
          className="text-center"
          style={{ marginBottom: "1.25rem" }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">{"// Projects"}</p>
          <h2 className="font-display mb-4 text-4xl italic tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            What I’ve Built
          </h2>
          <div
            className="divider-warm mb-12"
            style={{
              width: "100%",
              maxWidth: "48rem",
              margin: "0 auto 1.25rem auto",
              display: "block"
            }}
          />
        </motion.div>

        {/* ── Tier 1: Flagships ── */}
        <div className="mb-4 flex items-baseline justify-between">
          <p className="eyebrow-label">{"// Flagship case studies"}</p>
        </div>
        <motion.div
          className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {caseStudies.map((study) => (
            <motion.div
              key={study.slug}
              className="project-spotlight-card group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border-focus)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-glass)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-bg-elevated)]"
              variants={cardReveal}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)]" />
              <div className="relative z-[1] flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                  <span>{study.category}</span>
                  <span>{study.year}</span>
                </div>
                <h3 className="font-display mb-3 text-2xl leading-snug text-[var(--color-text-primary)]">
                  {study.title}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-7 text-[var(--color-text-muted)]">{study.summary}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="ai-badge">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/work/${study.slug}`}
                  className="font-mono mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-3 text-sm font-medium uppercase tracking-[0.08em] text-[var(--color-primary)] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-base)] hover:shadow-[var(--shadow-button)]"
                >
                  <span>Read case study</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tier 2: Supporting projects ── */}
        <div className="mb-4">
          <p className="eyebrow-label">{"// Supporting projects"}</p>
        </div>
        <motion.div
          className="mb-16 flex flex-col gap-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {supportingProjects.map((project) => (
            <motion.a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardReveal}
              className="project-preview-row group flex flex-col gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 no-underline transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <h3 className="font-display project-row-hover text-lg text-[var(--color-text-primary)]">
                    {project.title}
                  </h3>
                </div>
                <p className="mb-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono rounded-xl border border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)] px-2.5 py-1 text-xs uppercase tracking-[0.05em] text-[var(--color-text-subtle)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="font-mono inline-flex shrink-0 items-center gap-2 self-start text-xs uppercase tracking-[0.08em] text-[var(--color-primary)] sm:self-center">
                {project.linkText}
                <ExternalLinkIcon />
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* ── Tier 3: Archive ── */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowArchive((prev) => !prev)}
            aria-expanded={showArchive}
            aria-controls="project-archive"
            className="eyebrow-label flex items-center gap-2 bg-transparent p-0 transition-colors hover:text-[var(--color-primary)]"
          >
            {"// "}
            {showArchive ? "Hide" : "Show"} all projects ({archivedProjects.length})
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`transition-transform duration-300 ${showArchive ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {showArchive ? (
          <div
            id="project-archive"
            className="overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)]"
          >
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
                          className="font-mono inline-flex items-center gap-1.5 whitespace-nowrap text-xs uppercase tracking-[0.06em] text-[var(--color-primary)] no-underline transition-colors hover:text-[var(--color-primary-hover)]"
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
        ) : null}
      </div>
    </section>
  )
}

export default ProjectsSection
