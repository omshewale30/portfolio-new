"use client"
import { useEffect } from "react"

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
    "image": "../assets/yAI.png", // Replace with actual image path
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
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
          }
        })
      },
      { threshold: 0.2 },
    )

    const cards = document.querySelectorAll(".experience-card")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case "development":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 18L22 12L16 6M8 6L2 12L8 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "finance":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "education":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22 10V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V10C2 10.5304 2.21071 11.0391 2.58579 11.4142C2.96086 11.7893 3.46957 12 4 12H20C20.5304 12 21.0391 11.7893 21.4142 11.4142C21.7893 11.0391 22 10.5304 22 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12V16C6 16.5304 6.21071 17.0391 6.58579 17.4142C6.96086 17.7893 7.46957 18 8 18H16C16.5304 18 17.0391 17.7893 17.4142 17.4142C17.7893 17.0391 18 16.5304 18 16V12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-[var(--color-bg-base)] py-16 sm:py-20"
    >
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-14 text-center sm:mb-20">
          <p className="eyebrow-label mb-3">// Experience</p>
          <h2 className="font-display mb-4 text-4xl tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            Professional Experience
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
            A journey through diverse roles in technology, education, and finance
          </p>
        </div>

        <div className="relative mx-auto max-w-[1000px]">
          <div className="absolute bottom-0 left-5 top-0 w-px rounded sm:left-1/2 sm:-translate-x-1/2 bg-[var(--color-border-subtle)]" />
          {experienceDetails.map((exp, index) => (
            <div
              key={index}
              className={`relative mb-10 w-full pl-16 sm:mb-14 sm:w-1/2 sm:pl-0 ${
                index % 2 === 0 ? "sm:pr-10" : "sm:left-1/2 sm:pl-10"
              }`}
            >
              <div
                className={`absolute top-8 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-primary)] sm:h-14 sm:w-14 ${
                  index % 2 === 0 ? "left-0 sm:-right-7 sm:left-auto" : "left-0 sm:-left-7"
                }`}
              >
                <div className="flex items-center justify-center">{getTypeIcon(exp.type)}</div>
              </div>

              <div className="experience-card relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 opacity-0 transition-all duration-500 ease-out hover:-translate-y-1 sm:p-8 translate-y-8">
                <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] sm:h-20 sm:w-20">
                    <img src={exp.image || "/placeholder.svg"} alt={`${exp.company} logo`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display mb-2 text-2xl leading-tight text-[var(--color-text-primary)]">{exp.title}</h3>
                    <h4 className="mb-3 text-xl font-medium text-[var(--color-primary)]">{exp.company}</h4>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">{exp.duration}</span>
                      <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">📍 {exp.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <ul className="mb-6 space-y-3">
                    {exp.contributions.map((contribution, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#c8a882"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{contribution}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {exp.report && (
                      <a
                        href={exp.report}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost inline-flex w-fit items-center gap-2 px-5 py-3 text-sm"
                      >
                        <span>View Report</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience
