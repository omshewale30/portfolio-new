import PropTypes from "prop-types";
import { GraduationCap, Rocket, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardReveal } from "../utils/animations";

const educationDetails = [
  {
    degree: "M.S. Computer Science",
    institution: "University of North Carolina at Chapel Hill",
    years: "2024 – 2026",
    gpa: "4.0",
    transcriptLink: "/transcripts/UNC_Transcript.pdf",
    description: "Focusing on LLMs and computer vision.",
    icon: Rocket,
  },
  {
    degree: "B.S. Computer Science",
    institution: "Arizona State University",
    years: "2020 – 2024",
    gpa: "4.0",
    transcriptLink: "/transcripts/ASU_Transcript.pdf",
    description: "Graduated Summa Cum Laude with the Moeur Award.",
    icon: GraduationCap,
  },
];

// Compact (home): hairline rows. Full (experience page): the same rows with a heading, notes and transcripts.
const EducationSection = ({ compact = false }) => (
  <section id="education" aria-labelledby={compact ? undefined : "education-heading"} aria-label={compact ? "Education" : undefined} className="scroll-mt-20 bg-[var(--color-bg-base)]">
    <div className={`mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12 ${compact ? "pb-20 lg:pb-[88px]" : "py-20 lg:py-[88px]"}`}>
      {compact ? null : (
        <motion.div
          className="mb-8 flex flex-col gap-2"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label m-0">Education</p>
          <h2 id="education-heading" className="headline m-0 text-[32px] leading-tight text-[var(--color-text-primary)] sm:text-[40px]">
            Where the foundations came from.
          </h2>
        </motion.div>
      )}

      <motion.div
        className="grid gap-x-4 md:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {educationDetails.map((edu) => {
          const Icon = edu.icon;
          return (
            <motion.div
              key={edu.degree}
              className="flex flex-col gap-3 border-t border-[var(--color-border-subtle)] py-5"
              variants={cardReveal}
            >
              <div className="flex items-center gap-[18px]">
                <Icon size={22} strokeWidth={1.5} className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true" />
                <span className="mr-auto flex min-w-0 flex-col gap-0.5">
                  <span className="text-[17px] text-[var(--color-text-muted)]">{edu.degree}</span>
                  <span className="text-[13px] text-[var(--color-text-subtle)]">{edu.institution}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-[11px] text-[var(--color-text-meta)]">
                  <span className="text-[var(--color-text-muted)]">
                    {edu.gpa}
                    <span className="sr-only"> GPA</span>
                  </span>
                  {edu.years}
                </span>
              </div>
              {compact ? null : (
                <div className="flex flex-wrap items-center gap-3 pl-10">
                  <p className="m-0 mr-auto text-sm text-[var(--color-text-subtle)]">{edu.description}</p>
                  <a
                    href={edu.transcriptLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-text-meta)] transition-colors hover:text-[var(--color-text-primary)]"
                  >
                    transcript
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

EducationSection.propTypes = {
  compact: PropTypes.bool,
};

export default EducationSection;
