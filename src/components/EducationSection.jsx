import React from "react";
import { GraduationCap, Rocket, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations";

const educationDetails = [
  {
    degree: "B.S in Computer Science",
    institution: "Arizona State University",
    years: "08/2020 – 05/2024",
    gpa: "4.0 / 4.0",
    transcriptLink: "../transcripts/ASU_Transcript.pdf",
    description: "Graduated Summa Cum Laude with the prestigious Moeur Award.",
    icon: GraduationCap,
  },
  {
    degree: "M.S in Computer Science",
    institution: "University of North Carolina at Chapel Hill",
    years: "08/2024 – 05/2026",
    gpa: "4.0 / 4.0",
    transcriptLink: "../transcripts/UNC_Transcript.pdf",
    description: "Focusing on LLMs and computer vision.",
    icon: Rocket,
  },
];

const EducationSection = () => {
  return (
    <section id="education" className="relative overflow-hidden bg-[var(--color-bg-base)]">
      <div className="section-shell relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">// Education</p>
          <h2 className="font-display mb-4 text-4xl text-[var(--color-text-primary)] md:text-5xl max-[480px]:text-3xl">
            Education
          </h2>
          <p className="mb-10 max-w-[30rem] text-[var(--color-text-muted)] md:mb-12">
            Academic background and focus areas
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 md:gap-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {educationDetails.map((edu, index) => {
            const Icon = edu.icon;
            return (
              <motion.div
                key={index}
                className="surface-card group relative flex min-h-[320px] flex-col overflow-hidden p-8 md:p-10 max-md:min-h-0 max-[480px]:p-6"
                variants={cardReveal}
              >
                <div className="mb-8 flex items-start justify-between gap-4 max-md:mb-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-105 md:h-16 md:w-16">
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <span className="rounded border border-[var(--color-border-subtle)] px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                    {edu.gpa} GPA
                  </span>
                </div>

                <h3 className="font-display mb-3 text-2xl tracking-tight text-[var(--color-text-primary)] md:mb-4 md:text-[1.9rem] max-[480px]:text-xl">
                  {edu.degree}
                </h3>
                <p className="mb-5 text-[1.05rem] text-[var(--color-primary)] md:mb-6 md:text-[1.15rem] max-[480px]:text-base">
                  {edu.institution}
                </p>

                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[0.07em] text-[var(--color-text-meta)] md:mb-7 max-md:mb-5">
                  <span className="flex items-center gap-2 text-[var(--color-text-meta)]">
                    <Calendar size={16} strokeWidth={2} />
                    {edu.years}
                  </span>
                </div>

                <p className="mb-8 flex-1 text-base leading-[1.75] text-[var(--color-text-muted)] md:mb-10 md:text-[1.05rem] md:leading-[1.8] max-[480px]:mb-6 max-[480px]:text-[0.95rem]">
                  {edu.description}
                </p>

                <a
                  href={edu.transcriptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex w-fit items-center gap-2.5 px-5 py-2.5 max-[480px]:text-sm"
                >
                  <ExternalLink size={18} strokeWidth={2} />
                  View transcript
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default EducationSection;
