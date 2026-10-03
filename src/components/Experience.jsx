import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { experienceDetails } from "../data/experience"
import { easing, fadeInUp, revealOnView } from "../utils/animations"
import EducationSection from "./EducationSection"
import SectionHeading from "./SectionHeading"

const Experience = () => {
  const [expandedCards, setExpandedCards] = useState({})

  const toggleContributions = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  const getTypeIcon = (type) => {
    if (type.includes("development")) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    if (type.includes("finance")) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    if (type.includes("education")) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V10C2 10.5304 2.21071 11.0391 2.58579 11.4142C2.96086 11.7893 3.46957 12 4 12H20C20.5304 12 21.0391 11.7893 21.4142 11.4142C21.7893 11.0391 22 10.5304 22 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12V16C6 16.5304 6.21071 17.0391 6.58579 17.4142C6.96086 17.7893 7.46957 18 8 18H16C16.5304 18 17.0391 17.7893 17.4142 17.4142C17.7893 17.0391 18 16.5304 18 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    return null
  }

  return (
    <main id="experience" className="bg-[var(--color-bg-base)]">
      <div className="section-shell page-shell">
        <SectionHeading as="h1" eyebrow="Experience" title="Where I’ve worked." className="mb-12 md:mb-16" />

        {/* A timeline: each company logo is a node on one rail, so every role starts visibly.
            Phones: [node | title, company, dates, details]. sm+: [dates | node | title, details].
            group/list drives the dim-the-other-roles-on-hover effect on desktop. */}
        <ol className="group/list m-0 flex list-none flex-col gap-12 p-0 sm:gap-16">
          {experienceDetails.map((exp, index) => {
            const isExpanded = Boolean(expandedCards[index])
            const isLast = index === experienceDetails.length - 1
            const firstTwoContributions = exp.contributions.slice(0, 2)
            const remainingContributions = exp.contributions.slice(2)

            return (
              // The reveal sits on this wrapper: Framer leaves an inline opacity behind, which would
              // otherwise override the article's dim-the-others-on-hover opacity.
              <motion.li key={index} variants={fadeInUp} {...revealOnView}>
                <article
                  aria-labelledby={`role-${index}`}
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 transition-opacity duration-300 sm:grid-cols-[12.5rem_2.75rem_minmax(0,1fr)] sm:gap-x-6 lg:hover:!opacity-100 lg:group-hover/list:opacity-50"
                >
                  {/* Node: the company logo on the rail, with the line running down to the next role */}
                  <div className="relative col-start-1 row-span-3 row-start-1 sm:col-start-2 sm:row-span-2">
                    <span className="relative z-[1] flex h-10 w-10 items-center justify-center overflow-hidden rounded-[7px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-1 transition-colors duration-300 group-hover:border-[var(--color-border-hover)] sm:h-11 sm:w-11">
                      {exp.image ? (
                        <img src={exp.image} alt="" className="h-full w-full rounded-[4px] object-contain" loading="lazy" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[var(--color-text-meta)]" />
                      )}
                    </span>
                    {isLast ? null : (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-10 left-1/2 top-[3.25rem] w-px -translate-x-1/2 bg-[var(--color-border-hover)] sm:-bottom-14 sm:top-14"
                      />
                    )}
                  </div>

                  <header className="col-start-2 row-start-1 min-w-0 sm:col-start-3">
                    <h2 id={`role-${index}`} className="m-0 font-display text-xl leading-tight text-[var(--color-text-primary)] sm:text-2xl">
                      {exp.title}
                    </h2>
                    <p className="m-0 mt-1 text-[15px] leading-snug text-[var(--color-text-muted)] sm:text-lg">{exp.company}</p>
                  </header>

                  {/* Dates and place: under the title on phones, their own column beside the rail on sm+ */}
                  <div className="col-start-2 row-start-2 mt-2.5 flex flex-col items-start gap-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)] sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:mt-1.5 sm:items-end sm:gap-1.5 sm:text-right">
                    <span className={exp.current ? "text-[var(--color-text-primary)]" : undefined}>{exp.duration}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="shrink-0 text-[var(--color-text-meta)]">{getTypeIcon(exp.type)}</span>
                      {exp.location}
                    </span>
                  </div>

                  <div className="col-start-2 row-start-3 min-w-0 sm:col-start-3 sm:row-start-2">
                    <div className="mt-4 flex flex-col gap-3 sm:mt-5">
                      <ul className="space-y-3">
                        {firstTwoContributions.map((contribution, cIdx) => (
                          <li
                            key={`visible-${cIdx}`}
                            className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-subtle)] group-hover:text-[var(--color-text-muted)] transition-colors"
                          >
                            <span className="mt-[0.6rem] h-px w-2 shrink-0 bg-[var(--color-text-meta)]" aria-hidden="true" />
                            <span>{contribution}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Remaining contributions open beneath the first two */}
                      <AnimatePresence initial={false}>
                        {isExpanded && remainingContributions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: easing }}
                            className="overflow-hidden"
                          >
                            <ul className="flex flex-col gap-3 pt-3">
                              {remainingContributions.map((contribution, cIdx) => (
                                <li
                                  key={`hidden-${cIdx}`}
                                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-subtle)] group-hover:text-[var(--color-text-muted)] transition-colors"
                                >
                                  <span className="mt-[0.6rem] h-px w-2 shrink-0 bg-[var(--color-text-meta)]" aria-hidden="true" />
                                  <span>{contribution}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {remainingContributions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleContributions(index)}
                          className="group/btn mt-2 inline-flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] rounded-[5px]"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Show less" : "Read more"}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Tech Stack */}
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies used">
                      {exp.technologies.map((tech) => (
                        <li key={tech} className="ai-badge">
                          {tech}
                        </li>
                      ))}
                    </ul>

                    {/* Optional Report Link */}
                    {exp.report && (
                      <div className="mt-5">
                        <a
                          href={exp.report}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] rounded-[5px]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          View Report
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-24 lg:mt-32">
          <EducationSection />
        </div>
      </div>
    </main>
  )
}

export default Experience
