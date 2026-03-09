"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp } from "../utils/animations"

const experienceDetails = [
  {
    "title": "AI Intern",
    "company": "yAI",
    "location": "Remote - NYC, NY",
    "duration": "07/2025 – Present",
    "contributions": [
      "Engineered and optimized a proprietary Retrieval Augmented Generation (RAG) based AI tool for comprehensive financial analysis, significantly reducing the manual research time for investment banking and private equity firms from hundreds of hours to a matter of minutes.",
      "Spearheaded the design and deployment of the entire Azure cloud infrastructure, including implementing robust on-premises deployment solutions to ensure high availability, data security, and seamless integration for enterprise clients.",
      "Developed a novel, multi-faceted 5-way scoring system to provide a quantifiable quality assessment of AI-generated responses, enhancing model trustworthiness and accuracy by meticulously evaluating citation reliability and relevance.",
      "Collaborated with the founder to iterate on core product features, utilizing user feedback from financial analysts to improve the tool's performance and ensure its alignment with industry-specific needs and workflows."
    ],
    "technologies": [
      "Azure Cloud",
      "Python",
      "LangChain",
      "Retrieval Augmented Generation (RAG)",
      "Financial Technology (FinTech)",
      "Large Language Models (LLMs)"
    ],
    "image": "../assets/yAI.png",
    "type": "AI/development"
  },
  {
    "title": "Business Analyst",
    "company": "University of North Carolina - Chapel Hill",
    "location": "Chapel Hill, NC, USA",
    "duration": "09/2024 – Present",
    "contributions": [
      "Pioneered an AI-driven transformation by developing an enterprise RAG (Retrieval Augmented Generation) chatbot using LangChain and Azure OpenAI, projected to eliminate hundreds of hours of manual research annually by providing instant answers from ~600-page policy manuals.",
      "Drove a 35% boost in departmental efficiency by developing a Python automation tool to track pharmacy insurance payments and optimizing deposit workflows, increasing overall office productivity by 20%.",
      "Analyzed and streamlined core financial processes, such as payment tracking and deposit recording, by consolidating EDI reports and leveraging vector indexing for rapid transaction lookups.",
      "Managed and reconciled over $3M in weekly university deposits, ensuring 100% accuracy and strict compliance with financial policies to safeguard university operations."
    ],
    "technologies": [
      "Python", 
      "LangChain", 
      "Azure OpenAI", 
      "Excel", 
      "EDI", 
      "Business Process Improvement", 
      "Financial Reporting", 
      "Data Reconciliation"
    ],
    "image": "../assets/UNC_FO.jpeg",
    "type": "finance"
  },
  {
    title: "Lead Software Developer",
    company: "UNC Eshelman School of Pharmacy",
    location: "Chapel Hill, NC",
    duration: "10/2024 – 01/2025",
    contributions: [
      "Designed and developed a web-based 2D escape room game to enhance clinical education through interactive, puzzle-based learning.",
      "Led a team to implement core functionality using Flutter, laying the foundation for an engaging user experience.",
      "Developed an authoring tool to enable faculty to customize clinical content, supporting adaptable and scalable teaching methods across institutions.",
    ],
    technologies: ["Flutter", "Dart", "Web Development"],
    image: "../assets/UNC_Pharmacy.jpg",
    type: "development",
  },
  {
    title: "Software Developer",
    company: "NASA Psyche Mission",
    location: "Tempe, AZ",
    duration: "09/2023 – 04/2024",
    contributions: [
      "Collaborated as team lead on a web-based game promoting awareness of NASA's Psyche mission.",
      "Designed realistic space environments and incorporated authentic NASA data, enhancing project immersion.",
      "Delivered the project ahead of schedule, receiving positive feedback from NASA sponsors.",
    ],
    technologies: ["Unity", "Game Development", "C#"],
    image: "assets/Pysche_logo.png",
    report: "reports/nasa_project.pdf",
    type: "development",
  },
  {
    title: "Tutor",
    company: "Arizona State University",
    location: "Tempe, AZ",
    duration: "08/2021 – 05/2024",
    contributions: [
      "Provided comprehensive tutoring in Mathematics, Chemistry, Statistics, and programming languages such as Python and C++, emphasizing both theoretical understanding and practical application.",
      "Simplified complex topics into manageable concepts, creating a tailored approach to meet individual learning needs and enhance academic performance.",
    ],
    technologies: ["Mathematics", "Chemistry", "Python", "C++"],
    image: "../assets/ASN.png",
    type: "education",
  },
  {
    title: "Teaching Assistant",
    company: "Arizona State University",
    location: "Tempe, AZ",
    duration: "08/2022 – 05/2024",
    contributions: [
      "Mentored 100+ freshmen engineering students in Calculus, boosting academic performance with customized guidance programs.",
      "Delivered calculus concepts effectively, leveraging clear communication and hands-on problem-solving exercises.",
    ],
    technologies: ["Mentoring", "Teaching", "Calculus", "Engineering"],
    image: "../assets/ASU.png",
    type: "education",
  },
]

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
    <section id="experience" className="relative overflow-hidden bg-[var(--color-bg-base)] py-20 sm:py-32">
      <div className="section-shell relative z-10 max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div
          className="mb-16 md:mb-24"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">// Experience</p>
          <h2 className="font-display text-4xl tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            Where I've Built.
          </h2>
        </motion.div>

        {/* The group/list class enables the "dim other items on hover" effect on desktop */}
        <div className="group/list flex flex-col gap-12 sm:gap-16">
          {experienceDetails.map((exp, index) => {
            const isExpanded = Boolean(expandedCards[index])
            const firstTwoContributions = exp.contributions.slice(0, 2)
            const remainingContributions = exp.contributions.slice(2)

            return (
              <motion.article
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="group relative flex flex-col items-start gap-4 transition-all duration-300 sm:flex-row sm:gap-8 lg:hover:!opacity-100 lg:group-hover/list:opacity-50"
              >
                {/* Desktop hover background block (subtle glass/glow effect) */}
                <div className="absolute -inset-x-4 -inset-y-6 z-0 hidden rounded-2xl transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-[var(--color-bg-surface)] lg:group-hover:shadow-[inset_0_1px_0_0_var(--color-border-subtle)] lg:group-hover:ring-1 lg:group-hover:ring-[var(--color-border-focus)]/30" />

                {/* Left Column: Meta & Timeline */}
                <header className="z-10 mt-1 flex sm:w-1/4 sm:shrink-0 flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-meta)]">
                  <div className="font-mono text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                    {exp.duration}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-subtle)] flex items-center gap-1.5">
                    <span className="shrink-0">{getTypeIcon(exp.type)}</span>
                    {exp.location}
                  </div>

                  {/* Company Logo Image (hidden on smallest screens, visible on hover context) */}
                  {exp.image && (
                    <div className="mt-4 hidden sm:block">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-1.5 opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:border-[var(--color-primary)]/50">
                        <img 
                          src={exp.image} 
                          alt={`${exp.company} logo`} 
                          className="h-full w-full object-contain rounded-lg" 
                          loading="lazy" 
                        />
                      </div>
                    </div>
                  )}
                </header>

                {/* Right Column: Details */}
                <div className="z-10 sm:w-3/4">
                  <h3 className="font-display text-2xl font-medium leading-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {exp.title}
                  </h3>
                  <div className="mt-1 text-lg font-medium text-[var(--color-text-muted)]">
                    {exp.company}
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <ul className="space-y-3">
                      {firstTwoContributions.map((contribution, cIdx) => (
                        <li
                          key={`visible-${cIdx}`}
                          className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]/80 transition-colors"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />
                          <span>{contribution}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Smooth expanding area for remaining contributions */}
                    <AnimatePresence>
                      {isExpanded && remainingContributions.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="pt-3 flex flex-col gap-3">
                            {remainingContributions.map((contribution, cIdx) => (
                              <li
                                key={`hidden-${cIdx}`}
                                className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]/80 transition-colors"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity" />
                                <span>{contribution}</span>
                              </li>
                            ))}
                          </div>
                        </motion.ul>
                      )}
                    </AnimatePresence>

                    {remainingContributions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleContributions(index)}
                        className="group/btn mt-2 inline-flex w-fit items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] rounded-sm"
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
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
                    {exp.technologies.map((tech, techIndex) => (
                      <li
                        key={techIndex}
                        className="rounded-full border border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.03)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-subtle)] transition-colors duration-300 group-hover:border-[var(--color-border-focus)] group-hover:bg-[rgba(200,168,130,0.1)] group-hover:text-[var(--color-primary)]"
                      >
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
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        View Report
                      </a>
                    </div>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Experience